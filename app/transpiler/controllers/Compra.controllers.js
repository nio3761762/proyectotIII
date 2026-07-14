"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompra = exports.getCompras = exports.updateCompra = exports.anularCompra = exports.registrarCompra = exports.verifyCompra = void 0;
const Compra_1 = require("../entities/Compra");
const DetalleCompra_1 = require("../entities/DetalleCompra");
const Inventario_1 = require("../entities/Inventario");
const error_handler_1 = require("../utils/error.handler");
const idGenerator_1 = require("../utils/idGenerator");
const Comprobante_controllers_1 = require("./Comprobante.controllers");
const Detallecompra_controllers_1 = require("./Detallecompra.controllers");
const Proveedor_controllers_1 = require("./Proveedor.controllers");
const db_1 = require("../db");
const Inventario_controllers_1 = require("./Inventario.controllers");
const Fecha_1 = require("../utils/Fecha");
const Insumomedida_controllers_1 = require("./Insumomedida.controllers");
const { fecha, hora } = (0, Fecha_1.getFechaHoraBolivia)();
const verifyCompra = async (IdCompra) => {
    const existPaquete = await Compra_1.Compra.findOne({ where: { IdCompra: IdCompra } });
    if (!existPaquete) {
        throw new error_handler_1.HttpError(404, `La compra con ID ${IdCompra} no existe.`);
    }
    return existPaquete;
};
exports.verifyCompra = verifyCompra;
const registrarCompra = async (req, res) => {
    const queryRunner = db_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const { Compras, detalles, Destinos } = req.body;
        // 1. Validaciones básicas
        if (!Compras.IdProveedor) {
            throw new error_handler_1.HttpError(400, "Proveedor es requerido.");
        }
        // 2. Preparar cabecera de Compra
        const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('COM');
        const compra = new Compra_1.Compra();
        compra.IdCompra = nuevoId;
        if (Compras.IdProveedor)
            compra.Proveedor = await (0, Proveedor_controllers_1.verifyProveedor)({ TipoproveedorId: Compras.IdProveedor });
        compra.FechaCompra = Compras.Fecha || fecha;
        compra.HoraCompra = hora;
        compra.NroComprobante = Compras.Numero || '';
        compra.Descripcion = Compras.Descripcion || '';
        compra.PrecioTotal = Number(Compras.PrecioTotal) || 0;
        if (Compras.Comprobante)
            compra.Comprobante = await (0, Comprobante_controllers_1.verifyComprobante)(Compras.Comprobante);
        // Guardar la compra dentro de la transacción
        await queryRunner.manager.save(compra);
        // 3. Registrar Detalles de Compra
        if (detalles && detalles.length > 0) {
            for (const producto of detalles) {
                await (0, Detallecompra_controllers_1.createDetalleCompra)(queryRunner, compra, producto.Cantidad, producto.IdMedida, Number(producto.Precio), producto.Fecha);
            }
        }
        // 4. Registrar Destinos (Lotes e Inventario)
        if (Destinos && Destinos.length > 0) {
            for (const destinos of Destinos) {
                const medida = await (0, Insumomedida_controllers_1.verifyInsumoMedida)({ PaqueteId: destinos.IdMedida });
                const cantidadFinal = destinos.IdInsumo
                    ? Number(destinos.Cantidad) * (Number(destinos.CantidadMedida) || 1)
                    : Number(destinos.Cantidad);
                const costoTotal = destinos.IdInsumo ? Number(destinos.Cantidad) * Number(destinos.PrecioInsumo) : 0;
                const costoUnitario = costoTotal > 0 ? costoTotal / cantidadFinal : 0;
                const precioUnitario = destinos.IdInsumo ? Number(destinos.PrecioInsumo) : 0;
                await (0, Inventario_controllers_1.createLoteInventario)(queryRunner, destinos.IdProducto, destinos.IdInsumo, cantidadFinal, costoUnitario, destinos.IdSucursal, 'ENTRADA_COMPRA', nuevoId, precioUnitario, destinos.IdInsumo ? Number(destinos.Cantidad) : undefined, medida.Unidadmedida.IdUnidadMedida);
            }
        }
        // 5. Confirmar transacción
        await queryRunner.commitTransaction();
        return res.status(201).json({ message: "La Compra se registro correctamente", idCompra: nuevoId });
    }
    catch (error) {
        // 6. Revertir cambios en caso de error
        await queryRunner.rollbackTransaction();
        if (error instanceof error_handler_1.HttpError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({
            message: 'Error interno del servidor',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
    finally {
        // 7. Liberar conexión
        await queryRunner.release();
    }
};
exports.registrarCompra = registrarCompra;
const anularCompra = async (req, res) => {
    const queryRunner = db_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const { id } = req.params;
        await queryRunner.manager.query(`UPDATE compra 
       SET estado = 0
       WHERE IdCompra = $1`, [id]);
        await (0, Inventario_controllers_1.anularMovimientoInventario)(queryRunner, id, 'ENTRADA_COMPRA');
        await queryRunner.commitTransaction();
        return res.json({
            message: `Se anulo la compra correctamente`,
        });
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        if (error instanceof error_handler_1.HttpError) {
            res.status(error.statusCode).json({ message: error.message });
        }
        else if (error instanceof Error) {
            res.status(500).json({ message: 'Error interno del servidor', error: error.message });
        }
    }
    finally {
        await queryRunner.release();
    }
};
exports.anularCompra = anularCompra;
const updateCompra = async (req, res) => {
    const queryRunner = db_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const { id } = req.params;
        const { Compras, detalles, Destinos } = req.body;
        if (!Compras || !Compras.IdProveedor) {
            throw new error_handler_1.HttpError(400, "Proveedor es requerido.");
        }
        const compra = await queryRunner.manager.findOne(Compra_1.Compra, {
            where: { IdCompra: id }
        });
        if (!compra)
            throw new error_handler_1.HttpError(404, `La compra con ID ${id} no existe.`);
        // --- INVENTARIO: sincronizar lotes ---
        // Obtener inventarios actuales
        const inventariosActuales = await queryRunner.manager.find(Inventario_1.Inventario, {
            where: {
                IdReferencia: id,
                TipoOrigen: "ENTRADA_COMPRA"
            },
            relations: ["Insumo", "Producto", "Sucursal"]
        });
        const procesados = new Set();
        for (const destino of Destinos) {
            const medida = await (0, Insumomedida_controllers_1.verifyInsumoMedida)({ PaqueteId: destino.IdMedida });
            const cantidadFinal = destino.IdInsumo
                ? Number(destino.Cantidad) * (Number(destino.CantidadMedida) || 1)
                : Number(destino.Cantidad);
            const costoTotal = destino.IdInsumo
                ? Number(destino.Cantidad) * Number(destino.PrecioInsumo)
                : 0;
            const costoUnitario = cantidadFinal > 0 ? costoTotal / cantidadFinal : 0;
            const precioUnitario = destino.IdInsumo
                ? Number(destino.PrecioInsumo)
                : 0;
            let inventario = null;
            console.log("Destino actual:", destino.IdInventario);
            console.log("Buscando inventario para destino:", inventariosActuales, destino);
            if (destino.IdInventario) {
                inventario = inventariosActuales.find(i => i.IdInventario === destino.IdInventario);
                console.log("Inventario encontrado:", inventario);
            }
            if (inventario) {
                procesados.add(inventario.IdInventario);
                const stockAnterior = Number(inventario.Stock);
                if (destino.CantidadMedida > 0) {
                    const diferencia = cantidadFinal - stockAnterior;
                    inventario.Stock = destino.CantidadMedida;
                    inventario.Cantidad = destino.Cantidad;
                    inventario.Estado = cantidadFinal > 0 ? 1 : 0;
                    inventario.CostoUnitario = costoUnitario;
                    inventario.Preciounitario = precioUnitario;
                    await queryRunner.manager.save(inventario);
                    if (diferencia > 0) {
                        await (0, Inventario_controllers_1.registrarMovimientoEntrada)(queryRunner, inventario, "ENTRADA_COMPRA", id, diferencia);
                    }
                    else if (diferencia < 0) {
                        await (0, Inventario_controllers_1.registrarMovimientoSalida)(queryRunner, inventario, "SALIDA_AJUSTE", Math.abs(diferencia), id);
                    }
                }
                else {
                    inventario.CostoUnitario = costoUnitario;
                    inventario.Preciounitario = precioUnitario;
                    await queryRunner.manager.save(inventario);
                }
            }
            else {
                await (0, Inventario_controllers_1.createLoteInventario)(queryRunner, destino.IdProducto, destino.IdInsumo, cantidadFinal, costoUnitario, destino.IdSucursal, "ENTRADA_COMPRA", id, precioUnitario, destino.IdInsumo
                    ? Number(destino.Cantidad)
                    : undefined, medida.Unidadmedida.IdUnidadMedida);
            }
        }
        // Eliminar los lotes que ya no existen
        for (const inv of inventariosActuales) {
            if (procesados.has(inv.IdInventario))
                continue;
            if (Number(inv.Stock) > 0) {
                await (0, Inventario_controllers_1.registrarMovimientoSalida)(queryRunner, inv, "SALIDA_AJUSTE", Number(inv.Stock), id);
            }
            await queryRunner.manager.query(`DELETE FROM movimiento_inventario
   WHERE idinventario = $1`, [inv.IdInventario]);
            // Luego eliminar el inventario
            await queryRunner.manager.query(`DELETE FROM inventario
   WHERE idinventario = $1`, [inv.IdInventario]);
        }
        // --- FIN INVENTARIO ---
        // Eliminar detalles anteriores
        await queryRunner.manager.delete(DetalleCompra_1.Detallecompra, { Compra: { IdCompra: id } });
        // Actualizar cabecera
        compra.Proveedor = await (0, Proveedor_controllers_1.verifyProveedor)({ TipoproveedorId: Compras.IdProveedor });
        compra.FechaCompra = Compras.Fecha || fecha;
        compra.HoraCompra = hora;
        compra.NroComprobante = Compras.Numero || '';
        compra.Descripcion = Compras.Descripcion || '';
        compra.PrecioTotal = Number(Compras.PrecioTotal) || 0;
        if (Compras.Comprobante) {
            compra.Comprobante = await (0, Comprobante_controllers_1.verifyComprobante)(Compras.Comprobante);
        }
        await queryRunner.manager.save(compra);
        // Registrar nuevos detalles
        if (detalles && detalles.length > 0) {
            for (const producto of detalles) {
                await (0, Detallecompra_controllers_1.createDetalleCompra)(queryRunner, compra, producto.Cantidad, producto.IdMedida, Number(producto.Precio), producto.Fecha);
            }
        }
        await queryRunner.commitTransaction();
        return res.json({ message: "La Compra se actualizó correctamente", idCompra: id });
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        if (error instanceof error_handler_1.HttpError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({
            message: 'Error interno del servidor',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
    finally {
        await queryRunner.release();
    }
};
exports.updateCompra = updateCompra;
const getCompras = async (req, res) => {
    const queryRunner = db_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    try {
        const { search, fecha, estado, page = 1, limit = 8 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const result = await queryRunner.query(`
      WITH compras_filtradas AS (
        SELECT *
        FROM compra c
        WHERE 
          ($1::text IS NULL OR EXISTS (
            SELECT 1 
            FROM proveedor p
            LEFT JOIN persona per ON per.idpersona = p.idpersona
            WHERE p.idproveedor = c.idproveedor
            AND (
              per.nombre ILIKE '%' || $1 || '%' 
              OR p.razonsocial ILIKE '%' || $1 || '%'
            )
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
        c.estado,

        COUNT(*) OVER() AS total,

        -- 🟢 COMPROBANTE
        json_build_object(
          'idcomprobante', comp.idcomprobante,
          'nombre', comp.nombre
        ) AS comprobante,

        -- 🟢 PROVEEDOR
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
        ) AS proveedor,

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

      JOIN proveedor p 
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
  c.estado,
  comp.idcomprobante,
  p.idproveedor,
  tp.idtipoproveedor,
  per.idpersona

      ORDER BY c.fechacompra DESC
      LIMIT $4 OFFSET $5;
      `, [
            search || null,
            fecha || null,
            estado !== undefined ? Number(estado) : null,
            Number(limit),
            offset
        ]);
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
    }
    catch (error) {
        return res.status(500).json({
            message: error instanceof Error ? error.message : error
        });
    }
    finally {
        await queryRunner.release();
    }
};
exports.getCompras = getCompras;
const getCompra = async (req, res) => {
    const queryRunner = db_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    try {
        const { id } = req.params;
        const pagos = await queryRunner.manager.findOne(Compra_1.Compra, {
            where: { IdCompra: id },
            relations: [
                "Proveedor",
                "Proveedor.Persona",
                "Comprobante",
                "Detallecompra",
                "Detallecompra.Productomedida"
            ]
        });
        return res.json(pagos);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
    finally {
        await queryRunner.release();
    }
};
exports.getCompra = getCompra;
