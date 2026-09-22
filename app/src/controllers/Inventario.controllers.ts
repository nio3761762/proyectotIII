import { Request, Response } from "express";
import { QueryRunner } from "typeorm";
import { Inventario } from "../entities/Inventario";
import { MovimientoInventario } from "../entities/MovimientoInventario";
import { BajaProducto } from "../entities/BajaProducto";
import { Sucursal } from "../entities/Sucursal";
import { generarIdSecuencial } from "../utils/idGenerator";
import { verifyInsumo } from "./Insumo.controllers";
import { verifyProducto } from "./Producto.controllers";
import { verifySucursal } from "./Sucursal.controllers";
import { verifyUnidadMedida } from "./Medida.controllers";
import { AppDataSource } from "../db";
import { Productomedida } from "../entities/ProductoMedida";
import { HttpError } from "../utils/error.handler";
import { Promocion } from "../entities/Promocion";
import { verifyProductoMedida } from "./ProductoMedida.controllers";
import { getFechaHoraBolivia } from "../utils/Fecha";

export const createLoteInventario = async (
   queryRunner: QueryRunner,
  idProducto: string | null,
  idInsumo: string | null,
  stockBase: number | 0,
  costoUnitario: number,
  idSucursal: string,
  tipoOrigen: string,
  idReferencia: string,
  precioUnitario: number,
  cantidadOriginal?: number,
  idUnidadMedida?: number,

) => {
  const { fecha } = getFechaHoraBolivia();
  const stock = Number(stockBase);
  const hasProducto = !!idProducto;
  const hasInsumo = !!idInsumo;
  if (!hasProducto && !hasInsumo) return;

  // UN registro por producto/insumo + sucursal
  let registro = hasProducto
    ? await buscarInventarioProducto(queryRunner, idProducto as string, idSucursal)
    : await buscarInventarioInsumo(queryRunner, idInsumo as string, idSucursal);

  const costo = Number(costoUnitario) || 0;
  const precio = Number(precioUnitario) || 0;

  if (!registro && stock <= 0) return;

  if (!registro) {
    registro = new Inventario();
    registro.IdInventario = await generarIdSecuencial("INV", queryRunner);
    registro.Stock = stock;
    registro.CostoUnitario = costo;
    registro.Preciounitario = precio;
    registro.FechaIngreso = fecha;
    registro.TipoOrigen = tipoOrigen;
    registro.IdReferencia = idReferencia;
    registro.Estado = 1;
    if (cantidadOriginal) registro.Cantidad = cantidadOriginal;
    if (idUnidadMedida) {
      registro.Unidadmedida = await verifyUnidadMedida({ UnidadMedidaId: idUnidadMedida });
    }
    registro.Sucursal = await verifySucursal({ SucursalId: idSucursal });
    if (hasProducto) {
      registro.Producto = await verifyProducto({ ProductoId: idProducto as string });
    }
    if (hasInsumo) {
      registro.Insumo = await verifyInsumo({ ProductoId: idInsumo as string });
    }
  } else {
    // Solo se actualizan cantidad (incremento) y costo (promedio ponderado)
    const stockAnterior = Number(registro.Stock) || 0;
    const costoAnterior = Number(registro.CostoUnitario) || 0;
    const nuevoStock = stockAnterior + stock;
    registro.Stock = nuevoStock;
    registro.CostoUnitario = nuevoStock > 0
      ? (stockAnterior * costoAnterior + stock * costo) / nuevoStock
      : costo;
    if (cantidadOriginal !== undefined) {
      registro.Cantidad = Number(registro.Cantidad) + Number(cantidadOriginal);
    }
    if (precio && !registro.Preciounitario) registro.Preciounitario = precio;
    if (registro.Stock > 0) registro.Estado = 1;
    if (tipoOrigen) registro.TipoOrigen = tipoOrigen;
    if (idReferencia) registro.IdReferencia = idReferencia;
  }

  await queryRunner.manager.save(registro);

  // Solo registrar movimiento si realmente ingresó cantidad
  if (stock > 0) {
    await registrarMovimientoEntrada(queryRunner, registro, tipoOrigen, idReferencia, stock);
  }
};

