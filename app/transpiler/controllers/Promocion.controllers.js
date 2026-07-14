"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPromocionesVista = exports.getPromociones = exports.deletePromocion = exports.updatePromocion = exports.createPromocion = exports.verifyPromocion = exports.actualizarPromociones = exports.activarPromociones = exports.cerrarPromocionesVencidas = void 0;
const Promocion_1 = require("../entities/Promocion");
const Tipopromocion_1 = require("../entities/Tipopromocion");
const Rango_controllers_1 = require("./Rango.controllers");
const PromocionProducto_controllers_1 = require("./PromocionProducto.controllers");
const Tipopromocion_controllers_1 = require("./Tipopromocion.controllers");
const idGenerator_1 = require("../utils/idGenerator");
const db_1 = require("../db");
// en Promocion.controllers.ts
const cerrarPromocionesVencidas = async (req, res) => {
    try {
        const promociones = await Promocion_1.Promocion.find({ relations: ["Rango"] });
        const ahora = new Date();
        for (const promo of promociones) {
            if (promo.Rango) {
                const fechaFin = new Date(`${promo.Rango.FechaFin}T${promo.Rango.HoraFin}`);
                if (ahora > fechaFin && promo.Estado === 1) {
                    promo.Estado = 0;
                    promo.Fechaactualizacion = ahora;
                    await promo.save();
                    console.log(`❌ Promoción ${promo.Nombre} desactivada (vencida)`);
                }
            }
        }
        if (res) {
            return res.json({ message: "Promociones vencidas cerradas correctamente" });
        }
        else {
            console.log("✔ Promociones vencidas cerradas (llamado por cron)");
        }
    }
    catch (error) {
        console.error("Error al cerrar promociones:", error);
        if (res) {
            return res.status(500).json({ message: "Error interno del servidor" });
        }
    }
};
exports.cerrarPromocionesVencidas = cerrarPromocionesVencidas;
const activarPromociones = async (req, res) => {
    try {
        const promociones = await Promocion_1.Promocion.find({ relations: ["Rango"] });
        const ahora = new Date();
        for (const promo of promociones) {
            if (promo.Rango) {
                // Construir fecha/hora de inicio
                const fechaInicio = new Date(`${promo.Rango.FechaInicio}T${promo.Rango.HoraInicio}`);
                const fechaFin = new Date(`${promo.Rango.FechaFin}T${promo.Rango.HoraFin}`);
                // Si ya llegó la fecha de inicio, no ha pasado la de fin y sigue inactiva → activar
                if (ahora >= fechaInicio && ahora <= fechaFin && promo.Estado === 0) {
                    promo.Estado = 1;
                    promo.Fechaactualizacion = ahora;
                    await promo.save();
                    console.log(`✅ Promoción ${promo.Nombre} activada`);
                }
            }
        }
        if (res) {
            return res.json({ message: "✔ Promociones activadas correctamente" });
        }
        else {
            console.log("✔ Promociones activadas automáticamente (cron)");
        }
    }
    catch (error) {
        console.error("Error al activar promociones:", error);
        if (res) {
            return res.status(500).json({ message: "Error interno del servidor" });
        }
    }
};
exports.activarPromociones = activarPromociones;
const actualizarPromociones = async () => {
    try {
        const promociones = await Promocion_1.Promocion.find({ relations: ["Rango"] });
        const ahora = new Date();
        for (const promo of promociones) {
            if (!promo.Rango)
                continue;
            const fechaInicio = new Date(`${promo.Rango.FechaInicio}T${promo.Rango.HoraInicio}`);
            const fechaFin = new Date(`${promo.Rango.FechaFin}T${promo.Rango.HoraFin}`);
            // Activar si estamos dentro del rango
            if (ahora >= fechaInicio && ahora <= fechaFin && promo.Estado !== 1) {
                promo.Estado = 1;
                promo.Fechaactualizacion = ahora;
                await promo.save();
                console.log(`✅ Promoción ${promo.Nombre} activada`);
            }
            // Desactivar si ya pasó el rango
            if (ahora > fechaFin && promo.Estado !== 0) {
                promo.Estado = 0;
                promo.Fechaactualizacion = ahora;
                await promo.save();
                console.log(`❌ Promoción ${promo.Nombre} desactivada`);
            }
        }
    }
    catch (error) {
        console.error("Error al actualizar promociones:", error);
    }
};
exports.actualizarPromociones = actualizarPromociones;
const verifyPromocion = async ({ PromocionId }) => {
    const existPromocion = await Promocion_1.Promocion.findOne({ where: { IdPromocion: PromocionId },
        relations: ['Promocionproducto', 'Promocionproducto.Productomedida', 'Promocionproducto.Producto'] });
    if (!existPromocion) {
        throw new Error(`La promocion con ID ${PromocionId} no existe.`);
    }
    return existPromocion;
};
exports.verifyPromocion = verifyPromocion;
const createPromocion = async (req, res) => {
    try {
        const { RegistrarPromocion } = req.body;
        const tipoPromocion = await Tipopromocion_1.Tipopromocion.findOneBy({ IdTipoPromocion: RegistrarPromocion.Tipopromocion.IdTipoPromocion });
        if (!tipoPromocion) {
            return res.status(404).json({ message: "Tipo de promoción no encontrado" });
        }
        const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('PROM');
        const nuevaPromocion = new Promocion_1.Promocion();
        nuevaPromocion.IdPromocion = nuevoId;
        if (RegistrarPromocion.Nombre)
            nuevaPromocion.Nombre = RegistrarPromocion.Nombre;
        nuevaPromocion.FechaRegistro = new Date();
        if (RegistrarPromocion.Descripcion)
            nuevaPromocion.Descripcion = RegistrarPromocion.Descripcion;
        if (RegistrarPromocion.Tipopromocion.IdTipoPromocion)
            nuevaPromocion.Tipopromocion = await (0, Tipopromocion_controllers_1.verifyTipoPromocion)({ PromocionId: Number(RegistrarPromocion.Tipopromocion.IdTipoPromocion) });
        if (RegistrarPromocion.Url)
            nuevaPromocion.Imagen = RegistrarPromocion.Url;
        if (RegistrarPromocion.LimiteUso)
            nuevaPromocion.LimiteUso = RegistrarPromocion.LimiteUso;
        nuevaPromocion.Preciopromocion = RegistrarPromocion.Preciopromocion;
        if (RegistrarPromocion.TipoDescuento)
            nuevaPromocion.TipoDescuento = RegistrarPromocion.TipoDescuento;
        await nuevaPromocion.save();
        await (0, Rango_controllers_1.createRango)({
            IdPromocion: nuevoId, HoraInicio: RegistrarPromocion.Rango.HoraInicio,
            HoraFin: RegistrarPromocion.Rango.HoraFin, FechaInicio: RegistrarPromocion.Rango.FechaInicio, FechaFin: RegistrarPromocion.Rango.FechaFin
        });
        for (const producto of RegistrarPromocion.Promocionproducto) {
            await (0, PromocionProducto_controllers_1.createPromocionProducto)(nuevaPromocion, producto.IdProducto, producto.Cantidad, producto.Descuento, producto.Precio, producto.IdEstado);
        }
        return res.status(201).json({ message: "La promoción se registró correctamente" });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.createPromocion = createPromocion;
const updatePromocion = async (req, res) => {
    try {
        const { id } = req.params;
        const { RegistrarPromocion } = req.body;
        const promocion = await Promocion_1.Promocion.findOneBy({ IdPromocion: id });
        if (!promocion) {
            return res.status(404).json({ message: "Promoción no encontrada" });
        }
        if (RegistrarPromocion.Nombre)
            promocion.Nombre = RegistrarPromocion.Nombre;
        if (RegistrarPromocion.Descripcion)
            promocion.Descripcion = RegistrarPromocion.Descripcion;
        if (RegistrarPromocion.Tipopromocion.IdTipoPromocion)
            promocion.Tipopromocion = await (0, Tipopromocion_controllers_1.verifyTipoPromocion)({ PromocionId: Number(RegistrarPromocion.Tipopromocion.IdTipoPromocion) });
        promocion.Fechaactualizacion = new Date();
        if (RegistrarPromocion.LimiteUso)
            promocion.LimiteUso = RegistrarPromocion.LimiteUso;
        promocion.Preciopromocion = RegistrarPromocion.Preciopromocion;
        if (RegistrarPromocion.Url)
            promocion.Imagen = RegistrarPromocion.Url;
        if (RegistrarPromocion.TipoDescuento)
            promocion.TipoDescuento = RegistrarPromocion.TipoDescuento;
        await promocion.save();
        await (0, Rango_controllers_1.updateRango)({
            RangoId: RegistrarPromocion.Rango.IdRango, HoraInicio: RegistrarPromocion.Rango.HoraInicio,
            HoraFin: RegistrarPromocion.Rango.HoraFin, FechaInicio: RegistrarPromocion.Rango.FechaInicio, FechaFin: RegistrarPromocion.Rango.FechaFin
        });
        for (const producto of RegistrarPromocion.Promocionproducto) {
            await (0, PromocionProducto_controllers_1.updatePromocionProducto)(producto.IdPromocionProducto, producto.IdProducto, promocion, producto.Cantidad, producto.Descuento, producto.IdEstado, producto.Precio);
        }
        return res.json({ message: "La promoción se actualizó correctamente" });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.updatePromocion = updatePromocion;
const deletePromocion = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.AppDataSource.query(`UPDATE promocion 
          SET estado = CASE WHEN estado = 1 THEN 0 ELSE 1 END
          WHERE IdPromocion = $1
          RETURNING estado AS estado`, [id]);
        // ✅ aquí está el cambio
        if (result.length === 0) {
            return res.status(404).json({ message: "Persona no encontrado" });
        }
        const nuevoEstado = Number(result[0][0].estado);
        const mensajeAccion = nuevoEstado === 1 ? "habilitaron" : "eliminaron";
        return res.json({
            message: `Se ${mensajeAccion} los datos de la promocion correctamente`,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.deletePromocion = deletePromocion;
const getPromociones = async (req, res) => {
    try {
        const { search, idproducto, estado, tipopromocion, page = 1, limit = 8 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const searchParam = typeof search === "string" && search.trim() !== ""
            ? search.trim()
            : null;
        const idProductoParam = typeof idproducto === "string" && idproducto.trim() !== ""
            ? idproducto.trim()
            : null;
        const estadoParam = estado !== undefined && estado !== ""
            ? Number(estado)
            : null;
        const tipoParam = tipopromocion !== undefined && tipopromocion !== ""
            ? Number(tipopromocion)
            : null;
        const result = await db_1.AppDataSource.query(`
      SELECT 
        pr.idpromocion,
        pr.nombre,
        pr.descripcion,
        pr.estado,
        pr.tipodescuento,
        pr.preciopromocion,
        pr.limiteuso,
        pr.imagen,
        COUNT(*) OVER() AS total,

        -- 🔥 RANGO
        json_build_object(
          'IdRango', r.idrango,
          'FechaInicio', r.fechainicio,
          'FechaFin', r.fechafin,
          'HoraInicio', r.horainicio,
          'HoraFin', r.horafin
        ) AS "Rango",

        -- 🔥 Tipo Promoción
        json_build_object(
          'IdTipoPromocion', tp.idtipopromocion,
          'Nombre', tp.nombre
        ) AS "Tipopromocion",

        -- 🔥 Productos de la promoción
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'IdPromocionProducto', pp.idpromocionproducto,
              'Cantidad', pp.cantidad,
              'Descuento', pp.descuento,
              'Precio', pp.precio,
              'Estado', pp.estado,

              'Productomedida', json_build_object(
                'IdProductoMedida', pm.idproductomedida,
                'Cantidad', pm.cantidad,
                'PrecioVenta', pm.precioventa,
                'Imagen', pm.imagen,

                -- 🔥 NUEVO: PRESENTACION
                'Presentacion', json_build_object(
                  'IdPresentacion', prd.idpresentacion,
                  'Nombre', prd.nombre,
                  'Estado', prd.estado
                ),

                'Producto', json_build_object(
                  'IdProducto', p.idproducto,
                  'Nombre', p.nombre,
                  'Estado', p.estado,
                  'Imagen', p.imagen
                )
              )
            )
          ) FILTER (WHERE pp.idpromocionproducto IS NOT NULL),
          '[]'
        ) AS "Promocionproducto"

      FROM promocion pr

      LEFT JOIN rango r 
        ON r.idpromocion = pr.idpromocion

      LEFT JOIN tipopromocion tp 
        ON tp.idtipopromocion = pr.idtipopromocion

      LEFT JOIN promocionproducto pp 
        ON pp.idpromocion = pr.idpromocion

      LEFT JOIN productomedida pm 
        ON pm.idproductomedida = pp.idproductomedida

      LEFT JOIN producto p 
        ON p.idproducto = pm.idproducto

      -- 🔥 NUEVO JOIN
      LEFT JOIN presentacion prd 
        ON prd.idpresentacion = pm.idpresentacion

      WHERE
        ($1::text IS NULL OR pr.nombre ILIKE '%' || $1::text || '%')
      AND ($2::text IS NULL OR p.idproducto = $2)
      AND ($3::int IS NULL OR pr.estado = $3)
      AND ($4::int IS NULL OR tp.idtipopromocion = $4::int)
     
      GROUP BY 
        pr.idpromocion,
        tp.idtipopromocion,
        r.idrango

      ORDER BY pr.idpromocion
      LIMIT $5 OFFSET $6;
      `, [
            searchParam,
            idProductoParam,
            estadoParam,
            tipoParam,
            Number(limit),
            offset
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
            total: result[0].total,
            page: Number(page),
            limit: Number(limit),
            data: result
        });
    }
    catch (error) {
        console.error("Error real:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};
exports.getPromociones = getPromociones;
const getPromocionesVista = async (req, res) => {
    try {
        const { search, tipopromocion, page = 1, limit = 12 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const searchParam = typeof search === "string" && search.trim() !== ""
            ? search.trim()
            : null;
        const tipoParam = tipopromocion !== undefined && tipopromocion !== ""
            ? Number(tipopromocion)
            : null;
        const result = await db_1.AppDataSource.query(`
      SELECT 
        pr.idpromocion,
        pr.nombre,
        pr.descripcion,
        pr.estado,
        pr.tipodescuento,
        pr.preciopromocion,
        pr.limiteuso,
        pr.imagen,
        COUNT(*) OVER() AS total,

        -- RANGO
        json_build_object(
          'IdRango', r.idrango,
          'FechaInicio', r.fechainicio,
          'FechaFin', r.fechafin,
          'HoraInicio', r.horainicio,
          'HoraFin', r.horafin
        ) AS "Rango",

        -- Tipo Promoción
        json_build_object(
          'IdTipoPromocion', tp.idtipopromocion,
          'Nombre', tp.nombre
        ) AS "Tipopromocion",

        --  Productos de la promoción
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'IdPromocionProducto', pp.idpromocionproducto,
              'Cantidad', pp.cantidad,
              'Descuento', pp.descuento,
              'Precio', pp.precio,
              'Estado', pp.estado,

              'Productomedida', json_build_object(
                'IdProductoMedida', pm.idproductomedida,
                'Cantidad', pm.cantidad,
                'PrecioVenta', pm.precioventa,
                'Imagen', pm.imagen,

                'Presentacion', json_build_object(
                  'IdPresentacion', prd.idpresentacion,
                  'Nombre', prd.nombre,
                  'Estado', prd.estado
                ),

                'Producto', json_build_object(
                  'IdProducto', p.idproducto,
                  'Nombre', p.nombre,
                  'Estado', p.estado,
                  'Imagen', p.imagen
                )
              )
            )
          ) FILTER (WHERE pp.idpromocionproducto IS NOT NULL AND pp.estado = 1),
          '[]'
        ) AS "Promocionproducto"

      FROM promocion pr

      LEFT JOIN rango r 
        ON r.idpromocion = pr.idpromocion

      LEFT JOIN tipopromocion tp 
        ON tp.idtipopromocion = pr.idtipopromocion

      LEFT JOIN promocionproducto pp 
        ON pp.idpromocion = pr.idpromocion

      LEFT JOIN productomedida pm 
        ON pm.idproductomedida = pp.idproductomedida

      LEFT JOIN producto p 
        ON p.idproducto = pm.idproducto

      LEFT JOIN presentacion prd 
        ON prd.idpresentacion = pm.idpresentacion

      WHERE pr.estado = 1
      AND ($1::text IS NULL OR pr.nombre ILIKE '%' || $1::text || '%')
      AND ($2::int IS NULL OR tp.idtipopromocion = $2::int)
      -- Validar que estemos dentro del rango de fechas
      AND (
        CURRENT_DATE BETWEEN r.fechainicio AND r.fechafin
      )

      GROUP BY 
        pr.idpromocion,
        tp.idtipopromocion,
        r.idrango

      ORDER BY pr.idpromocion
      LIMIT $3 OFFSET $4;
      `, [
            searchParam,
            tipoParam,
            Number(limit),
            offset
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
            data: result
        });
    }
    catch (error) {
        console.error("Error en getPromocionesVista:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};
exports.getPromocionesVista = getPromocionesVista;
