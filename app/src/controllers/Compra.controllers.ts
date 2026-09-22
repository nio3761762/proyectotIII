import { Compra } from "../entities/Compra";
import { Detallecompra } from "../entities/DetalleCompra";
import { HttpError } from "../utils/error.handler";
import { generarIdSecuencial } from "../utils/idGenerator";
import { verifyComprobante } from "./Comprobante.controllers";
import { createDetalleCompra } from "./Detallecompra.controllers";
import { verifyProveedor } from "./Proveedor.controllers";
import { Request, Response } from "express";
import { AppDataSource } from "../db";
import { anularMovimientoInventario, createLoteInventario, registrarMovimientoEntrada, registrarMovimientoSalida, buscarInventarioProducto, buscarInventarioInsumo } from "./Inventario.controllers";
import { MovimientoInventario } from "../entities/MovimientoInventario";
import { getFechaHoraBolivia } from "../utils/Fecha";
import { verifyInsumoMedida } from "./Insumomedida.controllers";

export const verifyCompra = async ( IdCompra: string ) => {
  const existPaquete = await Compra.findOne({ where: { IdCompra: IdCompra } });

  if (!existPaquete) {
    throw new HttpError(404, `La compra con ID ${IdCompra} no existe.`);
  }

  return existPaquete;
};

export const registrarCompra = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const { Compras, detalles, Destinos } = req.body;

    const { fecha, hora } = getFechaHoraBolivia();

    const nuevoId = await generarIdSecuencial('COM');
    const compra = new Compra();
    compra.IdCompra = nuevoId;

    if (Compras.IdProveedor) compra.Proveedor = await verifyProveedor({ TipoproveedorId: Compras.IdProveedor });
    compra.FechaCompra = Compras.Fecha || fecha;
    compra.HoraCompra = hora;
    compra.NroComprobante = Compras.Numero || '';
    compra.Descripcion = Compras.Descripcion || '';
    compra.LugarCompra = Compras.LugarCompra || '';
    compra.PrecioTotal = Number(Compras.PrecioTotal) || 0;
    
    if(Compras.Comprobante)compra.Comprobante = await verifyComprobante(Compras.Comprobante);
    
    // Guardar la compra dentro de la transacción
    await queryRunner.manager.save(compra);

    // 3. Registrar Detalles de Compra
    if (detalles && detalles.length > 0) {
      for (const producto of detalles) {
        await createDetalleCompra(
          queryRunner,
          compra,
          producto.Cantidad, 
          producto.IdMedida, 
          Number(producto.Precio), 
          producto.Fecha
        );
      }
    }

    // 4. Registrar Destinos (Lotes e Inventario)
    if (Destinos && Destinos.length > 0) {
      for (const destinos of Destinos) {
        const medida = await verifyInsumoMedida({ PaqueteId: destinos.IdMedida });

        const cantidadFinal = destinos.IdInsumo
          ? Number(destinos.Cantidad) * (Number(destinos.CantidadMedida) || 1)
          : Number(destinos.Cantidad);

        const costoTotal = destinos.IdInsumo ? Number(destinos.Cantidad) * Number(destinos.PrecioInsumo) : 0;
        const costoUnitario = costoTotal > 0 ? costoTotal / cantidadFinal : 0;
        const precioUnitario = destinos.IdInsumo ? Number(destinos.PrecioInsumo) : 0;

        await createLoteInventario(
          queryRunner,
          destinos.IdProducto,
          destinos.IdInsumo,
          cantidadFinal,
          costoUnitario,
          destinos.IdSucursal,
          'ENTRADA_COMPRA',
          nuevoId,
          precioUnitario,
          destinos.IdInsumo ? Number(destinos.Cantidad) : undefined,
          medida.Unidadmedida.IdUnidadMedida
        );
      }
    }


    // 5. Confirmar transacción
    await queryRunner.commitTransaction();
    return res.status(201).json({ message: "La Compra se registro correctamente", idCompra: nuevoId });

  } catch (error) {
    // 6. Revertir cambios en caso de error
    await queryRunner.rollbackTransaction();

    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ 
      message: 'Error interno del servidor', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  } finally {
    // 7. Liberar conexión
    await queryRunner.release();
  }
};
export const anularCompra = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const { id } = req.params;

    await queryRunner.manager.query(
      `UPDATE compra 
       SET estado = 0
       WHERE IdCompra = $1`,
      [id]);
    
    await anularMovimientoInventario(queryRunner, id, 'ENTRADA_COMPRA');

    await queryRunner.commitTransaction();
    return res.json({
      message: `Se anulo la compra correctamente`,
    });
  } catch (error) {
    await queryRunner.rollbackTransaction();
    if (error instanceof HttpError) {
      res.status(error.statusCode).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
  } finally {
    await queryRunner.release();
  }
};