export const registrarMovimientoEntrada = async (
  queryRunner: QueryRunner,
  lote: Inventario,
  tipo: string,
  idReferencia: string,
  cantidad?: number
) => {

  const mov = new MovimientoInventario();

  const { fecha } = getFechaHoraBolivia();
  mov.IdMovimiento = await generarIdSecuencial("MOINV", queryRunner);
  mov.Tipo = tipo;
  mov.Cantidad = cantidad !== undefined ? cantidad : lote.Stock;
  mov.CostoUnitario = lote.CostoUnitario;
  mov.CostoTotal = Number(mov.Cantidad) * Number(lote.CostoUnitario);
  mov.Fecha = fecha;
  mov.Sucursal = lote.Sucursal;
  mov.IdReferencia = idReferencia;
  mov.Inventario = lote;

  if (lote.Insumo) mov.Insumo = lote.Insumo;
  if (lote.Producto) mov.Producto = lote.Producto;

   await queryRunner.manager.save(mov);
};


export const anularMovimientoInventario = async (queryRunner: QueryRunner, idCompra: string, entrada: string) => {

  // 🔥 1. buscar movimientos de compra
  const movimientos = await queryRunner.manager.find(MovimientoInventario, {
    where: {
      IdReferencia: idCompra,
      Tipo: entrada
    },
    relations: ["Inventario", "Sucursal", "Insumo", "Producto"]
  });

  if (movimientos.length === 0) {
    throw new Error("No hay movimientos para esta compra");
  }

  for (const mov of movimientos) {

    const registro = mov.Inventario;

    if (!registro) continue;

    const cantidad = Number(mov.Cantidad);

    // 🔥 VALIDACIÓN
    if (Number(registro.Stock) < cantidad) {
      throw new Error(
        `No puedes anular la compra. El stock del producto ya fue consumido`
      );
    }

    // 🔴 2. revertir inventario (decrementar el registro único)
    registro.Stock = Number(registro.Stock) - cantidad;
    if (registro.Stock <= 0) {
      registro.Stock = 0;
      registro.Estado = 0;
    }
    await queryRunner.manager.save(registro);

    // 🔴 3. registrar movimiento inverso
    const reverso = new MovimientoInventario();

    reverso.IdMovimiento = await generarIdSecuencial("MOINV", queryRunner);
    reverso.Tipo = "ANULAR_COMPRA";
    reverso.Cantidad = -cantidad;
    reverso.CostoUnitario = Number(mov.CostoUnitario);
    reverso.CostoTotal = -Number(mov.CostoTotal);
    reverso.Fecha = new Date();
    reverso.Sucursal = mov.Sucursal;
    reverso.IdReferencia = idCompra;
    reverso.Inventario = registro;

    if (mov.Insumo) reverso.Insumo = mov.Insumo;
    if (mov.Producto) reverso.Producto = mov.Producto;

    await queryRunner.manager.save(reverso);
  }

  return {
    message: "Inventario revertido correctamente"
  };
};

export const registrarMovimientoSalida = async (
  queryRunner: QueryRunner,
  lote: Inventario,
  tipo: string,
  cantidad: number,
  id: string
) => {

  const mov = new MovimientoInventario();

  mov.IdMovimiento = await generarIdSecuencial("MOINV", queryRunner);
  mov.Tipo = tipo;
  mov.Cantidad = -cantidad; // Salida es negativa
  mov.CostoUnitario = lote.CostoUnitario;
  mov.CostoTotal = -Number(cantidad) * Number(lote.CostoUnitario);
  mov.Fecha = new Date();
  mov.Sucursal = lote.Sucursal;
  mov.Inventario = lote;
  mov.IdReferencia = id

  if (lote.Insumo) mov.Insumo = lote.Insumo;
  if (lote.Producto) mov.Producto = lote.Producto;

    await queryRunner.manager.save(mov);
};


/**
 * 🔥 NUEVO MODELO: UN registro por (producto|insumo + sucursal).
 * Solo se actualiza la cantidad (Stock), con incremento o decremento.
 */
export const buscarInventarioProducto = async (queryRunner: QueryRunner, idProducto: string, idSucursal: string) => {
  return queryRunner.manager.findOne(Inventario, {
    where: {
      Sucursal: { IdSucursal: idSucursal },
      Producto: { IdProducto: idProducto }
    },
    relations: ["Sucursal", "Producto", "Insumo"]
  });
};

export const buscarInventarioInsumo = async (queryRunner: QueryRunner, idInsumo: string, idSucursal: string) => {
  return queryRunner.manager.findOne(Inventario, {
    where: {
      Sucursal: { IdSucursal: idSucursal },
      Insumo: { IdInsumo: idInsumo }
    },
    relations: ["Sucursal", "Producto", "Insumo"]
  });
};

