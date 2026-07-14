"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrarPedidoRapido = exports.actualizarPedido = exports.devolverProductoPedido = exports.finalizarPedido = exports.getPedidos = exports.enviarPedido = exports.anularpedido = exports.registrarPedido = exports.verifyPedido = void 0;
const db_1 = require("../db");
const Pedido_1 = require("../entities/Pedido");
const error_handler_1 = require("../utils/error.handler");
const idGenerator_1 = require("../utils/idGenerator");
const Persona_controllers_1 = require("./Persona.controllers");
const Usuario_controllers_1 = require("./Usuario.controllers");
const ProductoMedida_controllers_1 = require("./ProductoMedida.controllers");
const Promocion_controllers_1 = require("./Promocion.controllers");
const Sucursal_controllers_1 = require("./Sucursal.controllers");
const Fecha_1 = require("../utils/Fecha");
const TipoPedido_controllers_1 = require("./TipoPedido.controllers");
const Detallepedido_controllers_1 = require("./Detallepedido.controllers");
const Venta_1 = require("../entities/Venta");
const Pago_controllers_1 = require("./Pago.controllers");
const Pago_1 = require("../entities/Pago");
const { fecha, hora } = (0, Fecha_1.getFechaHoraBolivia)();
const verifyPedido = async (VentaId) => {
    const existVenta = await Pedido_1.Pedido.findOne({ where: { IdPedido: VentaId } });
    if (!existVenta) {
        throw new error_handler_1.HttpError(404, `El Metodo Venta con ID ${VentaId} no existe.`);
    }
    return existVenta;
};
exports.verifyPedido = verifyPedido;
const registrarPedido = async (req, res) => {
    const queryRunner = db_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const { pedidos, detalles } = req.body;
        console.log(detalles, 'lista de productos');
        if (!pedidos.IdUsuario || !pedidos.IdSucursal) {
            throw new error_handler_1.HttpError(400, "Usuario y Sucursal son requeridos para la pedido.");
        }
        const nuevoIdVenta = await (0, idGenerator_1.generarIdSecuencial)('PED');
        const pedido = new Pedido_1.Pedido();
        pedido.IdPedido = nuevoIdVenta;
        if (pedidos.IdPersona) {
            pedido.Persona = await (0, Persona_controllers_1.verifyPersona)({ PersonaId: pedidos.IdPersona });
        }
        pedido.Usuario = await (0, Usuario_controllers_1.verifyUsuario)({ UsuarioId: pedidos.IdUsuario });
        pedido.Sucursal = await (0, Sucursal_controllers_1.verifySucursal)({ SucursalId: pedidos.IdSucursal });
        pedido.Total = Number(pedidos.Tota);
        if (pedidos.Adelanto > 0)
            pedido.Adelanto = Number(pedidos.Adelanto);
        pedido.FechaRegistro = pedidos.FechaRegistro || fecha;
        pedido.Hora = pedidos.Hora || hora;
        pedido.Tipopedido = await (0, TipoPedido_controllers_1.verifyTipoPedido)(pedidos.IdTipo);
        if (pedidos.Direccion)
            pedido.DireccionEntrega = pedidos.Direccion;
        if (pedidos.Referencia)
            pedido.ReferenciaEntrega = pedidos.Referencia;
        if (pedidos.Link)
            pedido.LinkUbicacion = pedidos.Link;
        if (pedidos.Modo)
            pedido.Detalle = pedidos.Modo;
        await queryRunner.manager.save(pedido);
        // Registrar Adelanto si existe
        if (pedido.Adelanto > 0) {
            await (0, Pago_controllers_1.createPagoPedido)(queryRunner, pedido, pedido.Adelanto, 0, // Sin cambio para adelantos habitualmente
            pedidos.IdMetodoPagoAdelanto || 1 // Por defecto Efectivo si no se envía
            );
        }
        if (detalles) {
            if (detalles.Producto?.length > 0) {
                for (const prod of detalles.Producto) {
                    let promocion = null;
                    if (prod.idPromocion) {
                        promocion = await (0, Promocion_controllers_1.verifyPromocion)({ PromocionId: prod.idPromocion });
                        // Verificar límite de uso si existe
                        if (promocion.LimiteUso > 0) {
                            if (promocion.LimiteUso < prod.Cantidad) {
                                throw new error_handler_1.HttpError(400, `La promoción "${promocion.Nombre}" ha agotado su límite de uso o no tiene suficiente disponible.`);
                            }
                            promocion.LimiteUso -= prod.Cantidad;
                            if (promocion.LimiteUso == 0)
                                promocion.Estado = 0;
                            await queryRunner.manager.save(promocion);
                        }
                    }
                    let presentacion = null;
                    if (prod.idPaquete) {
                        presentacion = await (0, ProductoMedida_controllers_1.verifyProductoMedida)({ PaqueteId: prod.idPaquete });
                    }
                    await (0, Detallepedido_controllers_1.createDetallePedido)(queryRunner, promocion, prod.Cantidad, presentacion, pedido, prod.Precio);
                }
            }
        }
        await queryRunner.commitTransaction();
        return res.status(201).json({
            message: "La pedido se registró correctamente",
            idVenta: nuevoIdVenta
        });
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        if (error instanceof error_handler_1.HttpError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({
            message: "Error al registrar la pedido",
            error: error instanceof Error ? error.message : "Error desconocido"
        });
    }
    finally {
        await queryRunner.release();
    }
};
exports.registrarPedido = registrarPedido;
const anularpedido = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.AppDataSource.query(`UPDATE pedido 
      SET estado = 0 
      WHERE IdPedido = $1
      RETURNING estado AS estado`, [id]);
        // ✅ aquí está el cambio
        if (result.length === 0) {
            return res.status(404).json({ message: "Pedido no encontrado" });
        }
        const nuevoEstado = Number(result[0][0].estado);
        const mensajeAccion = nuevoEstado === 1 ? "habilitaron" : "eliminaron";
        return res.json({
            message: `Se ${mensajeAccion} los datos del pedido correctamente`,
        });
    }
    catch (error) {
        console.error("Error al cambiar el estado del Sucursal:", error);
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.anularpedido = anularpedido;
const enviarPedido = async (req, res) => {
    const queryRunner = db_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const { id } = req.params;
        const pedido = await queryRunner.manager.findOne(Pedido_1.Pedido, {
            where: { IdPedido: id },
            relations: [
                "Detallepedido",
                "Detallepedido.Productomedida",
                "Detallepedido.Productomedida.Producto",
                "Detallepedido.Promocion",
                "Detallepedido.Promocion.Promocionproducto",
                "Sucursal",
                "Usuario",
                "Persona"
            ]
        });
        if (!pedido) {
            throw new error_handler_1.HttpError(404, "Pedido no encontrado");
        }
        if (pedido.Estado !== 1) {
            throw new error_handler_1.HttpError(400, "Solo se pueden enviar pedidos que estén en estado Pendiente (Estado 1)");
        }
        // 1. Procesar Detalles y Decrementar Stock
        if (pedido.Detallepedido && pedido.Detallepedido.length > 0) {
            for (const det of pedido.Detallepedido) {
                const { DecrementProducto, DecrementPromocion } = await Promise.resolve().then(() => __importStar(require("./Inventario.controllers")));
                if (det.Productomedida) {
                    await DecrementProducto(queryRunner, det.Productomedida, pedido.Sucursal.IdSucursal, det.Cantidad, id);
                }
                else if (det.Promocion) {
                    await DecrementPromocion(queryRunner, pedido.Sucursal.IdSucursal, det.Cantidad, det.Promocion, id);
                }
            }
        }
        // 2. Actualizar estado del pedido a 'Enviado'
        pedido.Estado = 2;
        await queryRunner.manager.save(pedido);
        await queryRunner.commitTransaction();
        return res.status(200).json({
            message: "Pedido marcado como ENVIADO y stock decrementado correctamente",
            id: id
        });
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        if (error instanceof error_handler_1.HttpError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({
            message: "Error al enviar el pedido",
            error: error instanceof Error ? error.message : "Error desconocido"
        });
    }
    finally {
        await queryRunner.release();
    }
};
exports.enviarPedido = enviarPedido;
const getPedidos = async (req, res) => {
    try {
        const { estado, tipopedido, idsucursal, producto, promocion, fecha, page = 1, limit = 10, search = '' } = req.query;
        console.log(estado, tipopedido, idsucursal, producto, promocion, fecha, page, limit, search);
        const currentPage = Number(page);
        const currentLimit = Number(limit);
        const offset = (currentPage - 1) * currentLimit;
        const query = `
      WITH filtered_pedidos AS (
        SELECT p.*
        FROM pedido p
        WHERE
          ($1::int IS NULL OR p.estado = $1)
          AND ($2::text IS NULL OR p.idtipopedido = $2)
          AND (
            $3::text IS NULL OR $3::text = 'TODOS'
            OR p.idsucursal = $3
          )
          AND (
            $4::varchar IS NULL
            OR EXISTS (
              SELECT 1 FROM detallepedido dp 
              WHERE dp.idpedido = p.idpedido 
              AND (dp.idproducto = $4 OR EXISTS (
                SELECT 1 FROM productomedida pm WHERE pm.idproductomedida = dp.idproductomedida AND pm.idproducto = $4
              ))
            )
          )
          AND (
            $5::varchar IS NULL
            OR EXISTS (
              SELECT 1 FROM detallepedido dp 
              WHERE dp.idpedido = p.idpedido AND dp.idpromocion = $5
            )
          )
          AND (
            $8::text = '' OR p.idpedido ILIKE $8 
            OR EXISTS (
              SELECT 1 FROM persona per WHERE per.idpersona = p.idpersona 
              AND (per.nombre ILIKE $8 OR per.apellidopaterno ILIKE $8 OR per.apellidomaterno ILIKE $8)
            )
          )
          AND ($9::date IS NULL OR p.fecharegistro = $9)
      )
      SELECT 
        p.idpedido,
        p.fecharegistro,
        p.hora,
        p.detalle,
        p.total,
        p.adelanto,
        p.devolucion,
        p.direccionentrega,
        p.referenciaentrega,
        p.linkubicacion,
        p.estado,
        COUNT(*) OVER() AS total_count,

        -- SUCURSAL
        json_build_object(
          'IdSucursal', s.idsucursal,
          'Nombre', s.nombre
        ) AS "Sucursal",

        -- PERSONA
        CASE 
          WHEN per.idpersona IS NOT NULL THEN
            json_build_object(
              'IdPersona', per.idpersona,
              'Nombre', per.nombre,
              'Imagen', per.imagen,
              'ApellidoPaterno', per.apellidopaterno,
              'ApellidoMaterno', per.apellidomaterno
            )
          ELSE NULL
        END AS "Persona",

        -- USUARIO
        json_build_object(
          'IdUsuario', u.idusuario,
          'Username', u.Username
        ) AS "Usuario",

        -- TIPO PEDIDO
        json_build_object(
          'IdTipoPedido', tp.idtipopedido,
          'Nombre', tp.nombre
        ) AS "Tipopedido",

        -- VENTA Y FACTURA (SI EXISTEN)
        CASE 
          WHEN v.idventa IS NOT NULL THEN
            json_build_object(
              'IdVenta', v.idventa,
              'FechaVenta', v.fechaventa,
              'HoraVenta', v.horaventa,
              'PrecioTotal', v.preciototal,
              'Factura', CASE 
                WHEN f.idfactura IS NOT NULL THEN
                  json_build_object(
                    'IdFactura', f.idfactura,
                    'NroFactura', f.nrofactura,
                    'Aprobado', f.aprobado,
                    'NombreFacturacion', f.nombrefacturacion,
                    'NitCiFacturacion', f.nitcifacturacion,
                    'Enlace', e.enlace
                  )
                ELSE NULL
              END
            )
          ELSE NULL
        END AS "Venta",

        --  PAGOS (ADELANTOS Y PAGOS FINALES)
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'IdPago', pg.idpago,
              'Monto', pg.monto,
              'Cambio', pg.cambio,
              'FechaPago', pg.fechapago,
              'Metodopago', json_build_object(
                'IdMetodoPago', mp.idmetodopago,
                'Nombre', mp.nombre
              )
            )
          ) FILTER (WHERE pg.idpago IS NOT NULL),
          '[]'
        ) AS "Pagos",

        -- DETALLE PEDIDO
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'IdDetallePedido', dp.iddetallepedido,
              'Cantidad', dp.cantidad,
              'CantidadDevuelta', dp.cantidad_devuelta,
              'Precio', dp.precio,
              'Subtotal', dp.subtotal,

              'Producto', CASE
                WHEN prod.idproducto IS NOT NULL THEN
                  json_build_object(
                    'IdProducto', prod.idproducto,
                    'Nombre', prod.nombre,
                    'Imagen', prod.imagen
                  )
                ELSE NULL
              END,

              'Productomedida', CASE
                WHEN pm.idproductomedida IS NOT NULL THEN
                  json_build_object(
                    'IdProductoMedida', pm.idproductomedida,
                    'Cantidad', pm.cantidad,
                    'PrecioVenta', pm.precioventa,
                    'Presentacion', json_build_object(
                      'IdPresentacion', pres.idpresentacion,
                      'Nombre', pres.nombre
                    ),
                    'Producto', json_build_object(
                      'IdProducto', prod_pm.idproducto,
                      'Nombre', prod_pm.nombre,
                      'Imagen', prod_pm.imagen
                    )
                  )
                ELSE NULL
              END,

              'Promocion', CASE
                WHEN prom.idpromocion IS NOT NULL THEN
                  json_build_object(
                    'IdPromocion', prom.idpromocion,
                    'Nombre', prom.nombre,
                    'PrecioPromocion', prom.preciopromocion,
                    'Imagen', prom.imagen,
                    'Productos', (
                      SELECT json_agg(
                        json_build_object(
                          'IdPromocionProducto', pp.idpromocionproducto,
                          'Cantidad', pp.cantidad,
                          'Producto', json_build_object(
                            'Nombre', COALESCE(p_pp.nombre, p_ppm.nombre)
                          )
                        )
                      )
                      FROM promocionproducto pp
                      LEFT JOIN producto p_pp ON p_pp.idproducto = pp.idproducto
                      LEFT JOIN productomedida ppm ON ppm.idproductomedida = pp.idproductomedida
                      LEFT JOIN producto p_ppm ON p_ppm.idproducto = ppm.idproducto
                      WHERE pp.idpromocion = prom.idpromocion
                    )
                  )
                ELSE NULL
              END
            )
          ) FILTER (WHERE dp.iddetallepedido IS NOT NULL),
          '[]'
        ) AS "Detallepedido"

      FROM filtered_pedidos p
      LEFT JOIN sucursal s ON s.idsucursal = p.idsucursal
      LEFT JOIN persona per ON per.idpersona = p.idpersona
      LEFT JOIN usuario u ON u.idusuario = p.idusuario
      LEFT JOIN tipopedido tp ON tp.idtipopedido = p.idtipopedido
      LEFT JOIN detallepedido dp ON dp.idpedido = p.idpedido
      LEFT JOIN producto prod ON prod.idproducto = dp.idproducto
      LEFT JOIN productomedida pm ON pm.idproductomedida = dp.idproductomedida
      LEFT JOIN presentacion pres ON pres.idpresentacion = pm.idpresentacion
      LEFT JOIN producto prod_pm ON prod_pm.idproducto = pm.idproducto
      LEFT JOIN promocion prom ON prom.idpromocion = dp.idpromocion
      LEFT JOIN venta v ON v.idpedido = p.idpedido
      LEFT JOIN factura f ON f.idventa = v.idventa
      LEFT JOIN enlace e ON e.idenlace = f.idenlace
      LEFT JOIN pago pg ON pg.idpedido = p.idpedido
      LEFT JOIN metodopago mp ON mp.idmetodopago = pg.idmetodopago

      GROUP BY 
        p.idpedido, p.fecharegistro, p.hora, p.detalle, p.total, p.adelanto, p.devolucion,
        p.direccionentrega, p.referenciaentrega, p.linkubicacion, p.estado,
        s.idsucursal, s.nombre, per.idpersona, u.idusuario, tp.idtipopedido,
        v.idventa, v.fechaventa, v.horaventa, v.preciototal, 
        f.idfactura, f.nrofactura, f.aprobado, f.nombrefacturacion, f.nitcifacturacion, e.enlace

      ORDER BY p.fecharegistro DESC, p.hora DESC
      LIMIT $6 OFFSET $7;
    `;
        const result = await db_1.AppDataSource.query(query, [
            estado || null,
            tipopedido || null,
            idsucursal || "TODOS",
            producto || null,
            promocion || null,
            currentLimit,
            offset,
            search ? `%${search}%` : '',
            fecha || null
        ]);
        return res.json({
            total: result.length > 0 ? Number(result[0].total_count) : 0,
            page: currentPage,
            limit: currentLimit,
            data: result.map(({ total_count, ...rest }) => rest),
        });
    }
    catch (error) {
        console.error("Error en getPedidos:", error);
        return res.status(500).json({
            message: "Error al obtener los pedidos",
            error: error instanceof Error ? error.message : "Error desconocido"
        });
    }
};
exports.getPedidos = getPedidos;
const finalizarPedido = async (req, res) => {
    const queryRunner = db_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const { id } = req.params;
        const { pagoFinal } = req.body; // { Monto, Cambio, IdMetodoPago }
        const pedido = await queryRunner.manager.findOne(Pedido_1.Pedido, {
            where: { IdPedido: id },
            relations: [
                "Detallepedido",
                "Detallepedido.Productomedida",
                "Detallepedido.Producto",
                "Detallepedido.Promocion",
                "Sucursal",
                "Usuario",
                "Persona"
            ]
        });
        if (!pedido) {
            throw new error_handler_1.HttpError(404, "Pedido no encontrado");
        }
        if (pedido.Estado !== 2) {
            throw new error_handler_1.HttpError(400, "Solo se pueden finalizar pedidos que hayan sido enviados (Estado 2)");
        }
        // 1. Crear Venta Oficial
        const nuevoIdVenta = await (0, idGenerator_1.generarIdSecuencial)('V');
        const venta = new Venta_1.Venta();
        venta.IdVenta = nuevoIdVenta;
        venta.FechaVenta = fecha;
        venta.HoraVenta = hora;
        venta.PrecioTotal = Number(pedido.Total);
        venta.Usuario = pedido.Usuario;
        venta.Persona = pedido.Persona;
        venta.Sucursal = pedido.Sucursal;
        venta.Pedido = pedido;
        await queryRunner.manager.save(venta);
        // 2. Vincular adelantos previos a la nueva Venta
        await queryRunner.manager.update(Pago_1.Pago, { Pedido: { IdPedido: id }, Venta: null }, { Venta: venta });
        // 3. Crear Pago final (el saldo que paga al recibir)
        if (pagoFinal && pagoFinal.Monto > 0) {
            await (0, Pago_controllers_1.createPago)(queryRunner, venta, pagoFinal.Monto, (pedido.Total - pagoFinal.Monto) || 0, pagoFinal.IdMetodoPago || 1, pedido);
        }
        // 4. Crear DetalleVenta (ya no descuenta stock porque se hizo en enviarPedido)
        if (pedido.Detallepedido && pedido.Detallepedido.length > 0) {
            for (const det of pedido.Detallepedido) {
                const { Detalleventa } = await Promise.resolve().then(() => __importStar(require("../entities/DetalleVenta")));
                const dv = new Detalleventa();
                dv.IdDetalleVenta = await (0, idGenerator_1.generarIdSecuencial)('DV');
                dv.Venta = venta;
                dv.Producto = det.Producto;
                dv.Productomedida = det.Productomedida;
                dv.Promocion = det.Promocion;
                dv.Cantidad = det.Cantidad;
                dv.Precio = det.Precio;
                await queryRunner.manager.save(dv);
            }
        }
        // 5. Finalizar Pedido
        pedido.Estado = 3;
        await queryRunner.manager.save(pedido);
        await queryRunner.commitTransaction();
        return res.status(200).json({
            message: "Pedido finalizado y venta registrada correctamente",
            idVenta: nuevoIdVenta
        });
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        if (error instanceof error_handler_1.HttpError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({
            message: "Error al finalizar el pedido",
            error: error instanceof Error ? error.message : "Error desconocido"
        });
    }
    finally {
        await queryRunner.release();
    }
};
exports.finalizarPedido = finalizarPedido;
const devolverProductoPedido = async (req, res) => {
    const queryRunner = db_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const { id } = req.params;
        const { idDetallePedido, cantidadDevolver, descripcion } = req.body;
        // 1. Validar pedido y su estado
        const pedido = await queryRunner.manager.findOne(Pedido_1.Pedido, {
            where: { IdPedido: id },
            relations: ["Venta", "Sucursal"]
        });
        if (!pedido)
            throw new error_handler_1.HttpError(404, "Pedido no encontrado");
        if (pedido.Estado === 3)
            throw new error_handler_1.HttpError(400, "El pedido ya está finalizado, no se admiten devoluciones.");
        const { Detallepedido } = await Promise.resolve().then(() => __importStar(require("../entities/DetallePedido")));
        const detalle = await queryRunner.manager.findOne(Detallepedido, {
            where: { IdDetallePedido: idDetallePedido, Pedido: { IdPedido: id } },
            relations: ["Productomedida",
                "Productomedida.Producto",
                "Promocion",
                "Promocion.Promocionproducto",
                "Promocion.Promocionproducto.Productomedida"]
        });
        if (!detalle)
            throw new error_handler_1.HttpError(404, "Detalle de pedido no encontrado");
        if (Number(detalle.Cantidad) < cantidadDevolver) {
            throw new error_handler_1.HttpError(400, "La cantidad a devolver supera la cantidad pedida");
        }
        // 2. Restaurar Stock (Solo si el pedido ya fue enviado, es decir, ya se descontó stock)
        if (pedido.Estado === 2) {
            const { IncrementProducto, IncrementPromocion } = await Promise.resolve().then(() => __importStar(require("./Inventario.controllers")));
            if (detalle.Productomedida) {
                await IncrementProducto(queryRunner, detalle.Productomedida, pedido.Sucursal.IdSucursal, cantidadDevolver, id);
            }
            else if (detalle.Promocion) {
                await IncrementPromocion(queryRunner, pedido.Sucursal.IdSucursal, cantidadDevolver, detalle.Promocion, id);
            }
        }
        // 3. Ajustar montos y cantidades
        const montoADescontar = Number(detalle.Precio) * cantidadDevolver;
        // Actualizar detalle
        detalle.Cantidad = Number(detalle.Cantidad) - cantidadDevolver;
        detalle.CantidadDevuelta = Number(detalle.CantidadDevuelta || 0) + cantidadDevolver;
        detalle.Subtotal = Number(detalle.Subtotal) - montoADescontar;
        // Nota: Ya no eliminamos el registro si la cantidad llega a 0, 
        // para poder mantener el registro de lo que se devolvió.
        await queryRunner.manager.save(detalle);
        // Actualizar Cabecera Pedido
        pedido.Total = Number(pedido.Total) - montoADescontar;
        if (descripcion)
            pedido.devolucion = descripcion;
        await queryRunner.manager.save(pedido);
        // 4. Si ya existía una venta (flujo antiguo o post-finalización), también ajustarla
        if (pedido.Venta) {
            const venta = pedido.Venta;
            venta.PrecioTotal = Number(venta.PrecioTotal) - montoADescontar;
            await queryRunner.manager.save(venta);
            // Intentar buscar y ajustar detalleventa si existe
            const { Detalleventa } = await Promise.resolve().then(() => __importStar(require("../entities/DetalleVenta")));
            const dv = await queryRunner.manager.findOne(Detalleventa, {
                where: { Venta: { IdVenta: venta.IdVenta }, Productomedida: detalle.Productomedida, Promocion: detalle.Promocion }
            });
            if (dv) {
                dv.Cantidad = Number(dv.Cantidad) - cantidadDevolver;
                if (dv.Cantidad <= 0)
                    await queryRunner.manager.remove(dv);
                else
                    await queryRunner.manager.save(dv);
            }
        }
        await queryRunner.commitTransaction();
        return res.json({
            message: "Devolución y ajuste de stock procesados correctamente",
            nuevoTotal: pedido.Total
        });
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        if (error instanceof error_handler_1.HttpError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({
            message: "Error al procesar la devolución",
            error: error instanceof Error ? error.message : "Error desconocido"
        });
    }
    finally {
        await queryRunner.release();
    }
};
exports.devolverProductoPedido = devolverProductoPedido;
const actualizarPedido = async (req, res) => {
    const queryRunner = db_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const { id } = req.params;
        const { pedidos, detalles } = req.body;
        const pedido = await queryRunner.manager.findOne(Pedido_1.Pedido, {
            where: { IdPedido: id },
            relations: [
                "Sucursal",
                "Detallepedido",
                "Detallepedido.Productomedida",
                "Detallepedido.Promocion",
                "Detallepedido.Promocion.Promocionproducto",
                "Detallepedido.Promocion.Promocionproducto.Productomedida"
            ]
        });
        if (!pedido) {
            throw new error_handler_1.HttpError(404, "Pedido no encontrado");
        }
        if (pedido.Estado !== 1) {
            throw new error_handler_1.HttpError(400, "Solo se pueden actualizar pedidos en estado Pendiente");
        }
        // 1. Si hay nuevos detalles, eliminamos los antiguos
        if (detalles) {
            if (pedido.Detallepedido) {
                for (const detalle of pedido.Detallepedido) {
                    // Restaurar límite de uso de promoción si aplica
                    if (detalle.Promocion && detalle.Promocion.LimiteUso != null) {
                        detalle.Promocion.LimiteUso += detalle.Cantidad;
                        detalle.Promocion.Estado = 1;
                        await queryRunner.manager.save(detalle.Promocion);
                    }
                    await queryRunner.manager.remove(detalle);
                }
            }
        }
        // 2. Actualizar cabecera del Pedido
        if (pedidos.IdPersona) {
            pedido.Persona = await (0, Persona_controllers_1.verifyPersona)({ PersonaId: pedidos.IdPersona });
        }
        if (pedidos.IdUsuario) {
            pedido.Usuario = await (0, Usuario_controllers_1.verifyUsuario)({ UsuarioId: pedidos.IdUsuario });
        }
        if (pedidos.IdSucursal) {
            pedido.Sucursal = await (0, Sucursal_controllers_1.verifySucursal)({ SucursalId: pedidos.IdSucursal });
        }
        if (pedidos.IdTipo) {
            pedido.Tipopedido = await (0, TipoPedido_controllers_1.verifyTipoPedido)(pedidos.IdTipo);
        }
        pedido.Total = Number(pedidos.Tota || pedido.Total);
        if (pedidos.Adelanto !== undefined)
            pedido.Adelanto = Number(pedidos.Adelanto);
        if (pedidos.Direccion)
            pedido.DireccionEntrega = pedidos.Direccion;
        if (pedidos.Referencia)
            pedido.ReferenciaEntrega = pedidos.Referencia;
        if (pedidos.Link)
            pedido.LinkUbicacion = pedidos.Link;
        if (pedidos.Modo)
            pedido.Detalle = pedidos.Modo;
        await queryRunner.manager.save(pedido);
        // 3. Manejo de Adelantos (Pagos)
        if (pedidos.Adelanto > 0) {
            const pagoExistente = await queryRunner.manager.findOne(Pago_1.Pago, { where: { Pedido: { IdPedido: id } } });
            if (pagoExistente) {
                pagoExistente.Monto = pedidos.Adelanto;
                pagoExistente.Metodopago = await (await Promise.resolve().then(() => __importStar(require("./MetodoPago.controllers")))).verifyMetodoPago({ MetodoPagoId: pedidos.IdMetodoPagoAdelanto || 1 });
                await queryRunner.manager.save(pagoExistente);
            }
            else {
                await (0, Pago_controllers_1.createPagoPedido)(queryRunner, pedido, pedidos.Adelanto, 0, pedidos.IdMetodoPagoAdelanto || 1);
            }
        }
        // 4. Procesar nuevos Detalles
        if (detalles && detalles.Producto?.length > 0) {
            for (const prod of detalles.Producto) {
                let promocion = null;
                if (prod.idPromocion) {
                    promocion = await (0, Promocion_controllers_1.verifyPromocion)({ PromocionId: prod.idPromocion });
                    if (promocion.LimiteUso > 0) {
                        if (promocion.LimiteUso < prod.Cantidad) {
                            throw new error_handler_1.HttpError(400, `La promoción "${promocion.Nombre}" ha agotado su límite de uso.`);
                        }
                        promocion.LimiteUso -= prod.Cantidad;
                        if (promocion.LimiteUso === 0)
                            promocion.Estado = 0;
                        await queryRunner.manager.save(promocion);
                    }
                }
                let presentacion = null;
                if (prod.idPaquete) {
                    presentacion = await (0, ProductoMedida_controllers_1.verifyProductoMedida)({ PaqueteId: prod.idPaquete });
                }
                await (0, Detallepedido_controllers_1.createDetallePedido)(queryRunner, promocion, prod.Cantidad, presentacion, pedido, prod.Precio);
            }
        }
        await queryRunner.commitTransaction();
        return res.status(200).json({ message: "El pedido se actualizó correctamente" });
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        if (error instanceof error_handler_1.HttpError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({
            message: "Error al actualizar el pedido",
            error: error instanceof Error ? error.message : "Error desconocido"
        });
    }
    finally {
        await queryRunner.release();
    }
};
exports.actualizarPedido = actualizarPedido;
const registrarPedidoRapido = async (req, res) => {
    const queryRunner = db_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const { pedidos, detalles, pagoFinal } = req.body;
        // 1. Registrar el pedido normalmente (pero forzamos estado finalizado al terminar)
        if (!pedidos.IdUsuario || !pedidos.IdSucursal) {
            throw new error_handler_1.HttpError(400, "Usuario y Sucursal son requeridos.");
        }
        const nuevoIdPedido = await (0, idGenerator_1.generarIdSecuencial)('PED');
        const pedido = new Pedido_1.Pedido();
        pedido.IdPedido = nuevoIdPedido;
        if (pedidos.IdPersona) {
            pedido.Persona = await (0, Persona_controllers_1.verifyPersona)({ PersonaId: pedidos.IdPersona });
        }
        pedido.Usuario = await (0, Usuario_controllers_1.verifyUsuario)({ UsuarioId: pedidos.IdUsuario });
        pedido.Sucursal = await (0, Sucursal_controllers_1.verifySucursal)({ SucursalId: pedidos.IdSucursal });
        pedido.Total = Number(pedidos.Tota);
        pedido.FechaRegistro = pedidos.FechaRegistro || fecha;
        pedido.Hora = pedidos.Hora || hora;
        pedido.Tipopedido = await (0, TipoPedido_controllers_1.verifyTipoPedido)(pedidos.IdTipo);
        pedido.Estado = 3; // Estado 3: Entregado/Finalizado
        await queryRunner.manager.save(pedido);
        // 2. Procesar Detalles y Decrementar Stock inmediatamente
        if (detalles && detalles.Producto?.length > 0) {
            const { DecrementProducto, DecrementPromocion } = await Promise.resolve().then(() => __importStar(require("./Inventario.controllers")));
            for (const prod of detalles.Producto) {
                let promocion = null;
                if (prod.idPromocion) {
                    promocion = await (0, Promocion_controllers_1.verifyPromocion)({ PromocionId: prod.idPromocion });
                    if (promocion.LimiteUso > 0) {
                        promocion.LimiteUso -= prod.Cantidad;
                        if (promocion.LimiteUso <= 0)
                            promocion.Estado = 0;
                        await queryRunner.manager.save(promocion);
                    }
                }
                let presentacion = null;
                if (prod.idPaquete) {
                    presentacion = await (0, ProductoMedida_controllers_1.verifyProductoMedida)({ PaqueteId: prod.idPaquete });
                }
                // Crear detalle pedido
                await (0, Detallepedido_controllers_1.createDetallePedido)(queryRunner, promocion, prod.Cantidad, presentacion, pedido, prod.Precio);
                // Decrementar stock
                if (presentacion) {
                    await DecrementProducto(queryRunner, presentacion, pedido.Sucursal.IdSucursal, prod.Cantidad, nuevoIdPedido);
                }
                else if (promocion) {
                    await DecrementPromocion(queryRunner, pedido.Sucursal.IdSucursal, prod.Cantidad, promocion, nuevoIdPedido);
                }
            }
        }
        // 3. Crear Venta Oficial
        const nuevoIdVenta = await (0, idGenerator_1.generarIdSecuencial)('V');
        const venta = new Venta_1.Venta();
        venta.IdVenta = nuevoIdVenta;
        venta.FechaVenta = fecha;
        venta.HoraVenta = hora;
        venta.PrecioTotal = Number(pedido.Total);
        venta.Usuario = pedido.Usuario;
        venta.Persona = pedido.Persona;
        venta.Sucursal = pedido.Sucursal;
        venta.Pedido = pedido;
        await queryRunner.manager.save(venta);
        // 4. Registrar Pago
        if (pagoFinal) {
            await (0, Pago_controllers_1.createPago)(queryRunner, venta, Number(pagoFinal.Monto), Number(pagoFinal.Cambio) || 0, pagoFinal.IdMetodoPago || 1, pedido);
        }
        // 5. Crear Detalles de Venta
        const detallesPedido = await queryRunner.manager.find(await (await Promise.resolve().then(() => __importStar(require("../entities/DetallePedido")))).Detallepedido, { where: { Pedido: { IdPedido: nuevoIdPedido } }, relations: ["Producto", "Productomedida", "Promocion"] });
        for (const det of detallesPedido) {
            const { Detalleventa } = await Promise.resolve().then(() => __importStar(require("../entities/DetalleVenta")));
            const dv = new Detalleventa();
            dv.IdDetalleVenta = await (0, idGenerator_1.generarIdSecuencial)('DV');
            dv.Venta = venta;
            dv.Producto = det.Producto;
            dv.Productomedida = det.Productomedida;
            dv.Promocion = det.Promocion;
            dv.Cantidad = det.Cantidad;
            dv.Precio = det.Precio;
            await queryRunner.manager.save(dv);
        }
        await queryRunner.commitTransaction();
        return res.status(201).json({
            message: "Pedido registrado y entregado correctamente",
            idPedido: nuevoIdPedido,
            idVenta: nuevoIdVenta
        });
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        if (error instanceof error_handler_1.HttpError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({
            message: "Error en registro rápido",
            error: error instanceof Error ? error.message : "Error desconocido"
        });
    }
    finally {
        await queryRunner.release();
    }
};
exports.registrarPedidoRapido = registrarPedidoRapido;