export const updateCompra = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const { id } = req.params;
    const { Compras, detalles, Destinos } = req.body;

    const { fecha, hora } = getFechaHoraBolivia();

    const compra = await queryRunner.manager.findOne(Compra, {
      where: { IdCompra: id }
    });
    if (!compra) throw new HttpError(404, `La compra con ID ${id} no existe.`);

    // --- INVENTARIO: registro único por (producto|insumo, sucursal) ---
  // Se ajusta el registro único sumando/restando la diferencia entre lo nuevo y
  // lo anteriormente aportado por esta compra (según movimientos ENTRADA_COMPRA).

  const movimientosCompra = await queryRunner.manager.find(MovimientoInventario, {
    where: { IdReferencia: id, Tipo: "ENTRADA_COMPRA" },
    relations: ["Inventario", "Inventario.Producto", "Inventario.Insumo", "Inventario.Sucursal"]
  });

  type Aporte = { key: string; idProducto?: string; idInsumo?: string; idSucursal: string; total: number };
  const aportadoPorCompra = new Map<string, Aporte>();

  for (const mov of movimientosCompra) {
    const inv = mov.Inventario;
    if (!inv) continue;
    const idSucursal = inv.Sucursal?.IdSucursal || "";
    const idProducto = inv.Producto?.IdProducto;
    const idInsumo = inv.Insumo?.IdInsumo;
    const key = idProducto
      ? `P_${idProducto}_${idSucursal}`
      : idInsumo
        ? `I_${idInsumo}_${idSucursal}`
        : "";
    if (!key) continue;
    const prev = aportadoPorCompra.get(key) || { key, idProducto, idInsumo, idSucursal, total: 0 };
    prev.total += (Number(mov.Cantidad) || 0);
    aportadoPorCompra.set(key, prev);
  }

  const activos = new Set<string>();

  for (const destino of Destinos) {
    const medida = await verifyInsumoMedida({ PaqueteId: destino.IdMedida });

    const cantidadFinal = destino.IdInsumo
      ? Number(destino.Cantidad) * (Number(destino.CantidadMedida) || 1)
      : Number(destino.Cantidad);

    const costoTotal = destino.IdInsumo ? Number(destino.Cantidad) * Number(destino.PrecioInsumo) : 0;
    const costoUnitario = cantidadFinal > 0 ? costoTotal / cantidadFinal : 0;
    const precioUnitario = destino.IdInsumo ? Number(destino.PrecioInsumo) : 0;

    const key = destino.IdInsumo
      ? `I_${destino.IdInsumo}_${destino.IdSucursal}`
      : `P_${destino.IdProducto}_${destino.IdSucursal}`;
    activos.add(key);

    const registro = destino.IdInsumo
      ? await buscarInventarioInsumo(queryRunner, destino.IdInsumo, destino.IdSucursal)
      : await buscarInventarioProducto(queryRunner, destino.IdProducto, destino.IdSucursal);

    const aportado = aportadoPorCompra.get(key)?.total || 0;
    const diferencia = cantidadFinal - aportado;

    if (!registro) {
      if (cantidadFinal > 0) {
        await createLoteInventario(
          queryRunner,
          destino.IdProducto,
          destino.IdInsumo,
          cantidadFinal,
          costoUnitario,
          destino.IdSucursal,
          "ENTRADA_COMPRA",
          id,
          precioUnitario,
          destino.IdInsumo ? Number(destino.Cantidad) : undefined,
          medida.Unidadmedida.IdUnidadMedida
        );
      }
      continue;
    }

    const stockAnterior = Number(registro.Stock);

    if (diferencia > 0) {

      // Incremento (con costo promedio ponderado)
      registro.Stock = stockAnterior + diferencia;
      const costAct = Number(registro.CostoUnitario) || 0;
      registro.CostoUnitario = (stockAnterior * costAct + diferencia * costoUnitario) / (stockAnterior + diferencia);
      if (registro.Stock > 0) registro.Estado = 1;
      await queryRunner.manager.save(registro);

      await registrarMovimientoEntrada(
        queryRunner,
        registro,
        "ENTRADA_COMPRA",
        id,
        diferencia
      );

    } else if (diferencia < 0) {

      const aReducir = Math.abs(diferencia);
      if (stockAnterior < aReducir) {
        throw new HttpError(400, `No se puede reducir la compra: el stock en la sucursal es menor (Disponible: ${stockAnterior}).`);
      }

      registro.Stock = stockAnterior - aReducir;
      if (registro.Stock <= 0) {
        registro.Stock = 0;
        registro.Estado = 0;
      }
      registro.CostoUnitario = costoUnitario;
      registro.Preciounitario = precioUnitario;
      await queryRunner.manager.save(registro);

      await registrarMovimientoSalida(
        queryRunner,
        registro,
        "SALIDA_AJUSTE",
        aReducir,
        id
      );

    } else {

      // Misma cantidad: solo actualizar costos/precio de referencia
      registro.CostoUnitario = costoUnitario;
      registro.Preciounitario = precioUnitario;
      await queryRunner.manager.save(registro);
    }
  }