export const getInventario = async (req: Request, res: Response) => {
  try {

    const {
      id,
      search = '',
      categoria,
      subcategoria,
      page = 1,
      limit = 10
    } = req.query;

    if (!id) {
      return res.status(400).json({
        message: "ID de sucursal requerido"
      });
    }

    const currentPage = Number(page);
    const currentLimit = Number(limit);
    const offset = (currentPage - 1) * currentLimit;

    const result = await AppDataSource.query(
      `
      SELECT 
        pro.idproducto,
        pro.nombre,
        pro.imagen,
        pro.descripcion,

        -- 🔥 SOLO NOMBRES
        cat.nombre AS categoria,
        sub.nombre AS subcategoria,

        -- 🔥 REGISTRO ÚNICO POR (PRODUCTO, SUCURSAL)
        COALESCE(inv.stock, 0) AS cantidad,
        inv.estado AS estado,
        COALESCE(inv.costounitario, 0) AS costounitario,
        COALESCE(inv.preciounitario, 0) AS preciounitario,

        COUNT(*) OVER() AS total,

        -- 🔥 MEDIDAS
        COALESCE(
          JSON_AGG(
            DISTINCT JSONB_BUILD_OBJECT(
              'idproductomedida', pm.idproductomedida,
              'cantidad', pm.cantidad,
              'precioventa', pm.precioventa,
              'preciomayor', pm.preciomayor,
              'comision', pm.comision,
              'imagen', pm.imagen,
              'estado', pm.estado,

              'presentacion', json_build_object(
                'idpresentacion', pre.idpresentacion,
                'nombre', pre.nombre
              )
            )
          ) FILTER (WHERE pm.idproductomedida IS NOT NULL),
          '[]'
        ) AS medidas

      FROM producto pro

      LEFT JOIN subcategoria sub 
        ON sub.idsubcategoria = pro.idsubcategoria

      LEFT JOIN categoria cat
        ON cat.idcategoria = sub.idcategoria

      INNER JOIN inventario inv
        ON inv.idproducto = pro.idproducto
        AND inv.idsucursal = $1
        AND inv.estado = 1

      LEFT JOIN productomedida pm
        ON pm.idproducto = pro.idproducto
        AND pm.estado = 1

      LEFT JOIN presentacion pre
        ON pre.idpresentacion = pm.idpresentacion

      WHERE
        pro.nombre ILIKE $2
        AND ($3::text IS NULL OR cat.idcategoria = $3)
        AND ($4::text IS NULL OR sub.idsubcategoria = $4)

      GROUP BY
        pro.idproducto,
        pro.nombre,
        pro.imagen,
        pro.descripcion,
        cat.nombre,
        sub.nombre,
        inv.stock,
        inv.estado,
        inv.costounitario,
        inv.preciounitario

      ORDER BY pro.nombre ASC

      LIMIT $5
      OFFSET $6
      `,
      [
        id,
        `%${search}%`,
        categoria || null,
        subcategoria || null,
        currentLimit,
        offset
      ]
    );

    if (result.length === 0) {
      return res.json({
        total: 0,
        page: currentPage,
        limit: currentLimit,
        totalPages: 0,
        result: []
      });
    }

    const total = Number(result[0].total);

    return res.json({
      total,
      page: currentPage,
      limit: currentLimit,
      totalPages: Math.ceil(total / currentLimit),
      result
    });

  } catch (error) {

    console.error(error);

    if (error instanceof Error) {
      return res.status(500).json({
        message: error.message
      });
    }

  }
};

export const DecrementProductoDirecto = async (queryRunner: QueryRunner, idProducto: string, SucursalId: string, Cantidad: number, id: string, tipo: string = "SALIDA_BAJA") => {
  const cantidad = Number(Cantidad);

  const registro = await buscarInventarioProducto(queryRunner, idProducto, SucursalId);
  if (!registro || Number(registro.Stock) <= 0) {
    throw new HttpError(404, `No hay stock disponible para el producto ${idProducto} en la sucursal ${SucursalId}.`);
  }

  const stockDisponible = Number(registro.Stock);
  if (stockDisponible < cantidad) {
    throw new HttpError(400, `Stock insuficiente. Disponible: ${stockDisponible}, Requerido: ${Cantidad}`);
  }

  registro.Stock = stockDisponible - cantidad;
  if (registro.Stock <= 0) {
    registro.Stock = 0;
    registro.Estado = 0;
  }
  await queryRunner.manager.save(registro);
  await registrarMovimientoSalida(queryRunner, registro, tipo, cantidad, id);

  return { success: true, costoUnitarioBase: Number(registro.CostoUnitario) || 0 };
};

