import { Request, Response } from "express";
import { EntityManager, MoreThan, QueryRunner } from "typeorm";
import { Inventario } from "../entities/Inventario";
import { MovimientoInventario } from "../entities/MovimientoInventario";
import { BajaProducto } from "../entities/BajaProducto";
import { Sucursal } from "../entities/Sucursal";
import { generarIdSecuencial } from "../utils/idGenerator";
import { verifyInsumo } from "./Insumo.controllers";
import { verifyProducto } from "./Producto.controllers";
import { verifySucursal } from "./Sucursal.controllers";
import { Unidadmedida } from "../entities/UnidadMedida";
import { verifyUnidadMedida } from "./Medida.controllers";
import { AppDataSource } from "../db";
import { Productomedida } from "../entities/ProductoMedida";
import { HttpError } from "../utils/error.handler";
import { Promocion } from "../entities/Promocion";
import { verifyProductoMedida } from "./ProductoMedida.controllers";
import { getFechaHoraBolivia } from "../utils/Fecha";
const { fecha} = getFechaHoraBolivia()
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

  const nuevo = new Inventario();

  nuevo.IdInventario = await generarIdSecuencial("INV", queryRunner);
  nuevo.Stock = Number(stockBase);
  nuevo.CostoUnitario = Number(costoUnitario);
  nuevo.Preciounitario = Number(precioUnitario);
  nuevo.FechaIngreso = fecha;
  nuevo.TipoOrigen = tipoOrigen;
  nuevo.IdReferencia = idReferencia;
 
  if (cantidadOriginal) nuevo.Cantidad = cantidadOriginal;
  if (idUnidadMedida) {
    nuevo.Unidadmedida = await verifyUnidadMedida({ UnidadMedidaId: idUnidadMedida });
  }

  nuevo.Sucursal = await verifySucursal({ SucursalId: idSucursal });

  if (idProducto) {
    nuevo.Producto = await verifyProducto({ ProductoId: idProducto });
  }

  if (idInsumo) {
    nuevo.Insumo = await verifyInsumo({ ProductoId: idInsumo });
  }
    
   
    await queryRunner.manager.save(nuevo);

  await registrarMovimientoEntrada(queryRunner,nuevo, tipoOrigen, idReferencia);
};

