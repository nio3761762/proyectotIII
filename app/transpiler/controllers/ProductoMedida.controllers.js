"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductoInMedida = exports.getAllProducts = exports.updateProductoMedida = exports.verifyProductoMedida = exports.createProductoMedida = void 0;
const ProductoMedida_1 = require("../entities/ProductoMedida");
const idGenerator_1 = require("../utils/idGenerator");
const Medida_controllers_1 = require("./Medida.controllers");
const Producto_controllers_1 = require("./Producto.controllers");
const error_handler_1 = require("../utils/error.handler");
const createProductoMedida = async ({ IdProducto, IdUnidadMedida, Cantidad, Precio, PrecioMayor }) => {
    const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('PM');
    const nuevoPaquete = new ProductoMedida_1.Productomedida();
    nuevoPaquete.IdProductoMedida = nuevoId;
    if (Cantidad)
        nuevoPaquete.Cantidad = Cantidad || 0;
    nuevoPaquete.Producto = await (0, Producto_controllers_1.verifyProducto)({ ProductoId: IdProducto });
    nuevoPaquete.PrecioVenta = Precio;
    nuevoPaquete.PrecioMayor = PrecioMayor;
    nuevoPaquete.Unidadmedida = await (0, Medida_controllers_1.verifyUnidadMedida)({ UnidadMedidaId: IdUnidadMedida });
    nuevoPaquete.FechaRegistro = new Date();
    nuevoPaquete.Unidadmedida = await (0, Medida_controllers_1.verifyUnidadMedida)({ UnidadMedidaId: IdUnidadMedida });
    await nuevoPaquete.save();
    return nuevoPaquete;
};
exports.createProductoMedida = createProductoMedida;
const verifyProductoMedida = async ({ PaqueteId }) => {
    const existPaquete = await ProductoMedida_1.Productomedida.findOne({ where: { IdProductoMedida: PaqueteId } });
    if (!existPaquete) {
        throw new error_handler_1.HttpError(404, `El Productomedida con ID ${PaqueteId} no existe.`);
    }
    return existPaquete;
};
exports.verifyProductoMedida = verifyProductoMedida;
const updateProductoMedida = async ({ IdProductomedida, IdProducto, IdUnidadMedida, Cantidad, Precio, PrecioMayor }) => {
    if (IdProductomedida) {
        const nuevoPaquete = await (0, exports.verifyProductoMedida)({ PaqueteId: IdProductomedida });
        if (Cantidad)
            nuevoPaquete.Cantidad = Cantidad || 0;
        nuevoPaquete.Producto = await (0, Producto_controllers_1.verifyProducto)({ ProductoId: IdProducto });
        nuevoPaquete.PrecioVenta = Precio;
        nuevoPaquete.PrecioMayor = PrecioMayor;
        nuevoPaquete.Unidadmedida = await (0, Medida_controllers_1.verifyUnidadMedida)({ UnidadMedidaId: IdUnidadMedida });
        nuevoPaquete.FechaRegistro = new Date();
        nuevoPaquete.Unidadmedida = await (0, Medida_controllers_1.verifyUnidadMedida)({ UnidadMedidaId: IdUnidadMedida });
        await nuevoPaquete.save();
        return nuevoPaquete;
    }
    return (0, exports.createProductoMedida)({ IdProducto: IdProducto, IdUnidadMedida: IdUnidadMedida, Cantidad: Cantidad, Precio: Precio, PrecioMayor: PrecioMayor });
};
exports.updateProductoMedida = updateProductoMedida;
const getAllProducts = async (req, res) => {
    try {
        const allProductoSucursal = await ProductoMedida_1.Productomedida.find({
            where: {
                Producto: { Tipoproducto: { IdTipoProducto: 'ITP-1' } }
            },
            relations: [
                'Producto',
                'Unidadmedida',
            ],
        });
        if (!allProductoSucursal.length) {
            return res.status(404).json({ message: "No se encontraron productos con cantidades en ninguna sucursal." });
        }
        // Transformar datos para dejar solo los IDs pedidos
        const result = allProductoSucursal.map(ps => {
            return {
                ...ps,
                Medida: ps.Unidadmedida?.IdUnidadMedida ?? null,
                Nombre: ps.Unidadmedida?.Nombre ?? null,
                Abreviatura: ps.Unidadmedida?.Abreviatura ?? null, // 👈 solo IdSucursal
                IdProducto: ps.Producto.Nombre,
                NombreProducto: ps.Producto.Nombre
            };
        }) || [];
        return res.json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
        return res.status(500).json({ message: "Ocurrió un error desconocido." });
    }
};
exports.getAllProducts = getAllProducts;
const getProductoInMedida = async (req, res) => {
    try {
        const { id } = req.params;
        const allProductoSucursal = await ProductoMedida_1.Productomedida.find({
            where: {
                Producto: { IdProducto: id }
            },
            relations: [
                'Unidadmedida',
                'Unidadmedida.Categoria'
            ],
        });
        if (!allProductoSucursal.length) {
            return res.status(404).json({ message: "No se encontraron productos con cantidades en ninguna sucursal." });
        }
        return res.json(allProductoSucursal);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
        return res.status(500).json({ message: "Ocurrió un error desconocido." });
    }
};
exports.getProductoInMedida = getProductoInMedida;
