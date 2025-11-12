"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.devolucionCantidad = exports.updateDetalledistribucion = exports.createDetalledistribucion = exports.deleteDetalledistribucionAndRestoreStock = void 0;
const Producto_controllers_1 = require("./Producto.controllers");
const Presentacionproducto_controllers_1 = require("./Presentacionproducto.controllers");
const idGenerator_1 = require("../utils/idGenerator");
const error_handler_1 = require("../utils/error.handler");
const Detalledistribucion_1 = require("../entities/Detalledistribucion");
const Distribucion_controllers_1 = require("./Distribucion.controllers");
const deleteDetalledistribucionAndRestoreStock = async ({ Iddetalle }) => {
    const detalleToDelete = await Detalledistribucion_1.Detalledistribucion.findOne({
        where: { IdDetalleDistribucion: Iddetalle },
        relations: ["Producto", "Paquete"]
    });
    if (!detalleToDelete) {
        throw new error_handler_1.HttpError(404, `El detalle de venta con ID ${Iddetalle} no existe.`);
    }
    await detalleToDelete.remove();
};
exports.deleteDetalledistribucionAndRestoreStock = deleteDetalledistribucionAndRestoreStock;
const createDetalledistribucion = async ({ IdProducto, Cantidad, IdPaquete, IdVenta, Precio, Modo }) => {
    const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('DD');
    const nuevoDetalleventa = new Detalledistribucion_1.Detalledistribucion();
    nuevoDetalleventa.IdDetalleDistribucion = nuevoId;
    nuevoDetalleventa.Cantidad = Cantidad;
    if (IdPaquete)
        nuevoDetalleventa.Paquete = await (0, Presentacionproducto_controllers_1.verifyPaquete)({ PaqueteId: IdPaquete });
    if (IdProducto)
        nuevoDetalleventa.Producto = await (0, Producto_controllers_1.verifyProducto)({ ProductoId: IdProducto });
    nuevoDetalleventa.Precio = Precio;
    nuevoDetalleventa.Distribucion = await (0, Distribucion_controllers_1.verifyDistribucion)({ distribucio: IdVenta });
    nuevoDetalleventa.Cantidaddevuelta = 0;
    nuevoDetalleventa.Modo = Modo;
    await nuevoDetalleventa.save();
    return nuevoDetalleventa;
};
exports.createDetalledistribucion = createDetalledistribucion;
const updateDetalledistribucion = async ({ Iddetalle, IdProducto, Cantidad, IdPaquete, IdVenta, Precio, Modo }) => {
    if (!Iddetalle) {
        return (0, exports.createDetalledistribucion)({ IdProducto, Cantidad, IdPaquete, IdVenta, Precio, Modo });
    }
    const detalleVentaToUpdate = await Detalledistribucion_1.Detalledistribucion.findOne({
        where: { IdDetalleDistribucion: Iddetalle },
        relations: ["Producto", "Paquete"] // Cargar relaciones para obtener los IDs antiguos.
    });
    if (!detalleVentaToUpdate) {
        throw new error_handler_1.HttpError(404, `El detalle de la distribucion con ID ${Iddetalle} no existe.`);
    }
    detalleVentaToUpdate.Cantidad = Cantidad;
    detalleVentaToUpdate.Precio = Precio;
    detalleVentaToUpdate.Modo = Modo || 0;
    await detalleVentaToUpdate.save();
    return detalleVentaToUpdate;
};
exports.updateDetalledistribucion = updateDetalledistribucion;
const devolucionCantidad = async ({ Iddetalle, Cantidad }) => {
    const detalleVentaToUpdate = await Detalledistribucion_1.Detalledistribucion.findOne({
        where: {
            IdDetalleDistribucion: Iddetalle
        },
    });
    if (!detalleVentaToUpdate) {
        throw new error_handler_1.HttpError(404, `El detalle de la distribucion con ID ${Iddetalle} no existe.`);
    }
    detalleVentaToUpdate.Cantidaddevuelta = Cantidad;
    await detalleVentaToUpdate.save();
    return detalleVentaToUpdate;
};
exports.devolucionCantidad = devolucionCantidad;
