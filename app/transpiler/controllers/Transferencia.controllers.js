"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.anularTransferencia = exports.getTransferencias = exports.createDetalleTransferencia = exports.registrarTransferencia = void 0;
const error_handler_1 = require("../utils/error.handler");
const db_1 = require("../db");
const Fecha_1 = require("../utils/Fecha");
const Transferencia_1 = require("../entities/Transferencia");
const idGenerator_1 = require("../utils/idGenerator");
const Sucursal_controllers_1 = require("./Sucursal.controllers");
const Empleado_controllers_1 = require("./Empleado.controllers");
const ProductoMedida_controllers_1 = require("./ProductoMedida.controllers");
const DetalleTransferencia_1 = require("../entities/DetalleTransferencia");
const Insumomedida_controllers_1 = require("./Insumomedida.controllers");
const Inventario_controllers_1 = require("./Inventario.controllers");
const { fecha, hora } = (0, Fecha_1.getFechaHoraBolivia)();
const registrarTransferencia = async (req, res) => {
    const queryRunner = db_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const { transferencias, detalles } = req.body;
        console.log(detalles, 'lista de productos');
        // 1. Validaciones básicas
        if (!transferencias.IdUsuario || !transferencias.IdSucursal) {
            throw new error_handler_1.HttpError(400, "Usuario y Sucursal son requeridos para la transferencia.");
        }
        // 2. Generar ID y preparar cabecera de Venta
        const nuevoIdVenta = await (0, idGenerator_1.generarIdSecuencial)('Trans');
        const transferencia = new Transferencia_1.Transferencia();
        transferencia.IdTransferencia = nuevoIdVenta;
        // 3. Manejo de Cliente (Persona)
        transferencia.Fecha = fecha;
        transferencia.Hora = hora;
        transferencia.Tipo = transferencias.Tipo;
        if (transferencias.IdsucursalOrigen)
            transferencia.SucursalOrigen = await (0, Sucursal_controllers_1.verifySucursal)({ SucursalId: transferencias.IdsucursalOrigen });
        if (transferencias.IdsucursalDestino)
            transferencia.SucursalDestino = await (0, Sucursal_controllers_1.verifySucursal)({ SucursalId: transferencias.IdsucursalDestino });
        if (transferencias.IdempleadoDestino)
            transferencia.EmpleadoDestino = await (0, Empleado_controllers_1.verifyEmpleado)(transferencias.IdempleadoDestino);
        // Guardar transferencia dentro de la transacción
        await queryRunner.manager.save(transferencia);
        // 5. Procesar Detalles (Presentaciones Productos)
        if (detalles) {
            if (detalles.Producto?.length > 0) {
                for (const prod of detalles.Producto) {
                    let presentacion = null;
                    if (prod.idPaquete) {
                        presentacion = await (0, ProductoMedida_controllers_1.verifyProductoMedida)({ PaqueteId: prod.idPaquete });
                    }
                    let insumomedida = null;
                    if (prod.idInsumo)
                        insumomedida = await (0, Insumomedida_controllers_1.verifyInsumoMedida)({ PaqueteId: prod.idInsumo });
                    await (0, exports.createDetalleTransferencia)(queryRunner, transferencia, presentacion, insumomedida, prod.Cantidad);
                }
            }
        }
        // Confirmar todo si llegamos aquí
        await queryRunner.commitTransaction();
        return res.status(201).json({
            message: "La transferencia se registró correctamente",
            idVenta: nuevoIdVenta
        });
    }
    catch (error) {
        // Si algo falla, revertimos todos los cambios (Venta, Pagos e Inventario)
        await queryRunner.rollbackTransaction();
        if (error instanceof error_handler_1.HttpError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({
            message: "Error al registrar la transferencia",
            error: error instanceof Error ? error.message : "Error desconocido"
        });
    }
    finally {
        // Liberar el query runner
        await queryRunner.release();
    }
};
exports.registrarTransferencia = registrarTransferencia;
const createDetalleTransferencia = async (queryRunner, transferencia, presentacion, insumo, Cantidad) => {
    const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('DTRA');
    const detalletransferencia = new DetalleTransferencia_1.DetalleTransferencia();
    detalletransferencia.IdDetalleTransferencia = nuevoId;
    detalletransferencia.Cantidad = Cantidad;
    detalletransferencia.Transferencia = transferencia;
    if (presentacion) {
        detalletransferencia.ProductoMedida = presentacion;
        detalletransferencia.Producto = presentacion?.Producto;
    }
    if (insumo) {
        detalletransferencia.Insumo = insumo.Insumo;
        detalletransferencia.Insumomedida = insumo;
    }
    await queryRunner.manager.save(detalletransferencia);
    if (presentacion) {
        const decrementResult = await (0, Inventario_controllers_1.DecrementProducto)(queryRunner, presentacion, transferencia.SucursalOrigen.IdSucursal, Cantidad, transferencia.IdTransferencia, "SALIDA_TRANSFERENCIA");
        if (transferencia.SucursalDestino) {
            const idproducto = presentacion.Producto.IdProducto;
            const idsucursal = transferencia.SucursalDestino.IdSucursal;
            const cantidadBase = Cantidad * presentacion.Cantidad;
            const costoUnitario = decrementResult.costoUnitarioBase;
            const precioUnitario = Number(presentacion.PrecioVenta);
            await (0, Inventario_controllers_1.createLoteInventario)(queryRunner, idproducto, null, cantidadBase, costoUnitario, idsucursal, 'ENTRADA_TRANSFERENCIA', transferencia.IdTransferencia, precioUnitario);
        }
    }
    if (insumo) {
        const decrementResult = await (0, Inventario_controllers_1.DecrementInsumo)(queryRunner, insumo, transferencia.SucursalOrigen.IdSucursal, Cantidad, transferencia.IdTransferencia, "SALIDA_TRANSFERENCIA");
        if (transferencia.SucursalDestino) {
            const idinsumo = insumo.Insumo.IdInsumo;
            const unidad = insumo.Unidadmedida;
            const idsucursal = transferencia.SucursalDestino.IdSucursal;
            const cantidadBasePorPaquete = Number(unidad.Cantidad) * Number(insumo.Cantidad);
            const cantidadTotalBase = Number(Cantidad) * cantidadBasePorPaquete;
            const costoUnitario = decrementResult.costoUnitarioBase;
            const precioUnitario = costoUnitario * cantidadBasePorPaquete;
            await (0, Inventario_controllers_1.createLoteInventario)(queryRunner, null, idinsumo, cantidadTotalBase, costoUnitario, idsucursal, 'ENTRADA_TRANSFERENCIA', transferencia.IdTransferencia, precioUnitario, Cantidad, unidad.IdUnidadMedida);
        }
    }
};
exports.createDetalleTransferencia = createDetalleTransferencia;
const getTransferencias = async (req, res) => {
    try {
        const { idsucursalorigen, idsucursaldestino, idempleadodestino, page = 1, limit = 10, fecha } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const query = `
      SELECT
        t.idtransferencia,
        t.fecha,
        t.tipo,
        t.estado,
        t.hora,
        COUNT(*) OVER() AS total,

        -- SUCURSAL ORIGEN
        json_build_object(
          'IdSucursal', so.idsucursal,
          'Nombre', so.nombre
        ) AS "SucursalOrigen",

        -- SUCURSAL DESTINO
        CASE
          WHEN sd.idsucursal IS NOT NULL THEN
            json_build_object(
              'IdSucursal', sd.idsucursal,
              'Nombre', sd.nombre
            )
          ELSE NULL
        END AS "SucursalDestino",

        -- EMPLEADO DESTINO
        CASE
          WHEN e.idempleado IS NOT NULL THEN
            json_build_object(
              'IdEmpleado', e.idempleado,
              'Persona', json_build_object(
                'Nombre', pe.nombre,
                'ApellidoPaterno', pe.apellidopaterno,
                'Apellidomaterno', pe.apellidomaterno,
                'Imagen', pe.imagen
              ),
              'Cargo',
               c.nombre
            )
          ELSE NULL
        END AS "EmpleadoDestino",

        -- DETALLES
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'IdDetalleTransferencia', dt.iddetalletransferencia,
              'Cantidad', dt.cantidad,
              'Producto', CASE
                WHEN p.idproducto IS NOT NULL THEN
                  json_build_object(
                    'IdProducto', p.idproducto,
                    'Nombre', p.nombre
                  )
                ELSE NULL
              END,
              'Insumo', CASE
                WHEN i.idinsumo IS NOT NULL THEN
                  json_build_object(
                    'IdInsumo', i.idinsumo,
                    'Nombre', i.nombre,
                    'Imagen', i.imagen
                  )
                ELSE NULL
              END,
              'ProductoMedida', CASE
                WHEN pm.idproductomedida IS NOT NULL THEN
                  json_build_object(
                    'IdProductoMedida', pm.idproductomedida,
                    'Cantidad', pm.cantidad,
                    'PrecioVenta', pm.precioventa,
                    'Presentacion', json_build_object(
                      'Nombre', pres.nombre
                    )
                  )
                ELSE NULL
              END,
              'Insumomedida', CASE
                WHEN im.idinsumomedida IS NOT NULL THEN
                  json_build_object(
                    'IdinsumoMedida', im.idinsumomedida,
                    'Cantidad', im.cantidad,
                    'Unidadmedida', json_build_object(
                      'Nombre', um.nombre
                    )
                  )
                ELSE NULL
              END
            )
          ) FILTER (WHERE dt.iddetalletransferencia IS NOT NULL),
          '[]'
        ) AS "Detalletransferencia"

        FROM transferencia t
        LEFT JOIN sucursal so ON so.idsucursal = t.idsucursalorigen
        LEFT JOIN sucursal sd ON sd.idsucursal = t.idsucursaldestino
        LEFT JOIN empleado e ON e.idempleado = t.idempleado
        LEFT JOIN persona pe ON pe.idpersona = e.idpersona
        LEFT JOIN empleado_cargo ec ON ec.idempleado = e.idempleado AND ec.estado = 1
        LEFT JOIN cargo c ON c.idcargo = ec.idcargo AND c.idcargo IN ('CAR-003', 'CAR-001')
        LEFT JOIN detalle_transferencia dt ON dt.idtransferencia = t.idtransferencia
        LEFT JOIN producto p ON p.idproducto = dt.idproducto
        LEFT JOIN insumo i ON i.idinsumo = dt.idinsumo
        LEFT JOIN productomedida pm ON pm.idproductomedida = dt.idproductomedida
        LEFT JOIN presentacion pres ON pres.idpresentacion = pm.idpresentacion
        LEFT JOIN insumomedida im ON im.idinsumomedida = dt.idinsumomedida
        LEFT JOIN unidadmedida um ON um.idunidadmedida = im.idunidadmedida
        WHERE
        ($1::varchar IS NULL OR t.idsucursalorigen = $1)
        AND ($2::varchar IS NULL OR t.idsucursaldestino = $2)
        AND ($3::varchar IS NULL OR t.idempleado = $3)
        AND ($4::date IS NULL OR t.fecha = $4)
        GROUP BY
        t.idtransferencia,
        t.fecha,
        t.tipo,
        t.estado,
        t.hora,
        so.idsucursal,
        so.nombre,
        sd.idsucursal,
        sd.nombre,
        e.idempleado,
        pe.idpersona,
        pe.nombre,
        pe.apellidopaterno,
        c.nombre
        ORDER BY t.fecha DESC
        LIMIT $5 OFFSET $6;    `;
        const result = await db_1.AppDataSource.query(query, [
            idsucursalorigen || null,
            idsucursaldestino || null,
            idempleadodestino || null,
            fecha,
            Number(limit),
            offset
        ]);
        if (result.length === 0) {
            return res.status(200).json({
                total: 0,
                page: Number(page),
                limit: Number(limit),
                data: []
            });
        }
        return res.status(200).json({
            total: Number(result[0].total),
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(Number(result[0].total) / Number(limit)),
            data: result.map(({ total, ...rest }) => rest)
        });
    }
    catch (error) {
        if (error instanceof error_handler_1.HttpError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({
            message: "Error al obtener las transferencias",
            error: error instanceof Error ? error.message : "Error desconocido"
        });
    }
};
exports.getTransferencias = getTransferencias;
const anularTransferencia = async (req, res) => {
    const { id } = req.params;
    const queryRunner = db_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const transferencia = await queryRunner.manager.findOne(Transferencia_1.Transferencia, {
            where: { IdTransferencia: id },
            relations: [
                "Detalletransferencia",
                "SucursalOrigen",
                "SucursalDestino",
                "Detalletransferencia.ProductoMedida",
                "Detalletransferencia.ProductoMedida.Producto",
                "Detalletransferencia.Insumomedida",
                "Detalletransferencia.Insumomedida.Insumo",
                "Detalletransferencia.Insumomedida.Unidadmedida"
            ]
        });
        if (!transferencia) {
            throw new error_handler_1.HttpError(404, "Transferencia no encontrada.");
        }
        if (transferencia.Estado === 0) {
            throw new error_handler_1.HttpError(400, "La transferencia ya está anulada.");
        }
        // 1. Revertir entrada en destino (si existe sucursal destino)
        // Esto anula los lotes creados por la transferencia
        if (transferencia.SucursalDestino) {
            await (0, Inventario_controllers_1.anularLotesPorReferencia)(queryRunner, transferencia.IdTransferencia, "ENTRADA_TRANSFERENCIA", "ANULACION_ENTRADA_TRANSFERENCIA");
        }
        // 2. Revertir salida en origen (Incrementar stock)
        for (const detalle of transferencia.Detalletransferencia) {
            if (detalle.ProductoMedida) {
                await (0, Inventario_controllers_1.IncrementProducto)(queryRunner, detalle.ProductoMedida, transferencia.SucursalOrigen.IdSucursal, detalle.Cantidad, transferencia.IdTransferencia, "ANULACION_SALIDA_TRANSFERENCIA");
            }
            if (detalle.Insumomedida) {
                await (0, Inventario_controllers_1.IncrementInsumo)(queryRunner, detalle.Insumomedida, transferencia.SucursalOrigen.IdSucursal, detalle.Cantidad, transferencia.IdTransferencia, "ANULACION_SALIDA_TRANSFERENCIA");
            }
        }
        // 3. Cambiar estado de la transferencia
        transferencia.Estado = 0;
        await queryRunner.manager.save(transferencia);
        await queryRunner.commitTransaction();
        return res.status(200).json({ message: "Transferencia anulada correctamente y stock restaurado." });
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        if (error instanceof error_handler_1.HttpError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({
            message: "Error al anular la transferencia",
            error: error instanceof Error ? error.message : "Error desconocido"
        });
    }
    finally {
        await queryRunner.release();
    }
};
exports.anularTransferencia = anularTransferencia;