export const DecrementProducto = async (queryRunner: QueryRunner,presentacion: Productomedida, SucursalId: string, Cantidad: number, id: string, tipo: string = "SALIDA_VENTA") => {
  const idProducto = presentacion.Producto.IdProducto;
  const cantidad = Number(Cantidad) * Number(presentacion.Cantidad);

  const registro = await buscarInventarioProducto(queryRunner, idProducto, SucursalId);
  if (!registro || Number(registro.Stock) <= 0) {
    throw new HttpError(404, `No hay stock disponible para el producto ${presentacion.Producto.IdProducto} en la sucursal ${SucursalId}.`);
  }

  const stockDisponible = Number(registro.Stock);
  if (stockDisponible < cantidad) {
    throw new HttpError(400, `Stock insuficiente. Disponible: ${stockDisponible}, Requerido: ${Cantidad}`);
  }

  registro.Stock = stockDisponible - cantidad;
  if (registro.Stock <= 0) {
    registro.Stock = 0;
    registro.Estado = 0;
  }
  await queryRunner.manager.save(registro);

  await registrarMovimientoSalida(queryRunner, registro, tipo, cantidad, id);

  return { success: true, costoUnitarioBase: Number(registro.CostoUnitario) || 0 };
};

export const DecrementInsumo = async (queryRunner: QueryRunner, insumo: any, SucursalId: string, Cantidad: number, id: string, tipo: string = "SALIDA_TRANSFERENCIA") => {
  const idInsumo = insumo.Insumo.IdInsumo;
  const unidad = insumo.Unidadmedida;
  const cantidad = Number(Cantidad) * Number(unidad.Cantidad) * Number(insumo.Cantidad);

  const registro = await buscarInventarioInsumo(queryRunner, idInsumo, SucursalId);
  if (!registro || Number(registro.Stock) <= 0) {
    throw new HttpError(404, `No hay stock disponible para el insumo ${idInsumo} en la sucursal ${SucursalId}.`);
  }

  const stockDisponible = Number(registro.Stock);
  if (stockDisponible < cantidad) {
    throw new HttpError(400, `Stock insuficiente de insumo. Disponible: ${stockDisponible}, Requerido: ${cantidad}`);
  }

  registro.Stock = stockDisponible - cantidad;
  if (registro.Stock <= 0) {
    registro.Stock = 0;
    registro.Estado = 0;
  }
  await queryRunner.manager.save(registro);

  await registrarMovimientoSalida(queryRunner, registro, tipo, cantidad, id);

  return { success: true, costoUnitarioBase: Number(registro.CostoUnitario) || 0 };
};

export const DecrementPromocion = async (queryRunner: QueryRunner,
  SucursalId: string,
  Cantidad: number,
  promocion: Promocion | null,
  id: string,
  tipo: string = "SALIDA_VENTA"
) => {
  // Buscar la promoción
  if (promocion) {
    for (const promo of promocion.Promocionproducto) {
      const presentacion = await verifyProductoMedida({ PaqueteId: promo.Productomedida.IdProductoMedida })
      const cantidadTotal = Number(promo.Cantidad) * Cantidad
      await DecrementProducto(queryRunner,presentacion, SucursalId, cantidadTotal, id, tipo)
    }
  }

};

