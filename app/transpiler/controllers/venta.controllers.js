"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.actualizarVenta = exports.getVentasSucursal = exports.anularVenta = exports.registrarVenta = exports.verifyVenta = exports.getVentas = void 0;
const Venta_1 = require("../entities/Venta");
const Pago_1 = require("../entities/Pago");
const error_handler_1 = require("../utils/error.handler");
const Usuario_controllers_1 = require("./Usuario.controllers");
const idGenerator_1 = require("../utils/idGenerator");
const DetalleVenta_controllers_1 = require("./DetalleVenta.controllers");
const Pago_controllers_1 = require("./Pago.controllers");
const Persona_controllers_1 = require("./Persona.controllers");
const Inventario_controllers_1 = require("./Inventario.controllers");
const Sucursal_controllers_1 = require("./Sucursal.controllers");
const db_1 = require("../db");
const Promocion_controllers_1 = require("./Promocion.controllers");
const ProductoMedida_controllers_1 = require("./ProductoMedida.controllers");
const MetodoPago_controllers_1 = require("./MetodoPago.controllers");
const Fecha_1 = require("../utils/Fecha");
const { fecha, hora } = (0, Fecha_1.getFechaHoraBolivia)();
const getVentas = async (req, res) => {
    try {
        const ventas = await Venta_1.Venta.find({
            relations: [
                "Estado",
                "Usuario",
                "Usuario.Usuariosucursal",
                "Usuario.Usuariosucursal.Sucursal"
            ]
        });
        return res.json(ventas);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getVentas = getVentas;
const verifyVenta = async (VentaId) => {
    const existVenta = await Venta_1.Venta.findOne({ where: { IdVenta: VentaId } });
    if (!existVenta) {
        throw new error_handler_1.HttpError(404, `El Metodo Venta con ID ${VentaId} no existe.`);
    }
    return existVenta;
};
exports.verifyVenta = verifyVenta;
const registrarVenta = async (req, res) => {
    const queryRunner = db_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const { ventas, detalles } = req.body;
        console.log(detalles, 'lista de productos');
        // 1. Validaciones básicas
        if (!ventas.IdUsuario || !ventas.IdSucursal) {
            throw new error_handler_1.HttpError(400, "Usuario y Sucursal son requeridos para la venta.");
        }
        // 2. Generar ID y preparar cabecera de Venta
        const nuevoIdVenta = await (0, idGenerator_1.generarIdSecuencial)('V');
        const venta = new Venta_1.Venta();
        venta.IdVenta = nuevoIdVenta;
        // 3. Manejo de Cliente (Persona)
        if (ventas.IdPersona) {
            venta.Persona = await (0, Persona_controllers_1.verifyPersona)({ PersonaId: ventas.IdPersona });
        }
        venta.Usuario = await (0, Usuario_controllers_1.verifyUsuario)({ UsuarioId: ventas.IdUsuario });
        venta.Sucursal = await (0, Sucursal_controllers_1.verifySucursal)({ SucursalId: ventas.IdSucursal });
        if (ventas.Monto > 0)
            venta.PrecioTotal = Number(ventas.Monto);
        venta.FechaVenta = ventas.FechaVenta || fecha;
        venta.HoraVenta = ventas.HoraVenta || hora;
        // Guardar venta dentro de la transacción
        await queryRunner.manager.save(venta);
        // 4. Registro de Pago
        await (0, Pago_controllers_1.createPago)(queryRunner, venta, ventas.Monto, ventas.Cambio, ventas.IdMetodoPago);
        // 5. Procesar Detalles (Presentaciones Productos, Promociones)
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
                    await (0, DetalleVenta_controllers_1.createDetalleventa)(queryRunner, venta, presentacion, promocion, prod.Cantidad, prod.precioUnitario, ventas.IdSucursal);
                }
            }
        }
        // Confirmar todo si llegamos aquí
        await queryRunner.commitTransaction();
        return res.status(201).json({
            message: "La venta se registró correctamente",
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
            message: "Error al registrar la venta",
            error: error instanceof Error ? error.message : "Error desconocido"
        });
    }
    finally {
        // Liberar el query runner
        await queryRunner.release();
    }
};
exports.registrarVenta = registrarVenta;
const anularVenta = async (req, res) => {
    const queryRunner = db_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const { id } = req.params;
        const venta = await queryRunner.manager.findOne(Venta_1.Venta, {
            where: { IdVenta: id },
            relations: [
                "Sucursal",
                "Detalleventa",
                "Detalleventa.Producto",
                "Detalleventa.Productomedida",
                "Detalleventa.Promocion",
                "Detalleventa.Promocion.Promocionproducto",
                "Detalleventa.Promocion.Promocionproducto.Productomedida"
            ]
        });
        if (!venta) {
            throw new error_handler_1.HttpError(404, "Venta no encontrada");
        }
        if (venta.Estado === 0) {
            throw new error_handler_1.HttpError(400, "La venta ya está anulada");
        }
        // 1. Cambiar el estado de la venta a anulado (0)
        venta.Estado = 0;
        await queryRunner.manager.save(venta);
        const IdSucursal = venta.Sucursal.IdSucursal;
        // 2. Restaurar stock para cada detalle
        if (venta.Detalleventa) {
            for (const detalle of venta.Detalleventa) {
                if (detalle.Productomedida) {
                    const presentacion = await (0, ProductoMedida_controllers_1.verifyProductoMedida)({ PaqueteId: detalle.Productomedida.IdProductoMedida });
                    await (0, Inventario_controllers_1.IncrementProducto)(queryRunner, presentacion, IdSucursal, detalle.Cantidad, id);
                }
                else if (detalle.Promocion) {
                    // Restaurar límite de uso si aplica
                    if (detalle.Promocion.LimiteUso != null) {
                        detalle.Promocion.LimiteUso += detalle.Cantidad;
                        detalle.Promocion.Estado = 1; // Reactivar si estaba agotada
                        await queryRunner.manager.save(detalle.Promocion);
                    }
                    await (0, Inventario_controllers_1.IncrementPromocion)(queryRunner, IdSucursal, detalle.Cantidad, detalle.Promocion, id);
                }
            }
        }
        await queryRunner.commitTransaction();
        return res.status(200).json({ message: "Venta anulada correctamente y stock restaurado." });
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        if (error instanceof error_handler_1.HttpError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({
            message: "Error al anular la venta",
            error: error instanceof Error ? error.message : "Error desconocido"
        });
    }
    finally {
        await queryRunner.release();
    }
};
exports.anularVenta = anularVenta;
const getVentasSucursal = async (req, res) => {
    try {
        const { producto, promocion, id, fecha, pago, estado, factura, page = 1, limit = 10 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const query = `
      WITH filtered_ventas AS (
        SELECT v.*
        FROM venta v
        WHERE
          ($1::date IS NULL OR v.fechaventa = $1)

          AND (
            $2::text = 'TODOS'
            OR v.idsucursal = $2
          )

          AND ( 
            $3::int = 0
            OR EXISTS (
              SELECT 1
              FROM pago pg
              WHERE pg.idventa = v.idventa
              AND pg.idmetodopago = $3
            )
          )
 
          AND (
            $4::varchar IS NULL
            OR EXISTS (
              SELECT 1
              FROM detalleventa dv
              INNER JOIN productomedida pm
                ON pm.idproductomedida = dv.idproductomedida
              WHERE dv.idventa = v.idventa
              AND pm.idproducto = $4
            )
          )

          AND (
            $5::varchar IS NULL
            OR EXISTS (
              SELECT 1
              FROM detalleventa dv
              WHERE dv.idventa = v.idventa
              AND dv.idpromocion = $5
            )
          )

          AND (
            $6::int IS NULL
            OR v.estado = $6
          )

          AND (
            $9::text IS NULL OR $9::text = 'TODOS'
            OR ($9::text = 'SI' AND EXISTS (SELECT 1 FROM factura f WHERE f.idventa = v.idventa))
            OR ($9::text = 'NO' AND NOT EXISTS (SELECT 1 FROM factura f WHERE f.idventa = v.idventa))
          )
      )

      SELECT
        v.idventa,
        v.fechaventa,
        v.horaventa,
        v.preciototal,
        v.estado,
        COUNT(*) OVER() AS total,

        -- 🔥 PERSONA
        json_build_object(
          'IdPersona', per.idpersona,
          'Nombre', per.nombre,
          'ApellidoPaterno', per.apellidopaterno,
          'ApellidoMaterno', per.apellidomaterno,

           'Documento',
           json_build_object(
           'IdDocumento', d.iddocumento,
           'Documento', d.documento,
          'Complemento', row_to_json(cmp)
           )
        ) AS "Persona",

        -- 🔥 SUCURSAL
        json_build_object(
          'IdSucursal', s.idsucursal,
          'Nombre', s.nombre
        ) AS "Sucursal",

        -- 🔥 USUARIO
        json_build_object(
          'IdUsuario', u.idusuario,
          'Usuario', u.Username
        ) AS "Usuario",

        -- 🔥 PEDIDO (SI EXISTE)
        CASE 
          WHEN ped.idpedido IS NOT NULL THEN
            json_build_object(
              'IdPedido', ped.idpedido,
              'FechaRegistro', ped.fecharegistro,
              'Adelanto', ped.adelanto,
              'TotalPedido', ped.total,
              'Pagos', (
                SELECT COALESCE(
                  json_agg(
                    jsonb_build_object(
                      'IdPago', pg2.idpago,
                      'Monto', pg2.monto,
                      'FechaPago', pg2.fechapago,
                      'Metodopago', json_build_object(
                        'IdMetodoPago', mp2.idmetodopago,
                        'Nombre', mp2.nombre
                      )
                    )
                  ),
                  '[]'
                )
                FROM pago pg2
                LEFT JOIN metodopago mp2 ON mp2.idmetodopago = pg2.idmetodopago
                WHERE pg2.idpedido = ped.idpedido
              )
            )
          ELSE NULL
        END AS "Pedido",

        -- 🔥 FACTURA
        CASE 
          WHEN f.idfactura IS NOT NULL THEN
            json_build_object(
              'IdFactura', f.idfactura,
              'NroFactura', f.nrofactura,
              'FechaEmicion', f.fechaemicion,
              'HoraEmicion', f.horaemicion,
              'Aprobado', f.aprobado,
              'IdEnlace', f.idenlace,
              'NitCiFacturacion', f.nitcifacturacion,
              'NombreFacturacion', f.nombrefacturacion,
              'Enlace', e.enlace
            )
          ELSE NULL
        END AS "Factura",

        --  DETALLE VENTA
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(

              'IdDetalleVenta', dv.iddetalleventa,
              'Cantidad', dv.cantidad,
              'Precio', dv.precio,
              'Descuento', dv.descuento,

              --  PRODUCTO DIRECTO
              'Producto', CASE
                WHEN prod.idproducto IS NOT NULL THEN
                  json_build_object(
                    'IdProducto', prod.idproducto,
                    'Nombre', prod.nombre,
                    'Descripcion', prod.descripcion,
                    'Imagen', prod.imagen
                  )
                ELSE NULL
              END,

              --  PRODUCTO MEDIDA
              'Productomedida', CASE
                WHEN pm.idproductomedida IS NOT NULL THEN
                  json_build_object(
                    'IdProductoMedida', pm.idproductomedida,
                    'Cantidad', pm.cantidad,
                    'PrecioVenta', pm.precioventa,
                    'PrecioMayor', pm.preciomayor,
                    'Imagen', pm.imagen,

                    --  PRESENTACION
                    'Presentacion', json_build_object(
                      'IdPresentacion', pres.idpresentacion,
                      'Nombre', pres.nombre
                    ),

                    --  PRODUCTO
                    'Producto', json_build_object(
                      'IdProducto', pmp.idproducto,
                      'Nombre', pmp.nombre,
                      'Descripcion', pmp.descripcion,
                      'Imagen', pmp.imagen
                    )
                  )
                ELSE NULL
              END,

              --  PROMOCION
              'Promocion', CASE
                WHEN prom.idpromocion IS NOT NULL THEN
                  json_build_object(
                    'IdPromocion', prom.idpromocion,
                    'Nombre', prom.nombre,
                    'Descripcion', prom.descripcion,
                    'PrecioPromocion', prom.preciopromocion,
                    'TipoDescuento', prom.tipodescuento,
                    'Imagen', prom.imagen,

                    --  TIPO PROMOCION
                    'Tipopromocion', json_build_object(
                      'IdTipoPromocion', tp.idtipopromocion,
                      'Nombre', tp.nombre
                    ),

                    --  PRODUCTOS DE LA PROMOCION
                    'Productos', (
                      SELECT COALESCE(
                        json_agg(
                          jsonb_build_object(
                            'IdPromocionProducto', pp.idpromocionproducto,
                            'Cantidad', pp.cantidad,
                            'Descuento', pp.descuento,
                            'Precio', pp.precio,
                          
                            'Producto', CASE
                              WHEN prod2.idproducto IS NOT NULL THEN
                                json_build_object(
                                  'IdProducto', prod2.idproducto,
                                  'Nombre', prod2.nombre,
                                  'Imagen', prod2.imagen
                                )
                              ELSE NULL
                            END,

                            'Productomedida', CASE
                              WHEN ppm.idproductomedida IS NOT NULL THEN
                                json_build_object(
                                  'IdProductoMedida', ppm.idproductomedida,
                                  'Cantidad', ppm.cantidad,
                                  'PrecioVenta', ppm.precioventa,
                                  'Imagen', ppm.imagen,

                                  'Presentacion', json_build_object(
                                    'IdPresentacion', pres2.idpresentacion,
                                    'Nombre', pres2.nombre
                                  ),

                                  'Producto', json_build_object(
                                    'IdProducto', prodppm.idproducto,
                                    'Nombre', prodppm.nombre,
                                    'Imagen', prodppm.imagen
                                  )
                                )
                              ELSE NULL
                            END
                          )
                        ),
                        '[]'
                      )
                      FROM promocionproducto pp

                      LEFT JOIN producto prod2
                        ON prod2.idproducto = pp.idproducto

                      LEFT JOIN productomedida ppm
                        ON ppm.idproductomedida = pp.idproductomedida

                      LEFT JOIN presentacion pres2
                        ON pres2.idpresentacion = ppm.idpresentacion

                      LEFT JOIN producto prodppm
                        ON prodppm.idproducto = ppm.idproducto

                      WHERE pp.idpromocion = prom.idpromocion
                    )
                  )
                ELSE NULL
              END

            )
          ) FILTER (WHERE dv.iddetalleventa IS NOT NULL),
          '[]'
        ) AS "Detalleventa",

        --  PAGOS
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'IdPago', pg.idpago,
              'Monto', pg.monto,
              'Cambio', pg.cambio,

              'Metodopago', json_build_object(
                'IdMetodoPago', mp.idmetodopago,
                'Nombre', mp.nombre
              )
            )
          ) FILTER (WHERE pg.idpago IS NOT NULL),
          '[]'
        ) AS "Pago"

      FROM filtered_ventas v

      LEFT JOIN persona per
        ON per.idpersona = v.idpersona
      
      LEFT JOIN documento d
      ON d.idpersona = per.idpersona

      LEFT JOIN complemento cmp
      ON cmp.idcomplemento = d.idcomplemento
      
      LEFT JOIN sucursal s
      ON s.idsucursal = v.idsucursal

      LEFT JOIN usuario u
        ON u.idusuario = v.idusuario

      LEFT JOIN detalleventa dv
        ON dv.idventa = v.idventa

      -- 🔥 PRODUCTO DIRECTO
      LEFT JOIN producto prod
        ON prod.idproducto = dv.idproducto

      -- 🔥 PRODUCTO MEDIDA
      LEFT JOIN productomedida pm
        ON pm.idproductomedida = dv.idproductomedida

      LEFT JOIN producto pmp
        ON pmp.idproducto = pm.idproducto

      LEFT JOIN presentacion pres
        ON pres.idpresentacion = pm.idpresentacion

      -- 🔥 PROMOCION
      LEFT JOIN promocion prom
        ON prom.idpromocion = dv.idpromocion

      LEFT JOIN tipopromocion tp
        ON tp.idtipopromocion = prom.idtipopromocion

      -- 🔥 PAGOS
      LEFT JOIN pago pg
        ON pg.idventa = v.idventa

      LEFT JOIN metodopago mp
        ON mp.idmetodopago = pg.idmetodopago

      LEFT JOIN factura f
        ON f.idventa = v.idventa

      LEFT JOIN enlace e
       ON e.idenlace = f.idenlace

      LEFT JOIN pedido ped
        ON ped.idpedido = v.idpedido

     GROUP BY
  v.idventa,
  v.fechaventa,
  v.horaventa,
  v.preciototal,
  v.estado,

  per.idpersona,

  d.iddocumento,
  d.documento,

   cmp.idcomplemento,

  s.idsucursal,
  u.idusuario,
  f.idfactura,
  e.enlace,
  ped.idpedido

      ORDER BY
        v.fechaventa DESC,
        v.horaventa DESC

      LIMIT $7 OFFSET $8;
    `;
        const result = await db_1.AppDataSource.query(query, [
            fecha || null,
            id || "TODOS",
            Number(pago || 0),
            producto || null,
            promocion || null,
            estado !== undefined ? Number(estado) : null,
            Number(limit),
            offset,
            factura || "TODOS"
        ]);
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
            data: result.map(({ total, ...rest }) => rest)
        });
    }
    catch (error) {
        console.error("Error real:", error);
        if (error instanceof Error) {
            return res.status(500).json({
                message: error.message
            });
        }
    }
};
exports.getVentasSucursal = getVentasSucursal;
const actualizarVenta = async (req, res) => {
    const queryRunner = db_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const { id } = req.params;
        const { ventas, detalles } = req.body;
        const venta = await queryRunner.manager.findOne(Venta_1.Venta, {
            where: { IdVenta: id },
            relations: [
                "Sucursal",
                "Detalleventa",
                "Detalleventa.Productomedida",
                "Detalleventa.Promocion",
                "Detalleventa.Promocion.Promocionproducto",
                "Detalleventa.Promocion.Promocionproducto.Productomedida"
            ]
        });
        if (!venta) {
            throw new error_handler_1.HttpError(404, "Venta no encontrada");
        }
        const IdSucursalAntigua = venta.Sucursal.IdSucursal;
        // 1. Si hay nuevos detalles, restauramos el stock de los antiguos y los eliminamos
        if (detalles) {
            if (venta.Detalleventa) {
                for (const detalle of venta.Detalleventa) {
                    if (detalle.Productomedida) {
                        const presentacion = await (0, ProductoMedida_controllers_1.verifyProductoMedida)({ PaqueteId: detalle.Productomedida.IdProductoMedida });
                        await (0, Inventario_controllers_1.IncrementProducto)(queryRunner, presentacion, IdSucursalAntigua, detalle.Cantidad, id);
                    }
                    else if (detalle.Promocion) {
                        if (detalle.Promocion.LimiteUso != null) {
                            detalle.Promocion.LimiteUso += detalle.Cantidad;
                            detalle.Promocion.Estado = 1;
                            await queryRunner.manager.save(detalle.Promocion);
                        }
                        await (0, Inventario_controllers_1.IncrementPromocion)(queryRunner, IdSucursalAntigua, detalle.Cantidad, detalle.Promocion, id);
                    }
                    await queryRunner.manager.remove(detalle);
                }
            }
        }
        // 2. Actualizar cabecera de la Venta
        if (ventas.IdPersona) {
            venta.Persona = await (0, Persona_controllers_1.verifyPersona)({ PersonaId: ventas.IdPersona });
        }
        if (ventas.IdUsuario) {
            venta.Usuario = await (0, Usuario_controllers_1.verifyUsuario)({ UsuarioId: ventas.IdUsuario });
        }
        if (ventas.IdSucursal) {
            venta.Sucursal = await (0, Sucursal_controllers_1.verifySucursal)({ SucursalId: ventas.IdSucursal });
        }
        if (ventas.Monto > 0)
            venta.PrecioTotal = Number(ventas.Monto);
        venta.FechaVenta = ventas.FechaVenta || fecha;
        venta.HoraVenta = ventas.HoraVenta || hora;
        await queryRunner.manager.save(venta);
        // 3. Manejo de Pagos
        if (ventas.IdMetodoPago) {
            const pagoExistente = await queryRunner.manager.findOne(Pago_1.Pago, { where: { Venta: { IdVenta: id } } });
            if (pagoExistente) {
                pagoExistente.Monto = ventas.Monto;
                pagoExistente.Cambio = ventas.Cambio;
                pagoExistente.Metodopago = await (0, MetodoPago_controllers_1.verifyMetodoPago)({ MetodoPagoId: ventas.IdMetodoPago });
                await queryRunner.manager.save(pagoExistente);
            }
            else {
                await (0, Pago_controllers_1.createPago)(queryRunner, venta, ventas.Monto, ventas.Cambio, ventas.IdMetodoPago);
            }
        }
        // 4. Procesar nuevos Detalles
        if (detalles && detalles.Producto?.length > 0) {
            const IdSucursalNueva = ventas.IdSucursal || IdSucursalAntigua;
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
                await (0, DetalleVenta_controllers_1.createDetalleventa)(queryRunner, venta, presentacion, promocion, prod.Cantidad, prod.precioUnitario, IdSucursalNueva);
            }
        }
        await queryRunner.commitTransaction();
        return res.status(200).json({ message: "La venta se actualizó correctamente" });
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        if (error instanceof error_handler_1.HttpError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({
            message: "Error al actualizar la venta",
            error: error instanceof Error ? error.message : "Error desconocido"
        });
    }
    finally {
        await queryRunner.release();
    }
};
exports.actualizarVenta = actualizarVenta;
