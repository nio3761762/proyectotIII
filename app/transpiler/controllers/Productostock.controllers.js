"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductostock = void 0;
const ProductoStock_1 = require("../entities/ProductoStock");
const error_handler_1 = require("../utils/error.handler");
const Producto_controllers_1 = require("./Producto.controllers");
const Sucursal_controllers_1 = require("./Sucursal.controllers");
const idGenerator_1 = require("../utils/idGenerator");
const updateProductostock = async ({ sucursalId, productoId, cantidad }) => {
    if (!sucursalId || !productoId || !cantidad) {
        throw new error_handler_1.HttpError(400, "Faltan datos");
    }
    const fecha = new Date();
    let productoStock = await ProductoStock_1.Productostock.findOne({
        where: {
            Sucursal: { IdSucursal: sucursalId },
            Fecha: fecha,
            Producto: { IdProducto: productoId }
        }
    });
    if (productoStock) {
        productoStock.Cantidad += cantidad; //(cantidad - productoStock.Cantidad) ;
        await productoStock.save();
    }
    else {
        productoStock = new ProductoStock_1.Productostock();
        productoStock.IdProductoStock = await (0, idGenerator_1.generarIdSecuencial)('PST');
        productoStock.Sucursal = await (0, Sucursal_controllers_1.verifySucursal)({ SucursalId: sucursalId });
        productoStock.Producto = await (0, Producto_controllers_1.verifyProducto)({ ProductoId: productoId });
        productoStock.Cantidad = cantidad;
        productoStock.Fecha = fecha;
        await productoStock.save();
    }
    return productoStock;
};
exports.updateProductostock = updateProductostock;