// Destinos eliminados de la compra: revertir lo que esa compra había aportado
for (const aporte of aportadoPorCompra.values()) {
  if (activos.has(aporte.key)) continue;
  if (aporte.total <= 0) continue;

  const registro = aporte.idProducto
    ? await buscarInventarioProducto(queryRunner, aporte.idProducto, aporte.idSucursal)
    : await buscarInventarioInsumo(queryRunner, String(aporte.idInsumo), aporte.idSucursal);

  if (!registro) continue;

  const stock = Number(registro.Stock);
  const aReducir = Math.min(aporte.total, stock);
  if (aReducir <= 0) continue;

  registro.Stock = stock - aReducir;
  if (registro.Stock <= 0) {
    registro.Stock = 0;
    registro.Estado = 0;
  }
  await queryRunner.manager.save(registro);

  await registrarMovimientoSalida(
    queryRunner,
    registro,
    "SALIDA_AJUSTE",
    aReducir,
    id
  );
}

    // --- FIN INVENTARIO ---

    // Eliminar detalles anteriores
    await queryRunner.manager.delete(Detallecompra, { Compra: { IdCompra: id } });

    // Actualizar cabecera
    if (Compras.IdProveedor) {
      compra.Proveedor = await verifyProveedor({ TipoproveedorId: Compras.IdProveedor });
    } 
    compra.FechaCompra = Compras.Fecha || fecha;
    compra.HoraCompra = hora;
    compra.NroComprobante = Compras.Numero || '';
    compra.Descripcion = Compras.Descripcion || '';
    compra.LugarCompra = Compras.LugarCompra || '';
    compra.PrecioTotal = Number(Compras.PrecioTotal) || 0;

    if (Compras.Comprobante) {
      compra.Comprobante = await verifyComprobante(Compras.Comprobante);
    }

    await queryRunner.manager.save(compra);

    // Registrar nuevos detalles
    if (detalles && detalles.length > 0) {
      for (const producto of detalles) {
        await createDetalleCompra(
          queryRunner,
          compra,
          producto.Cantidad,
          producto.IdMedida,
          Number(producto.Precio),
          producto.Fecha
        );
      }
    }

    await queryRunner.commitTransaction();
    return res.json({ message: "La Compra se actualizó correctamente", idCompra: id });

  } catch (error) {
    await queryRunner.rollbackTransaction();

    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  } finally {
    await queryRunner.release();
  }
};

