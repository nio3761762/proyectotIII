"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDetalleCompraAndRestoreStock = exports.verifyDetalleCompra = exports.updateDetalleCompra = exports.createDetalleCompra = void 0;
const idGenerator_1 = require("../utils/idGenerator");
const error_handler_1 = require("../utils/error.handler");
const DetalleCompra_1 = require("../entities/DetalleCompra");
const ProductoMedida_controllers_1 = require("./ProductoMedida.controllers");
const Compra_controllers_1 = require("./Compra.controllers");
const createDetalleCompra = async ({ IdCompra, Cantidad, IdMedida, Descripcion, Precio, Fecha }) => {
    const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('DTC');
    const nuevoDetalleventa = new DetalleCompra_1.Detallecompra();
    nuevoDetalleventa.IdDetalleCompra = nuevoId;
    nuevoDetalleventa.Cantidad = Cantidad;
    if (IdMedida)
        nuevoDetalleventa.Productomedida = await (0, ProductoMedida_controllers_1.verifyProductoMedida)({ PaqueteId: IdMedida });
    if (IdCompra)
        nuevoDetalleventa.Compra = await (0, Compra_controllers_1.verifyCompra)({ PaqueteId: IdCompra });
    nuevoDetalleventa.Precio = Precio;
    if (Descripcion)
        nuevoDetalleventa.Descripcion = Descripcion;
    nuevoDetalleventa.FechaVencimineto = new Date(Fecha);
    await nuevoDetalleventa.save();
    return nuevoDetalleventa;
};
exports.createDetalleCompra = createDetalleCompra;
const updateDetalleCompra = async ({ IdDetalle, IdCompra, Cantidad, IdMedida, Descripcion, Precio, Fecha }) => {
    if (!IdDetalle)
        return (0, exports.createDetalleCompra)({ IdCompra, Cantidad, IdMedida, Descripcion, Precio, Fecha });
    const nuevoDetalleventa = await (0, exports.verifyDetalleCompra)({ PaqueteId: IdDetalle });
    nuevoDetalleventa.Cantidad = Cantidad;
    if (IdMedida)
        nuevoDetalleventa.Productomedida = await (0, ProductoMedida_controllers_1.verifyProductoMedida)({ PaqueteId: IdMedida });
    nuevoDetalleventa.Precio = Precio;
    if (Descripcion)
        nuevoDetalleventa.Descripcion = Descripcion;
    nuevoDetalleventa.FechaVencimineto = new Date(Fecha);
    await nuevoDetalleventa.save();
    return nuevoDetalleventa;
};
exports.updateDetalleCompra = updateDetalleCompra;
const verifyDetalleCompra = async ({ PaqueteId }) => {
    const existPaquete = await DetalleCompra_1.Detallecompra.findOne({ where: { IdDetalleCompra: PaqueteId } });
    if (!existPaquete) {
        throw new error_handler_1.HttpError(404, `El detalle de la compra con ID ${PaqueteId} no existe.`);
    }
    return existPaquete;
};
exports.verifyDetalleCompra = verifyDetalleCompra;
const deleteDetalleCompraAndRestoreStock = async ({ Iddetalle }) => {
    const detalleToDelete = await DetalleCompra_1.Detallecompra.findOne({
        where: { IdDetalleCompra: Iddetalle }
    });
    if (!detalleToDelete) {
        throw new error_handler_1.HttpError(404, `El detalle de venta con ID ${Iddetalle} no existe.`);
    }
    await detalleToDelete.remove();
};
exports.deleteDetalleCompraAndRestoreStock = deleteDetalleCompraAndRestoreStock;