export const registrarMovimientoEntrada = async (
  queryRunner: QueryRunner,
  lote: Inventario,
  tipo: string,
  idReferencia: string,
  cantidad?: number
) => {

  const mov = new MovimientoInventario();

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

    const lote = mov.Inventario;

    if (!lote) continue;

    const cantidad = Number(mov.Cantidad);

    // 🔥 VALIDACIÓN
    if (Number(lote.Stock) < cantidad) {
      throw new Error(
        `No puedes anular la compra. El lote ${lote.IdInventario} ya fue consumido`
      );
    }

    // 🔴 2. revertir inventario
    lote.Stock = Number(lote.Stock) - cantidad;
    await queryRunner.manager.save(lote);

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
    reverso.Inventario = lote;

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

        COALESCE(inv.cantidad, 0) AS cantidad,

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

      INNER JOIN (
        SELECT
          idproducto,
          idsucursal,
          SUM(stock) AS cantidad
        FROM inventario
        WHERE estado = 1
        GROUP BY idproducto, idsucursal
      ) inv
        ON inv.idproducto = pro.idproducto

      LEFT JOIN productomedida pm
        ON pm.idproducto = pro.idproducto
        AND pm.estado = 1

      LEFT JOIN presentacion pre
        ON pre.idpresentacion = pm.idpresentacion

      WHERE
        inv.idsucursal = $1
        AND pro.nombre ILIKE $2
        AND ($3::text IS NULL OR cat.idcategoria = $3)
        AND ($4::text IS NULL OR sub.idsubcategoria = $4)

      GROUP BY
        pro.idproducto,
        pro.nombre,
        pro.imagen,
        pro.descripcion,
        cat.nombre,
        sub.nombre,
        inv.cantidad

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

export const DecrementProducto = async (queryRunner: QueryRunner,presentacion: Productomedida, SucursalId: string, Cantidad: number, id: string, tipo: string = "SALIDA_VENTA") => {
  // Buscar lotes con stock en la sucursal, ordenados por fecha de ingreso (FIFO)

  const idProducto = presentacion.Producto.IdProducto
  let cantidadRestante = Number(Cantidad) * Number(presentacion.Cantidad);
  const cantidadTotalADescontar = cantidadRestante;
  let costoTotalAcumulado = 0;

  const lotes = await queryRunner.manager.find(Inventario,{
    where: {
      Sucursal: { IdSucursal: SucursalId },
      Producto: { IdProducto: idProducto },
      Estado: 1,
      Stock: MoreThan(0)
    },relations:['Producto','Sucursal'],
    order: { FechaIngreso: "ASC" }
  });
  if (lotes.length === 0) {
    throw new HttpError(404, `No hay stock disponible para el producto ${presentacion.Producto.IdProducto} en la sucursal ${SucursalId}.`);
  }

  const totalStock = lotes.reduce((acc, lote) => acc + Number(lote.Stock), 0);
  if (totalStock < cantidadRestante) {
    throw new HttpError(400, `Stock insuficiente. Disponible: ${totalStock}, Requerido: ${Cantidad}`);
  }

  for (const lote of lotes) {
    if (cantidadRestante <= 0) break;

    const stockDisponible = Number(lote.Stock);
    const aDescontar = Math.min(stockDisponible, cantidadRestante);
  
    lote.Stock = stockDisponible - aDescontar;

    await queryRunner.manager.save(lote);
   
    await registrarMovimientoSalida(queryRunner,lote, tipo, aDescontar, id);

    costoTotalAcumulado += aDescontar * Number(lote.CostoUnitario);
    cantidadRestante -= aDescontar;
  }

  const costoPromedio = cantidadTotalADescontar > 0 ? costoTotalAcumulado / cantidadTotalADescontar : 0;
  return { success: true, costoUnitarioBase: costoPromedio };
};

export const DecrementInsumo = async (queryRunner: QueryRunner, insumo: any, SucursalId: string, Cantidad: number, id: string, tipo: string = "SALIDA_TRANSFERENCIA") => {
  const idInsumo = insumo.Insumo.IdInsumo;
  const unidad = insumo.Unidadmedida;
  let cantidadRestante = Number(Cantidad) * Number(unidad.Cantidad) * Number(insumo.Cantidad);
  const cantidadTotalADescontar = cantidadRestante;
  let costoTotalAcumulado = 0;

  const lotes = await queryRunner.manager.find(Inventario, {
    where: {
      Sucursal: { IdSucursal: SucursalId },
      Insumo: { IdInsumo: idInsumo },
      Estado: 1,
      Stock: MoreThan(0)
    },
    relations: ['Insumo', 'Sucursal'],
    order: { FechaIngreso: "ASC" }
  });

  if (lotes.length === 0) {
    throw new HttpError(404, `No hay stock disponible para el insumo ${idInsumo} en la sucursal ${SucursalId}.`);
  }

  const totalStock = lotes.reduce((acc, lote) => acc + Number(lote.Stock), 0);
  if (totalStock < cantidadRestante) {
    throw new HttpError(400, `Stock insuficiente de insumo. Disponible: ${totalStock}, Requerido: ${cantidadRestante}`);
  }

  for (const lote of lotes) {
    if (cantidadRestante <= 0) break;

    const stockDisponible = Number(lote.Stock);
    const aDescontar = Math.min(stockDisponible, cantidadRestante);

    lote.Stock = stockDisponible - aDescontar;
    await queryRunner.manager.save(lote);

    await registrarMovimientoSalida(queryRunner, lote, tipo, aDescontar, id);
    
    costoTotalAcumulado += aDescontar * Number(lote.CostoUnitario);
    cantidadRestante -= aDescontar;
  }

  const costoPromedio = cantidadTotalADescontar > 0 ? costoTotalAcumulado / cantidadTotalADescontar : 0;
  return { success: true, costoUnitarioBase: costoPromedio };
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
  const idProducto = presentacion.Producto.IdProducto;
  let cantidadASumar = Number(Cantidad) * Number(presentacion.Cantidad);

  // Buscar el último lote (o uno activo) para devolver el stock
  // O podríamos crear un lote nuevo de "DEVOLUCION"
const lote = await queryRunner.manager.findOne(Inventario,{
    where: {
      Sucursal: { IdSucursal: SucursalId },
      Producto: { IdProducto: idProducto },
      Estado: 1,
    },relations:['Producto','Sucursal'],
    order: { FechaIngreso: "DESC" }
  });

  if (!lote) {
    // Si no hay lote, podríamos crear uno nuevo, pero lo ideal es que exista al menos uno si se vendió
    throw new HttpError(404, `No se encontró un lote activo para el producto ${idProducto} en la sucursal ${SucursalId} para restaurar stock.`);
  }

  lote.Stock = Number(lote.Stock) + cantidadASumar;

 await queryRunner.manager.save(lote);
  await registrarMovimientoEntrada(queryRunner,lote, tipo, id, cantidadASumar);

  return { success: true };
};

export const IncrementInsumo = async (queryRunner: QueryRunner, insumo: any, SucursalId: string, Cantidad: number, id: string, tipo: string = "ANULACION_TRANSFERENCIA") => {
  const idInsumo = insumo.Insumo.IdInsumo;
  const unidad = insumo.Unidadmedida;
  let cantidadASumar = Number(Cantidad) * Number(unidad.Cantidad) * Number(insumo.Cantidad);

  const lote = await queryRunner.manager.findOne(Inventario, {
    where: {
      Sucursal: { IdSucursal: SucursalId },
      Insumo: { IdInsumo: idInsumo },
      Estado: 1
    },
    relations: ['Insumo', 'Sucursal'],
    order: { FechaIngreso: "DESC" }
  });

  if (!lote) {
    throw new HttpError(404, `No se encontró un lote activo para el insumo ${idInsumo} en la sucursal ${SucursalId} para restaurar stock.`);
  }

  lote.Stock = Number(lote.Stock) + cantidadASumar;
  await queryRunner.manager.save(lote);

  await registrarMovimientoEntrada(queryRunner, lote, tipo, id, cantidadASumar);

  return { success: true };
};

export const anularLotesPorReferencia = async (queryRunner: QueryRunner, idReferencia: string, tipoEntrada: string, tipoAnulacion: string) => {
  const lotes = await queryRunner.manager.find(Inventario, {
    where: {
      IdReferencia: idReferencia,
      TipoOrigen: tipoEntrada,
      Estado: 1
    },
    relations: ["Sucursal", "Insumo", "Producto"]
  });

  for (const lote of lotes) {
    const cantidad = Number(lote.Stock);

    // Si el lote ya fue movido o consumido (podríamos verificar si hubo salidas posteriores)
    // Pero para simplificar, si el stock es menor al inicial (que no guardamos explícitamente pero podríamos inferir del movimiento)
    // En este sistema, el stock inicial del lote es lo que se registró en el movimiento de entrada.
    
    const movimientoEntrada = await queryRunner.manager.findOne(MovimientoInventario, {
      where: {
        Inventario: { IdInventario: lote.IdInventario },
        Tipo: tipoEntrada
      }
    });

    if (movimientoEntrada && Number(lote.Stock) < Number(movimientoEntrada.Cantidad)) {
      throw new HttpError(400, `No se puede anular. El stock del lote ${lote.IdInventario} ya ha sido utilizado.`);
    }

    // 🔴 2. revertir inventario
    lote.Stock = 0;
    lote.Estado = 0; // Desactivar el lote
    await queryRunner.manager.save(lote);

    // 🔴 3. registrar movimiento inverso
    await registrarMovimientoSalida(queryRunner, lote, tipoAnulacion, movimientoEntrada ? Number(movimientoEntrada.Cantidad) : cantidad, idReferencia);
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
        const { IdProductoMedida, Cantidad, Motivo } = item;

        if (!IdProductoMedida || !Cantidad || Cantidad <= 0) {
          resultados.push({ IdProductoMedida, success: false, message: 'Datos inválidos' });
          continue;
        }

        const presentacion = await verifyProductoMedida({ PaqueteId: IdProductoMedida });
        const producto = presentacion.Producto;
        const unidadesReales = Number(Cantidad) * Number(presentacion.Cantidad);

        await DecrementProducto(queryRunner, presentacion, IdSucursal, Number(Cantidad), `BAJA_${fecha}`, 'BAJA_INVENTARIO');

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
          IdProductoMedida,
          Nombre: producto.Nombre,
          Presentacion: presentacion.IdProductoMedida,
          success: true,
          cantidad: Number(Cantidad),
          unidades: unidadesReales
        });
      } catch (err) {
        const id = item.IdProductoMedida || 'desconocido';
        resultados.push({
          IdProductoMedida: id, success: false,
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