export const IncrementProducto = async (queryRunner: QueryRunner,presentacion: Productomedida, SucursalId: string, Cantidad: number, id: string, tipo: string = "ANULACION_VENTA") => {
  const { fecha } = getFechaHoraBolivia();
  const idProducto = presentacion.Producto.IdProducto;
  const cantidadASumar = Number(Cantidad) * Number(presentacion.Cantidad);

  // UN registro por producto + sucursal
  let registro = await buscarInventarioProducto(queryRunner, idProducto, SucursalId);

  // Si no existe, crear uno nuevo para registrar la devolución
  if (!registro) {
    const ultimoMov = await queryRunner.manager.findOne(MovimientoInventario, {
      where: {
        Producto: { IdProducto: idProducto },
        Sucursal: { IdSucursal: SucursalId }
      },
      order: { Fecha: "DESC" }
    });

    registro = new Inventario();
    registro.IdInventario = await generarIdSecuencial("INV", queryRunner);
    registro.Stock = 0;
    registro.CostoUnitario = ultimoMov ? Number(ultimoMov.CostoUnitario) : 0;
    registro.Preciounitario = Number(presentacion.PrecioVenta) || 0;
    registro.FechaIngreso = fecha;
    registro.TipoOrigen = "ANULACION";
    registro.IdReferencia = id;
    registro.Estado = 1;
    registro.Sucursal = await verifySucursal({ SucursalId });
    registro.Producto = await verifyProducto({ ProductoId: idProducto });
  }

  registro.Stock = Number(registro.Stock) + cantidadASumar;
  if (registro.Stock > 0) registro.Estado = 1;
  if (Number(registro.CostoUnitario) === 0 && cantidadASumar > 0) {
    registro.CostoUnitario = Number(presentacion.PrecioVenta) || 0;
  }

  await queryRunner.manager.save(registro);
  await registrarMovimientoEntrada(queryRunner, registro, tipo, id, cantidadASumar);

  return { success: true };
};

export const IncrementInsumo = async (queryRunner: QueryRunner, insumo: any, SucursalId: string, Cantidad: number, id: string, tipo: string = "ANULACION_TRANSFERENCIA") => {
  const { fecha } = getFechaHoraBolivia();
  const idInsumo = insumo.Insumo.IdInsumo;
  const unidad = insumo.Unidadmedida;
  const cantidadASumar = Number(Cantidad) * Number(unidad.Cantidad) * Number(insumo.Cantidad);

  // UN registro por insumo + sucursal
  let registro = await buscarInventarioInsumo(queryRunner, idInsumo, SucursalId);

  // Si no existe, crear uno nuevo para registrar la devolución
  if (!registro) {
    const ultimoMov = await queryRunner.manager.findOne(MovimientoInventario, {
      where: {
        Insumo: { IdInsumo: idInsumo },
        Sucursal: { IdSucursal: SucursalId }
      },
      order: { Fecha: "DESC" }
    });

    registro = new Inventario();
    registro.IdInventario = await generarIdSecuencial("INV", queryRunner);
    registro.Stock = 0;
    registro.CostoUnitario = ultimoMov ? Number(ultimoMov.CostoUnitario) : 0;
    registro.Preciounitario = ultimoMov
      ? Number(ultimoMov.CostoUnitario) * (Number(unidad.Cantidad) * Number(insumo.Cantidad))
      : 0;
    registro.FechaIngreso = fecha;
    registro.TipoOrigen = "ANULACION";
    registro.IdReferencia = id;
    registro.Estado = 1;
    registro.Sucursal = await verifySucursal({ SucursalId });
    registro.Insumo = await verifyInsumo({ ProductoId: idInsumo });
  }

  registro.Stock = Number(registro.Stock) + cantidadASumar;
  if (registro.Stock > 0) registro.Estado = 1;

  await queryRunner.manager.save(registro);

  await registrarMovimientoEntrada(queryRunner, registro, tipo, id, cantidadASumar);

  return { success: true };
};

export const anularLotesPorReferencia = async (queryRunner: QueryRunner, idReferencia: string, tipoEntrada: string, tipoAnulacion: string) => {
  // Con el modelo de registro único, se revierte lo que esa referencia aportó:
  // se buscan los movimientos de entrada de la referencia y se decrementan
  // los registros únicos correspondientes.
  const movimientos = await queryRunner.manager.find(MovimientoInventario, {
    where: {
      IdReferencia: idReferencia,
      Tipo: tipoEntrada
    },
    relations: ["Inventario", "Sucursal", "Insumo", "Producto"]
  });

  for (const mov of movimientos) {
    const registro = mov.Inventario;
    if (!registro) continue;

    const cantidad = Number(mov.Cantidad);

    if (Number(registro.Stock) < cantidad) {
      throw new HttpError(400, `No se puede anular. El stock ya ha sido utilizado para ${registro.Producto ? registro.Producto.Nombre : (registro.Insumo ? registro.Insumo.Nombre : "el producto")}.`);
    }

    // 🔴 revertir inventario (decrementar el registro único)
    registro.Stock = Number(registro.Stock) - cantidad;
    if (registro.Stock <= 0) {
      registro.Stock = 0;
      registro.Estado = 0;
    }
    await queryRunner.manager.save(registro);

    // 🔴 registrar movimiento inverso
    await registrarMovimientoSalida(queryRunner, registro, tipoAnulacion, cantidad, idReferencia);
  }
};

