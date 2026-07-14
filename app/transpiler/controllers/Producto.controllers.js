"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyProducto = exports.getProductoSucursal = exports.getProducto = exports.getProductosVista = exports.getProductos = exports.deleteProducto = exports.updateProducto = exports.createProducto = void 0;
const Producto_1 = require("../entities/Producto");
const Categoria_controllers_1 = require("./Categoria.controllers");
const error_handler_1 = require("../utils/error.handler");
const idGenerator_1 = require("../utils/idGenerator");
const typeorm_1 = require("typeorm");
const ProductoMedida_controllers_1 = require("./ProductoMedida.controllers");
const db_1 = require("../db");
const Fecha_1 = require("../utils/Fecha");
const { fecha, hora } = (0, Fecha_1.getFechaHoraBolivia)();
const createProducto = async (req, res) => {
    try {
        const { RegistroProducto } = req.body;
        const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('PROD');
        const producto = new Producto_1.Producto();
        producto.IdProducto = nuevoId;
        if (RegistroProducto.Nombre)
            producto.Nombre = RegistroProducto.Nombre;
        producto.FechaRegistro = fecha;
        producto.HoraRegistro = hora;
        if (RegistroProducto.Descripcion)
            producto.Descripcion = RegistroProducto.Descripcion;
        if (RegistroProducto.IdSubCategoria)
            producto.Subcategoria = await (0, Categoria_controllers_1.verifySubCategoria)({ CategoriaId: RegistroProducto.IdSubCategoria });
        if (RegistroProducto.Descripcion)
            producto.Descripcion = RegistroProducto.Descripcion;
        if (RegistroProducto.Descripcionlarga)
            producto.Descripcionlarga = RegistroProducto.Descripcionlarga;
        if (RegistroProducto.Url)
            producto.Imagen = RegistroProducto.Url;
        if (RegistroProducto.StockMinimo)
            producto.StockMinimo = RegistroProducto.StockMinimo;
        await producto.save();
        if (RegistroProducto.Productomedida && RegistroProducto.Productomedida.length > 0)
            for (const medida of RegistroProducto.Productomedida)
                await (0, ProductoMedida_controllers_1.createProductoMedida)(nuevoId, medida.Idpresentacion, medida.Cantidad, medida.Precio, medida.PrecioMayor, medida.Url, medida.Comision);
        return res.json({ message: "El Producto se registró correctamente" });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.createProducto = createProducto;
const updateProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { RegistroProducto } = req.body;
        const producto = await Producto_1.Producto.findOne({ where: { IdProducto: id }, relations: ["Productomedida"] });
        if (!producto)
            return res.status(404).json({ message: "Producto no encontrado" });
        if (RegistroProducto.Nombre)
            producto.Nombre = RegistroProducto.Nombre;
        if (RegistroProducto.IdSubCategoria)
            producto.Subcategoria = await (0, Categoria_controllers_1.verifySubCategoria)({ CategoriaId: RegistroProducto.IdSubCategoria });
        if (RegistroProducto.Descripcion)
            producto.Descripcion = RegistroProducto.Descripcion;
        if (RegistroProducto.Descripcionlarga)
            producto.Descripcionlarga = RegistroProducto.Descripcionlarga;
        if (RegistroProducto.Url)
            producto.Imagen = RegistroProducto.Url;
        if (RegistroProducto.StockMinimo)
            producto.StockMinimo = RegistroProducto.StockMinimo;
        await producto.save();
        // IDs enviados desde el front (o vacío si no mandaron nada)
        // const idsEnviadosMedida = RegistroProducto.Productomedida?.map((pm: any) => pm.IdProductomedida)
        //   .filter((id: any) => id !== undefined) || [];
        // // Todas las medidas actuales en BD
        // const medidasActuales = producto.Productomedida || [];
        // if (!RegistroProducto.Productomedida || RegistroProducto.Productomedida.length === 0) {
        //   // Caso: no se envió nada → eliminar todas
        //   for (const medida of medidasActuales) {
        //     await Productomedida.delete({ IdProductoMedida: medida.IdProductoMedida });
        //   }
        // } else {
        //   // Caso: sí se enviaron medidas → eliminar las que no estén en idsEnviados
        //   const medidasAEliminar = medidasActuales.filter(
        //     (pm: any) => !idsEnviadosMedida.includes(pm.IdProductoMedida)
        //   );
        //   for (const medida of medidasAEliminar) {
        //     await Productomedida.delete({ IdProductoMedida: medida.IdProductoMedida });
        //   }
        // Crear o actualizar las medidas que vinieron
        if (RegistroProducto.Productomedida && RegistroProducto.Productomedida.length > 0)
            for (const medida of RegistroProducto.Productomedida) {
                await (0, ProductoMedida_controllers_1.updateProductoMedida)(medida.Idproductomedida, id, medida.Idpresentacion, medida.Cantidad, medida.Precio, medida.PrecioMayor, medida.Url, medida.Idestado, medida.Comision);
            }
        return res.json({
            producto: producto,
            message: "El Producto se actualizó correctamente"
        });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.updateProducto = updateProducto;
const deleteProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.AppDataSource.query(`UPDATE producto 
      SET estado = CASE WHEN estado = 1 THEN 0 ELSE 1 END
      WHERE IdProducto = $1
      RETURNING estado AS estado`, [id]);
        // ✅ aquí está el cambio
        if (result.length === 0) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        const nuevoEstado = Number(result[0][0].estado);
        const mensajeAccion = nuevoEstado === 1 ? "habilitaron" : "eliminaron";
        return res.json({
            message: `Se ${mensajeAccion} los datos del producto correctamente`,
        });
    }
    catch (error) {
        console.error("Error al cambiar el estado del Producto:", error);
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.deleteProducto = deleteProducto;
const getProductos = async (req, res) => {
    try {
        const { search, estado, categoria, subcategoria, page = 1, limit = 8 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const searchParam = typeof search === "string" && search.trim() !== ""
            ? search.trim()
            : null;
        const estadoParam = estado !== undefined && estado !== ""
            ? Number(estado)
            : null;
        const categoriaParam = typeof categoria === "string" && categoria !== ""
            ? categoria
            : null;
        const subcategoriaParam = typeof subcategoria === "string" && subcategoria !== ""
            ? subcategoria
            : null;
        const result = await db_1.AppDataSource.query(`
    SELECT 
      p.idproducto,
      p.nombre,
      p.descripcion,
      p.descripcionlarga,
      p.fecharegistro,
      p.fechaactualizacion,
      p.estado,
      p.imagen,
      p.cantidad,
      COUNT(*) OVER() AS total,

      --  Subcategoria + Categoria
      json_build_object(
        'IdSubCategoria', sc.idsubcategoria,
        'Nombre', sc.nombre,
        'Estado', sc.estado,
        'Categoria', json_build_object(
          'IdCategoria', c.idcategoria,
          'Nombre', c.nombre,
          'Estado', c.estado
        )
      ) AS "Subcategoria",

      --  PRODUCTO MEDIDA (SUBQUERY)
      COALESCE(pm_data.productomedida, '[]') AS "Productomedida"

    FROM producto p

    LEFT JOIN subcategoria sc 
      ON sc.idsubcategoria = p.idsubcategoria

    LEFT JOIN categoria c 
      ON c.idcategoria = sc.idcategoria

    --  PRODUCTOMEDIDA COMO ARRAY
    LEFT JOIN LATERAL (
      SELECT json_agg(
        jsonb_build_object(
          'IdProductoMedida', pm.idproductomedida,
          'Cantidad', pm.cantidad,
          'Imagen', pm.imagen,
          'PrecioVenta', pm.precioventa,
          'PrecioMayor', pm.preciomayor,
          'Comision', pm.comision,
          'Estado', pm.estado,
          'Presentacion', json_build_object(
            'IdPresentacion', pr.idpresentacion,
            'Nombre', pr.nombre,
            'Abreviatura', pr.abreviatura
          ),
          'Productomedidaprecio', COALESCE(pmp_data.precios, '[]')
        )
      ) AS productomedida
      FROM productomedida pm
      LEFT JOIN presentacion pr 
        ON pr.idpresentacion = pm.idpresentacion
        
      LEFT JOIN LATERAL (
        SELECT jsonb_agg(
          jsonb_build_object(
            'IdProductoMedidaPrecio', pmp.idproductomedidaprecio,
            'CantidadMinima', pmp.cantidadminima,
            'Precio', pmp.precio,
            'Estado', pmp.estado
          )
        ) AS precios
        FROM productomedidaprecio pmp
        WHERE pmp.idproductomedida = pm.idproductomedida
      ) pmp_data ON true
     WHERE pm.idproducto = p.idproducto

    ) pm_data ON true

    WHERE 
      ($1::text IS NULL OR p.nombre ILIKE '%' || $1::text || '%')
    AND ($2::int IS NULL OR p.estado = $2)
    AND ($3::text IS NULL OR c.idcategoria = $3)
    AND ($4::text IS NULL OR sc.idsubcategoria = $4)
    
    ORDER BY p.idproducto
    LIMIT $5 OFFSET $6;
    `, [
            searchParam,
            estadoParam,
            categoriaParam,
            subcategoriaParam,
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
exports.getProductos = getProductos;
const getProductosVista = async (req, res) => {
    try {
        const { search, categoria, subcategoria, page = 1, limit = 12 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const searchParam = typeof search === "string" && search.trim() !== ""
            ? search.trim()
            : null;
        const categoriaParam = typeof categoria === "string" && categoria !== ""
            ? categoria
            : null;
        const subcategoriaParam = typeof subcategoria === "string" && subcategoria !== ""
            ? subcategoria
            : null;
        const result = await db_1.AppDataSource.query(`
    SELECT 
      p.idproducto,
      p.nombre,
      p.descripcion,
      p.descripcionlarga,
      p.fecharegistro,
      p.fechaactualizacion,
      p.estado,
      p.imagen,
      COUNT(*) OVER() AS total,

      --  Subcategoria + Categoria
      json_build_object(
        'IdSubCategoria', sc.idsubcategoria,
        'Nombre', sc.nombre,
        'Estado', sc.estado,
        'Categoria', json_build_object(
          'IdCategoria', c.idcategoria,
          'Nombre', c.nombre,
          'Estado', c.estado
        )
      ) AS "Subcategoria",

      --  PRODUCTO MEDIDA (SUBQUERY)
      COALESCE(pm_data.productomedida, '[]') AS "Productomedida"

    FROM producto p

    LEFT JOIN subcategoria sc 
      ON sc.idsubcategoria = p.idsubcategoria

    LEFT JOIN categoria c 
      ON c.idcategoria = sc.idcategoria

    --  PRODUCTOMEDIDA COMO ARRAY
    LEFT JOIN LATERAL (
      SELECT json_agg(
        jsonb_build_object(
          'IdProductoMedida', pm.idproductomedida,
          'Cantidad', pm.cantidad,
          'Imagen', pm.imagen,
          'PrecioVenta', pm.precioventa,
          'PrecioMayor', pm.preciomayor,
          'Estado', pm.estado,
          'Presentacion', json_build_object(
            'IdPresentacion', pr.idpresentacion,
            'Nombre', pr.nombre,
            'Abreviatura', pr.abreviatura
          ),
          'Productomedidaprecio', COALESCE(pmp_data.precios, '[]')
        )
      ) AS productomedida
      FROM productomedida pm
      LEFT JOIN presentacion pr 
        ON pr.idpresentacion = pm.idpresentacion
      LEFT JOIN LATERAL (
        SELECT jsonb_agg(
          jsonb_build_object(
            'IdProductoMedidaPrecio', pmp.idproductomedidaprecio,
            'CantidadMinima', pmp.cantidadminima,
            'Precio', pmp.precio,
            'Estado', pmp.estado
          )
        ) AS precios
        FROM productomedidaprecio pmp
        WHERE pmp.idproductomedida = pm.idproductomedida
        AND pmp.estado = 1
      ) pmp_data ON true
      WHERE pm.idproducto = p.idproducto
      AND pm.estado = 1
    ) pm_data ON true

    WHERE p.estado = 1 
    AND ($1::text IS NULL OR p.nombre ILIKE '%' || $1::text || '%')
    AND ($2::text IS NULL OR c.idcategoria = $2)
    AND ($3::text IS NULL OR sc.idsubcategoria = $3)
     
    ORDER BY p.idproducto
    LIMIT $4 OFFSET $5;
    `, [
            searchParam,
            categoriaParam,
            subcategoriaParam,
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
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
        return res.status(500).json({ message: "Error desconocido" });
    }
};
exports.getProductosVista = getProductosVista;
const getProducto = async (req, res) => {
    try {
        const result = await db_1.AppDataSource.query(`
  SELECT 
    p.idproducto,
    p.nombre,
    p.descripcion,
    p.descripcionlarga,
    p.fecharegistro,
    p.fechaactualizacion,
    p.estado,
    p.imagen,
    p.cantidad
   FROM producto p 
   WHERE estado = 1
  `);
        return res.json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getProducto = getProducto;
const getProductoSucursal = async (req, res) => {
    try {
        const { nombre } = req.params; // mejor usar nombre en vez de id
        const producto = await Producto_1.Producto.findOne({
            where: { Nombre: (0, typeorm_1.Like)(`%${nombre}%`) }, // búsqueda parcial
            relations: ["Productosucursal", "Productosucursal.Sucursal"],
        });
        if (!producto) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        return res.json(producto);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getProductoSucursal = getProductoSucursal;
const verifyProducto = async ({ ProductoId }) => {
    const existProducto = await Producto_1.Producto.findOne({ where: { IdProducto: ProductoId } });
    if (!existProducto) {
        throw new error_handler_1.HttpError(404, `El producto con ID ${ProductoId} no existe.`);
    }
    return existProducto;
};
exports.verifyProducto = verifyProducto;
