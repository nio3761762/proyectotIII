"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncrementPromocion = exports.anularLotesPorReferencia = exports.IncrementInsumo = exports.IncrementProducto = exports.DecrementPromocion = exports.DecrementInsumo = exports.DecrementProducto = exports.getInventario = exports.registrarMovimientoSalida = exports.anularMovimientoInventario = exports.registrarMovimientoEntrada = exports.createLoteInventario = void 0;
const typeorm_1 = require("typeorm");
const Inventario_1 = require("../entities/Inventario");
const MovimientoInventario_1 = require("../entities/MovimientoInventario");
const idGenerator_1 = require("../utils/idGenerator");
const Insumo_controllers_1 = require("./Insumo.controllers");
const Producto_controllers_1 = require("./Producto.controllers");
const Sucursal_controllers_1 = require("./Sucursal.controllers");
const Medida_controllers_1 = require("./Medida.controllers");
const db_1 = require("../db");
const error_handler_1 = require("../utils/error.handler");
const ProductoMedida_controllers_1 = require("./ProductoMedida.controllers");
const Fecha_1 = require("../utils/Fecha");
const { fecha } = (0, Fecha_1.getFechaHoraBolivia)();
const createLoteInventario = async (queryRunner, idProducto, idInsumo, stockBase, costoUnitario, idSucursal, tipoOrigen, idReferencia, precioUnitario, cantidadOriginal, idUnidadMedida) => {
    const nuevo = new Inventario_1.Inventario();
    nuevo.IdInventario = await (0, idGenerator_1.generarIdSecuencial)("INV");
    nuevo.Stock = Number(stockBase);
    nuevo.CostoUnitario = Number(costoUnitario);
    nuevo.Preciounitario = Number(precioUnitario);
    nuevo.FechaIngreso = fecha;
    nuevo.TipoOrigen = tipoOrigen;
    nuevo.IdReferencia = idReferencia;
    if (cantidadOriginal)
        nuevo.Cantidad = cantidadOriginal;
    if (idUnidadMedida) {
        nuevo.Unidadmedida = await (0, Medida_controllers_1.verifyUnidadMedida)({ UnidadMedidaId: idUnidadMedida });
    }
    nuevo.Sucursal = await (0, Sucursal_controllers_1.verifySucursal)({ SucursalId: idSucursal });
    if (idProducto) {
        nuevo.Producto = await (0, Producto_controllers_1.verifyProducto)({ ProductoId: idProducto });
    }
    if (idInsumo) {
        nuevo.Insumo = await (0, Insumo_controllers_1.verifyInsumo)({ ProductoId: idInsumo });
    }
    await queryRunner.manager.save(nuevo);
    await (0, exports.registrarMovimientoEntrada)(queryRunner, nuevo, tipoOrigen, idReferencia);
};
exports.createLoteInventario = createLoteInventario;
const registrarMovimientoEntrada = async (queryRunner, lote, tipo, idReferencia, cantidad) => {
    const mov = new MovimientoInventario_1.MovimientoInventario();
    mov.IdMovimiento = await (0, idGenerator_1.generarIdSecuencial)("MOINV");
    mov.Tipo = tipo;
    mov.Cantidad = cantidad !== undefined ? cantidad : lote.Stock;
    mov.CostoUnitario = lote.CostoUnitario;
    mov.CostoTotal = Number(mov.Cantidad) * Number(lote.CostoUnitario);
    mov.Fecha = fecha;
    mov.Sucursal = lote.Sucursal;
    mov.IdReferencia = idReferencia;
    mov.Inventario = lote;
    if (lote.Insumo)
        mov.Insumo = lote.Insumo;
    if (lote.Producto)
        mov.Producto = lote.Producto;
    await queryRunner.manager.save(mov);
};
exports.registrarMovimientoEntrada = registrarMovimientoEntrada;
const anularMovimientoInventario = async (queryRunner, idCompra, entrada) => {
    // 🔥 1. buscar movimientos de compra
    const movimientos = await queryRunner.manager.find(MovimientoInventario_1.MovimientoInventario, {
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
        if (!lote)
            continue;
        const cantidad = Number(mov.Cantidad);
        // 🔥 VALIDACIÓN
        if (Number(lote.Stock) < cantidad) {
            throw new Error(`No puedes anular la compra. El lote ${lote.IdInventario} ya fue consumido`);
        }
        // 🔴 2. revertir inventario
        lote.Stock = Number(lote.Stock) - cantidad;
        await queryRunner.manager.save(lote);
        // 🔴 3. registrar movimiento inverso
        const reverso = new MovimientoInventario_1.MovimientoInventario();
        reverso.IdMovimiento = await (0, idGenerator_1.generarIdSecuencial)("MOINV");
        reverso.Tipo = "ANULAR_COMPRA";
        reverso.Cantidad = -cantidad;
        reverso.CostoUnitario = Number(mov.CostoUnitario);
        reverso.CostoTotal = -Number(mov.CostoTotal);
        reverso.Fecha = new Date();
        reverso.Sucursal = mov.Sucursal;
        reverso.IdReferencia = idCompra;
        reverso.Inventario = lote;
        if (mov.Insumo)
            reverso.Insumo = mov.Insumo;
        if (mov.Producto)
            reverso.Producto = mov.Producto;
        await queryRunner.manager.save(reverso);
    }
    return {
        message: "Inventario revertido correctamente"
    };
};
exports.anularMovimientoInventario = anularMovimientoInventario;
const registrarMovimientoSalida = async (queryRunner, lote, tipo, cantidad, id) => {
    const mov = new MovimientoInventario_1.MovimientoInventario();
    mov.IdMovimiento = await (0, idGenerator_1.generarIdSecuencial)("MOINV");
    mov.Tipo = tipo;
    mov.Cantidad = -cantidad; // Salida es negativa
    mov.CostoUnitario = lote.CostoUnitario;
    mov.CostoTotal = -Number(cantidad) * Number(lote.CostoUnitario);
    mov.Fecha = new Date();
    mov.Sucursal = lote.Sucursal;
    mov.Inventario = lote;
    mov.IdReferencia = id;
    if (lote.Insumo)
        mov.Insumo = lote.Insumo;
    if (lote.Producto)
        mov.Producto = lote.Producto;
    await queryRunner.manager.save(mov);
};
exports.registrarMovimientoSalida = registrarMovimientoSalida;
const getInventario = async (req, res) => {
    try {
        const { id, search = '', categoria, subcategoria, page = 1, limit = 10 } = req.query;
        if (!id) {
            return res.status(400).json({
                message: "ID de sucursal requerido"
            });
        }
        const currentPage = Number(page);
        const currentLimit = Number(limit);
        const offset = (currentPage - 1) * currentLimit;
        const result = await db_1.AppDataSource.query(`
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
      `, [
            id,
            `%${search}%`,
            categoria || null,
            subcategoria || null,
            currentLimit,
            offset
        ]);
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
    }
    catch (error) {
        console.error(error);
        if (error instanceof Error) {
            return res.status(500).json({
                message: error.message
            });
        }
    }
};
exports.getInventario = getInventario;
const DecrementProducto = async (queryRunner, presentacion, SucursalId, Cantidad, id, tipo = "SALIDA_VENTA") => {
    // Buscar lotes con stock en la sucursal, ordenados por fecha de ingreso (FIFO)
    const idProducto = presentacion.Producto.IdProducto;
    let cantidadRestante = Number(Cantidad) * Number(presentacion.Cantidad);
    const cantidadTotalADescontar = cantidadRestante;
    let costoTotalAcumulado = 0;
    const lotes = await queryRunner.manager.find(Inventario_1.Inventario, {
        where: {
            Sucursal: { IdSucursal: SucursalId },
            Producto: { IdProducto: idProducto },
            Estado: 1,
            Stock: (0, typeorm_1.MoreThan)(0)
        }, relations: ['Producto', 'Sucursal'],
        order: { FechaIngreso: "ASC" }
    });
    if (lotes.length === 0) {
        throw new error_handler_1.HttpError(404, `No hay stock disponible para el producto ${presentacion.Producto.IdProducto} en la sucursal ${SucursalId}.`);
    }
    const totalStock = lotes.reduce((acc, lote) => acc + Number(lote.Stock), 0);
    if (totalStock < cantidadRestante) {
        throw new error_handler_1.HttpError(400, `Stock insuficiente. Disponible: ${totalStock}, Requerido: ${Cantidad}`);
    }
    for (const lote of lotes) {
        if (cantidadRestante <= 0)
            break;
        const stockDisponible = Number(lote.Stock);
        const aDescontar = Math.min(stockDisponible, cantidadRestante);
        lote.Stock = stockDisponible - aDescontar;
        await queryRunner.manager.save(lote);
        await (0, exports.registrarMovimientoSalida)(queryRunner, lote, tipo, aDescontar, id);
        costoTotalAcumulado += aDescontar * Number(lote.CostoUnitario);
        cantidadRestante -= aDescontar;
    }
    const costoPromedio = cantidadTotalADescontar > 0 ? costoTotalAcumulado / cantidadTotalADescontar : 0;
    return { success: true, costoUnitarioBase: costoPromedio };
};
exports.DecrementProducto = DecrementProducto;
const DecrementInsumo = async (queryRunner, insumo, SucursalId, Cantidad, id, tipo = "SALIDA_TRANSFERENCIA") => {
    const idInsumo = insumo.Insumo.IdInsumo;
    const unidad = insumo.Unidadmedida;
    let cantidadRestante = Number(Cantidad) * Number(unidad.Cantidad) * Number(insumo.Cantidad);
    const cantidadTotalADescontar = cantidadRestante;
    let costoTotalAcumulado = 0;
    const lotes = await queryRunner.manager.find(Inventario_1.Inventario, {
        where: {
            Sucursal: { IdSucursal: SucursalId },
            Insumo: { IdInsumo: idInsumo },
            Estado: 1,
            Stock: (0, typeorm_1.MoreThan)(0)
        },
        relations: ['Insumo', 'Sucursal'],
        order: { FechaIngreso: "ASC" }
    });
    if (lotes.length === 0) {
        throw new error_handler_1.HttpError(404, `No hay stock disponible para el insumo ${idInsumo} en la sucursal ${SucursalId}.`);
    }
    const totalStock = lotes.reduce((acc, lote) => acc + Number(lote.Stock), 0);
    if (totalStock < cantidadRestante) {
        throw new error_handler_1.HttpError(400, `Stock insuficiente de insumo. Disponible: ${totalStock}, Requerido: ${cantidadRestante}`);
    }
    for (const lote of lotes) {
        if (cantidadRestante <= 0)
            break;
        const stockDisponible = Number(lote.Stock);
        const aDescontar = Math.min(stockDisponible, cantidadRestante);
        lote.Stock = stockDisponible - aDescontar;
        await queryRunner.manager.save(lote);
        await (0, exports.registrarMovimientoSalida)(queryRunner, lote, tipo, aDescontar, id);
        costoTotalAcumulado += aDescontar * Number(lote.CostoUnitario);
        cantidadRestante -= aDescontar;
    }
    const costoPromedio = cantidadTotalADescontar > 0 ? costoTotalAcumulado / cantidadTotalADescontar : 0;
    return { success: true, costoUnitarioBase: costoPromedio };
};
exports.DecrementInsumo = DecrementInsumo;
const DecrementPromocion = async (queryRunner, SucursalId, Cantidad, promocion, id, tipo = "SALIDA_VENTA") => {
    // Buscar la promoción
    if (promocion) {
        for (const promo of promocion.Promocionproducto) {
            const presentacion = await (0, ProductoMedida_controllers_1.verifyProductoMedida)({ PaqueteId: promo.Productomedida.IdProductoMedida });
            const cantidadTotal = Number(promo.Cantidad) * Cantidad;
            await (0, exports.DecrementProducto)(queryRunner, presentacion, SucursalId, cantidadTotal, id, tipo);
        }
    }
};
exports.DecrementPromocion = DecrementPromocion;
const IncrementProducto = async (queryRunner, presentacion, SucursalId, Cantidad, id, tipo = "ANULACION_VENTA") => {
    const idProducto = presentacion.Producto.IdProducto;
    let cantidadASumar = Number(Cantidad) * Number(presentacion.Cantidad);
    // Buscar el último lote (o uno activo) para devolver el stock
    // O podríamos crear un lote nuevo de "DEVOLUCION"
    const lote = await queryRunner.manager.findOne(Inventario_1.Inventario, {
        where: {
            Sucursal: { IdSucursal: SucursalId },
            Producto: { IdProducto: idProducto },
            Estado: 1,
        }, relations: ['Producto', 'Sucursal'],
        order: { FechaIngreso: "DESC" }
    });
    if (!lote) {
        // Si no hay lote, podríamos crear uno nuevo, pero lo ideal es que exista al menos uno si se vendió
        throw new error_handler_1.HttpError(404, `No se encontró un lote activo para el producto ${idProducto} en la sucursal ${SucursalId} para restaurar stock.`);
    }
    lote.Stock = Number(lote.Stock) + cantidadASumar;
    await queryRunner.manager.save(lote);
    await (0, exports.registrarMovimientoEntrada)(queryRunner, lote, tipo, id, cantidadASumar);
    return { success: true };
};
exports.IncrementProducto = IncrementProducto;
const IncrementInsumo = async (queryRunner, insumo, SucursalId, Cantidad, id, tipo = "ANULACION_TRANSFERENCIA") => {
    const idInsumo = insumo.Insumo.IdInsumo;
    const unidad = insumo.Unidadmedida;
    let cantidadASumar = Number(Cantidad) * Number(unidad.Cantidad) * Number(insumo.Cantidad);
    const lote = await queryRunner.manager.findOne(Inventario_1.Inventario, {
        where: {
            Sucursal: { IdSucursal: SucursalId },
            Insumo: { IdInsumo: idInsumo },
            Estado: 1
        },
        relations: ['Insumo', 'Sucursal'],
        order: { FechaIngreso: "DESC" }
    });
    if (!lote) {
        throw new error_handler_1.HttpError(404, `No se encontró un lote activo para el insumo ${idInsumo} en la sucursal ${SucursalId} para restaurar stock.`);
    }
    lote.Stock = Number(lote.Stock) + cantidadASumar;
    await queryRunner.manager.save(lote);
    await (0, exports.registrarMovimientoEntrada)(queryRunner, lote, tipo, id, cantidadASumar);
    return { success: true };
};
exports.IncrementInsumo = IncrementInsumo;
const anularLotesPorReferencia = async (queryRunner, idReferencia, tipoEntrada, tipoAnulacion) => {
    const lotes = await queryRunner.manager.find(Inventario_1.Inventario, {
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
        const movimientoEntrada = await queryRunner.manager.findOne(MovimientoInventario_1.MovimientoInventario, {
            where: {
                Inventario: { IdInventario: lote.IdInventario },
                Tipo: tipoEntrada
            }
        });
        if (movimientoEntrada && Number(lote.Stock) < Number(movimientoEntrada.Cantidad)) {
            throw new error_handler_1.HttpError(400, `No se puede anular. El stock del lote ${lote.IdInventario} ya ha sido utilizado.`);
        }
        // 🔴 2. revertir inventario
        lote.Stock = 0;
        lote.Estado = 0; // Desactivar el lote
        await queryRunner.manager.save(lote);
        // 🔴 3. registrar movimiento inverso
        await (0, exports.registrarMovimientoSalida)(queryRunner, lote, tipoAnulacion, movimientoEntrada ? Number(movimientoEntrada.Cantidad) : cantidad, idReferencia);
    }
};
exports.anularLotesPorReferencia = anularLotesPorReferencia;
const IncrementPromocion = async (queryRunner, SucursalId, Cantidad, promocion, id) => {
    if (promocion) {
        for (const promo of promocion.Promocionproducto) {
            const presentacion = await (0, ProductoMedida_controllers_1.verifyProductoMedida)({ PaqueteId: promo.Productomedida.IdProductoMedida });
            const cantidadTotal = Number(promo.Cantidad) * Cantidad;
            await (0, exports.IncrementProducto)(queryRunner, presentacion, SucursalId, cantidadTotal, id);
        }
    }
};
exports.IncrementPromocion = IncrementPromocion;