export const getCompras = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  try {
    const {
      search,
      fecha,
      estado,
      page = 1,
      limit = 8
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const result = await queryRunner.query(
      `
      WITH compras_filtradas AS (
        SELECT *
        FROM compra c
        WHERE 
          ($1::text IS NULL OR (
            EXISTS (
              SELECT 1 
              FROM proveedor p
              LEFT JOIN persona per ON per.idpersona = p.idpersona
              WHERE p.idproveedor = c.idproveedor
              AND (
                per.nombre ILIKE '%' || $1 || '%' 
                OR p.razonsocial ILIKE '%' || $1 || '%'
              )
            )
            OR c.lugarcompra ILIKE '%' || $1 || '%'
          ))
          AND ($2::date IS NULL OR c.fechacompra = $2)
          AND ($3::int IS NULL OR c.estado = $3)
      )

      SELECT 
        c.idcompra,
        c.nrocomprobante,
        c.preciototal,
        c.fechacompra,
        c.horacompra,
        c.descripcion,
        c.lugarcompra,
        c.estado,

        COUNT(*) OVER() AS total,

        -- 🟢 COMPROBANTE
        json_build_object(
          'idcomprobante', comp.idcomprobante,
          'nombre', comp.nombre
        ) AS comprobante,

        -- 🟢 PROVEEDOR
        CASE WHEN p.idproveedor IS NOT NULL THEN
          json_build_object(
            'idproveedor', p.idproveedor,
            'razonsocial', p.razonsocial,
            'nit', p.nit,
            'estado', p.estado,
            'tipoproveedor', json_build_object(
              'idtipoproveedor', tp.idtipoproveedor,
              'nombre', tp.nombre
            ),
            'persona', json_build_object(
              'nombre', per.nombre,
              'apellidopaterno', per.apellidopaterno,
              'apellidomaterno', per.apellidomaterno,
              'email', per.email,
              'imagen', per.imagen
            )
          )
        ELSE NULL END AS proveedor,

        -- 🟢 DETALLES
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'iddetallecompra', dc.iddetallecompra,
              'cantidad', dc.cantidad,
              'precio', dc.precio,
              'preciototal', dc.preciototal,
              'fechavencimiento', dc.fechavencimiento,

              'insumo', json_build_object(
                'idinsumo', i.idinsumo,
                'nombre', i.nombre,
                'descripcion', i.descripcion,
                'imagen', i.imagen
              ),

              'insumomedida', json_build_object(
                'idinsumomedida', im.idinsumomedida,
                'cantidad', im.cantidad,
              
                'unidadmedida', json_build_object(
                  'nombre', um.nombre,
                  'equivalente', um.cantidad,
                  'abreviatura', um.abreviatura
                )
              )
            )
          ) FILTER (WHERE dc.iddetallecompra IS NOT NULL),
          '[]'
        ) AS detalles,

        -- 🟢 DESTINOS (inventario)
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'idinventario', inv.idinventario,
              'stock', inv.stock,
              'cantidad', inv.cantidad,
              'costounitario', inv.costounitario,
              'preciounitario', inv.preciounitario,

              'insumo', CASE WHEN inv.idinsumo IS NOT NULL THEN
                json_build_object(
                  'idinsumo', i2.idinsumo,
                  'nombre', i2.nombre
                )
              ELSE NULL END,

              'producto', CASE WHEN inv.idproducto IS NOT NULL THEN
                json_build_object(
                  'idproducto', pr2.idproducto,
                  'nombre', pr2.nombre
                )
              ELSE NULL END,

              'sucursal', json_build_object(
                'idsucursal', s2.idsucursal,
                'nombre', s2.nombre
              )
            )
          ) FILTER (WHERE inv.idinventario IS NOT NULL),
          '[]'
        ) AS destinos

      FROM compras_filtradas c

      LEFT JOIN comprobante comp 
        ON comp.idcomprobante = c.idcomprobante

      LEFT JOIN proveedor p 
        ON p.idproveedor = c.idproveedor

      LEFT JOIN tipoproveedor tp 
        ON tp.idtipoproveedor = p.idtipoproveedor

      LEFT JOIN persona per 
        ON per.idpersona = p.idpersona

      LEFT JOIN detallecompra dc 
        ON dc.idcompra = c.idcompra

      LEFT JOIN insumo i 
        ON i.idinsumo = dc.idinsumo

      LEFT JOIN insumomedida im 
        ON im.idinsumomedida = dc.idinsumomedida

      LEFT JOIN unidadmedida um 
        ON um.idunidadmedida = im.idunidadmedida

      LEFT JOIN inventario inv
        ON inv.idreferencia = c.idcompra AND inv.tipoorigen = 'ENTRADA_COMPRA'

      LEFT JOIN sucursal s2
        ON s2.idsucursal = inv.idsucursal

      LEFT JOIN insumo i2
        ON i2.idinsumo = inv.idinsumo

      LEFT JOIN producto pr2
        ON pr2.idproducto = inv.idproducto

      GROUP BY 
         c.idcompra,
	c.nrocomprobante,
	c.preciototal,
	c.fechacompra,
	c.horacompra,
	c.descripcion,
	c.lugarcompra,
	c.estado,
  comp.idcomprobante,
  p.idproveedor,
  tp.idtipoproveedor,
  per.idpersona

      ORDER BY c.fechacompra DESC
      LIMIT $4 OFFSET $5;
      `,
      [
        search || null,
        fecha || null,
        estado !== undefined ? Number(estado) : null,
        Number(limit),
        offset
      ]
    );

    // 🔥 si no hay datos
    if (result.length === 0) {
      return res.json({
        total: 0,
        page: Number(page),
        limit: Number(limit),
        data: []
      });
    }

    return res.json({
      total: Number(result[0].total),
      page: Number(page),
      limit: Number(limit),
      data: result
    });

  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : error
    });
  } finally {
    await queryRunner.release();
  }
};
export const getCompra = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  try {
    const {id} = req.params;
    const pagos = await queryRunner.manager.findOne(Compra, { 
      where:{IdCompra:id},
      relations:
        [
          "Proveedor",
          "Proveedor.Persona",
          "Comprobante",
          "Detallecompra",
          "Detallecompra.Productomedida"
        ]
    });
       return res.json(pagos)
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message })
    }
  } finally {
    await queryRunner.release();
  }
}