export const IncrementPromocion = async (queryRunner: QueryRunner,SucursalId: string, Cantidad: number, promocion: Promocion | null, id: string) => {
  if (promocion) {
    for (const promo of promocion.Promocionproducto) {
      const presentacion = await verifyProductoMedida({ PaqueteId: promo.Productomedida.IdProductoMedida });
      const cantidadTotal = Number(promo.Cantidad) * Cantidad
      await IncrementProducto(queryRunner,presentacion, SucursalId, cantidadTotal, id);
    }
  }
};

/**
 * Dar de baja productos del inventario por falta de venta
 * Recibe: { IdSucursal, items: [{ IdProductoMedida, Cantidad, Motivo }] }
 * Usa ProductoMedida para obtener el producto base y la conversión de unidades
 */
export const listarBajas = async (req: Request, res: Response) => {
  try {
    const { IdSucursal, Fecha, page = '1', limit = '20' } = req.query;
    const pagina = parseInt(page as string, 10) || 1;
    const limite = parseInt(limit as string, 10) || 20;
    const skip = (pagina - 1) * limite;

    const where: any = {};
    if (IdSucursal && IdSucursal !== 'TODOS') where.Sucursal = { IdSucursal: IdSucursal as string };
    if (Fecha) where.Fecha = Fecha as string;

    const [data, total] = await BajaProducto.findAndCount({
      where,
      relations: ['Sucursal', 'Producto'],
      order: { Fecha: 'DESC', Hora: 'DESC' },
      skip,
      take: limite
    });

    return res.status(200).json({
      data,
      total,
      totalPages: Math.ceil(total / limite),
      currentPage: pagina
    });
  } catch (error) {
    if (error instanceof Error) return res.status(500).json({ message: error.message });
  }
};

export const registrarBajaInventario = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    const { fecha: fechaBolivia, hora } = getFechaHoraBolivia();
    const { items, IdSucursal, Fecha } = req.body;
    const fecha = Fecha || fechaBolivia;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new HttpError(400, 'Debe proporcionar un array de productos a dar de baja.');
    }
    if (!IdSucursal) {
      throw new HttpError(400, 'ID de sucursal requerido.');
    }

    const sucursal = await queryRunner.manager.findOne(Sucursal, { where: { IdSucursal: IdSucursal } });
    if (!sucursal) throw new HttpError(404, 'Sucursal no encontrada.');

    const resultados: any[] = [];

    for (const item of items) {
      try {
        const { IdProducto, Cantidad, Motivo } = item;

        if (!IdProducto || !Cantidad || Cantidad <= 0) {
          resultados.push({ IdProducto: IdProducto || 'desconocido', success: false, message: 'Datos inválidos' });
          continue;
        }

        const producto = await verifyProducto({ ProductoId: IdProducto });
        const unidadesReales = Number(Cantidad);
        await DecrementProductoDirecto(queryRunner, IdProducto, IdSucursal, unidadesReales, `BAJA_${fecha}`);

        const baja = new BajaProducto();
        baja.IdBaja = await generarIdSecuencial('BAJA', queryRunner);
        baja.Produccion = null;
        baja.Sucursal = sucursal;
        baja.Producto = producto;
        baja.Cantidad = unidadesReales;
        baja.Motivo = Motivo || 'Sin venta';
        baja.Fecha = fecha;
        baja.Hora = hora;
        await queryRunner.manager.save(baja);

        resultados.push({
          IdProducto,
          Nombre: producto.Nombre,
          success: true,
          cantidad: Number(Cantidad),
          unidades: unidadesReales
        });
      } catch (err) {
        const id = item.IdProducto || 'desconocido';
        resultados.push({
          IdProducto: id, success: false,
          message: err instanceof Error ? err.message : 'Error al procesar ítem'
        });
      }
    }

    await queryRunner.commitTransaction();
    return res.status(200).json({
      message: 'Proceso de baja completado.',
      resultados
    });
  } catch (error) {
    await queryRunner.rollbackTransaction();
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    if (error instanceof Error) return res.status(500).json({ message: error.message });
  } finally {
    await queryRunner.release();
  }
};
