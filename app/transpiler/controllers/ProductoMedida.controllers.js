"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getmedidasdelProductoPrecio = exports.getProductomedidas = exports.getmedidasdelProducto = exports.updateCreatePrecioProducto = exports.updateProductoMedida = exports.updateProductoMedidaPrecio = exports.verifyProductoMedidaPrecio = exports.verifyProductoMedida = exports.createProductoMedidaPrecio = exports.createProductoMedida = void 0;
const ProductoMedida_1 = require("../entities/ProductoMedida");
const idGenerator_1 = require("../utils/idGenerator");
const Producto_controllers_1 = require("./Producto.controllers");
const error_handler_1 = require("../utils/error.handler");
const Presentacion_controllers_1 = require("./Presentacion,controllers");
const db_1 = require("../db");
const Fecha_1 = require("../utils/Fecha");
const Productomedidaprecio_1 = require("../entities/Productomedidaprecio");
const { fecha, hora } = (0, Fecha_1.getFechaHoraBolivia)();
const createProductoMedida = async (IdProducto, Idpresentacion, Cantidad, Precio, PrecioMayor, Url, comision) => {
    const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('PM');
    const nuevoPaquete = new ProductoMedida_1.Productomedida();
    nuevoPaquete.IdProductoMedida = nuevoId;
    nuevoPaquete.Cantidad = Cantidad || 0;
    nuevoPaquete.Producto = await (0, Producto_controllers_1.verifyProducto)({ ProductoId: IdProducto });
    nuevoPaquete.PrecioVenta = Precio;
    nuevoPaquete.PrecioMayor = PrecioMayor;
    nuevoPaquete.Presentacion = await (0, Presentacion_controllers_1.verifyPresentacion)({ PresentacionId: Idpresentacion });
    nuevoPaquete.FechaRegistro = fecha;
    nuevoPaquete.Comision = comision;
    if (Url)
        nuevoPaquete.Imagen = Url;
    await nuevoPaquete.save();
};
exports.createProductoMedida = createProductoMedida;
const createProductoMedidaPrecio = async (IdProductoPrecio, Cantidad, Precio) => {
    const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('PMP');
    const nuevoPaquete = new Productomedidaprecio_1.Productomedidaprecio();
    nuevoPaquete.IdProductoMedidaPrecio = nuevoId;
    nuevoPaquete.CantidadMinima = Cantidad || 0;
    nuevoPaquete.ProductoMedida = await (0, exports.verifyProductoMedida)({ PaqueteId: IdProductoPrecio });
    nuevoPaquete.Precio = Precio || 0;
    await nuevoPaquete.save();
};
exports.createProductoMedidaPrecio = createProductoMedidaPrecio;
const verifyProductoMedida = async ({ PaqueteId }) => {
    const existPaquete = await ProductoMedida_1.Productomedida.findOne({
        where: { IdProductoMedida: PaqueteId },
        relations: ["Producto"]
    });
    if (!existPaquete) {
        throw new error_handler_1.HttpError(404, `El Productomedida con ID ${PaqueteId} no existe.`);
    }
    return existPaquete;
};
exports.verifyProductoMedida = verifyProductoMedida;
const verifyProductoMedidaPrecio = async (PaqueteId) => {
    const existPaquete = await Productomedidaprecio_1.Productomedidaprecio.findOne({
        where: { IdProductoMedidaPrecio: PaqueteId },
        relations: ["ProductoMedida"]
    });
    if (!existPaquete) {
        throw new error_handler_1.HttpError(404, `El Productomedidaprecio con ID ${PaqueteId} no existe.`);
    }
    return existPaquete;
};
exports.verifyProductoMedidaPrecio = verifyProductoMedidaPrecio;
const updateProductoMedidaPrecio = async (IdProductomedidaPrecio, IdProductoPrecio, Cantidad, Precio, Estado) => {
    if (!IdProductomedidaPrecio && Estado == 0)
        return;
    if (IdProductomedidaPrecio) {
        const nuevoPaquete = await (0, exports.verifyProductoMedidaPrecio)(IdProductomedidaPrecio);
        nuevoPaquete.CantidadMinima = Cantidad || 0;
        nuevoPaquete.ProductoMedida = await (0, exports.verifyProductoMedida)({ PaqueteId: IdProductoPrecio });
        nuevoPaquete.Precio = Precio || 0;
        nuevoPaquete.Estado = Estado;
        return await nuevoPaquete.save();
    }
    else
        return await (0, exports.createProductoMedidaPrecio)(IdProductoPrecio, Cantidad, Precio);
};
exports.updateProductoMedidaPrecio = updateProductoMedidaPrecio;
const updateProductoMedida = async (IdProductomedida, IdProducto, Idpresentacion, Cantidad, Precio, PrecioMayor, Url, Estado, comision) => {
    if (IdProductomedida) {
        const nuevoPaquete = await (0, exports.verifyProductoMedida)({ PaqueteId: IdProductomedida });
        nuevoPaquete.Cantidad = Cantidad || 0;
        nuevoPaquete.PrecioVenta = Precio;
        nuevoPaquete.PrecioMayor = PrecioMayor;
        nuevoPaquete.Presentacion = await (0, Presentacion_controllers_1.verifyPresentacion)({ PresentacionId: Idpresentacion });
        nuevoPaquete.Imagen = Url;
        nuevoPaquete.Estado = Estado;
        nuevoPaquete.Comision = comision;
        await nuevoPaquete.save();
        nuevoPaquete;
    }
    else
        await (0, exports.createProductoMedida)(IdProducto, Idpresentacion, Cantidad, Precio, PrecioMayor, Url, comision);
};
exports.updateProductoMedida = updateProductoMedida;
const updateCreatePrecioProducto = async (req, res) => {
    try {
        const { Precio } = req.body;
        if (Precio.length > 0)
            for (const precio of Precio) {
                await (0, exports.updateProductoMedidaPrecio)(precio.IdProductomedidaprecio, precio.Idproductomedida, precio.Cantidad, precio.precio, precio.Estado);
            }
        return res.json({ messaje: 'Se registro correctamente' });
    }
    catch (error) {
        console.error("Error real:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};
exports.updateCreatePrecioProducto = updateCreatePrecioProducto;
const getmedidasdelProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.AppDataSource.query(`
      SELECT 
        pm.idproductomedida,
        pm.cantidad,
        pm.precioventa,
        pm.preciomayor,
        pm.imagen,

        -- 🔥 Producto
        json_build_object(
          'IdProducto', p.idproducto,
          'Nombre', p.nombre,
          'Descripcion', p.descripcion,
          'Imagen', p.imagen,
          'Estado', p.estado
        ) AS producto,

        -- 🔥 Presentacion
        json_build_object(
          'IdPresentacion', pr.idpresentacion,
          'Nombre', pr.nombre,
          'Estado', pr.estado,
          'Abreviatura', pr.abreviatura
        ) AS presentacion

      FROM productomedida pm

      LEFT JOIN producto p 
        ON p.idproducto = pm.idproducto

      LEFT JOIN presentacion pr 
        ON pr.idpresentacion = pm.idpresentacion

      WHERE pm.estado = 1
        AND pm.idproducto = $1

      ORDER BY pm.idproductomedida;
      `, [id]);
        return res.json(result);
    }
    catch (error) {
        console.error("Error real:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};
exports.getmedidasdelProducto = getmedidasdelProducto;
const getProductomedidas = async (req, res) => {
    try {
        const result = await db_1.AppDataSource.query(`
      SELECT 
        pm.idproductomedida,
        pm.cantidad,
        pm.precioventa,
        pm.preciomayor,
        pm.comision,
        pm.imagen,
        --  Producto
        json_build_object(
          'IdProducto', p.idproducto,
          'Nombre', p.nombre,
          'Descripcion', p.descripcion,
          'Imagen', p.imagen,
          'Estado', p.estado
        ) AS producto,

        --  Presentacion
        json_build_object(
          'IdPresentacion', pr.idpresentacion,
          'Nombre', pr.nombre,
          'Estado', pr.estado
        ) AS presentacion

      FROM productomedida pm

      LEFT JOIN producto p 
        ON p.idproducto = pm.idproducto

      LEFT JOIN presentacion pr 
        ON pr.idpresentacion = pm.idpresentacion

      ORDER BY pm.idproductomedida;
      `);
        return res.json(result);
    }
    catch (error) {
        console.error("Error real:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};
exports.getProductomedidas = getProductomedidas;
const getmedidasdelProductoPrecio = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.AppDataSource.query(` SELECT 
        pm.idproductomedidaprecio,
        pm.cantidadminima,
        pm.precio,
        pm.estado
        FROM productomedidaprecio pm
        WHERE pm.estado = 1
        AND pm.idproductomedida= $1
      ORDER BY pm.idproductomedidaprecio;
      `, [id]);
        return res.json(result);
    }
    catch (error) {
        console.error("Error real:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};
exports.getmedidasdelProductoPrecio = getmedidasdelProductoPrecio;
