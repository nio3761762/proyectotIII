"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDetallePedido = exports.createDetallePedido = exports.deleteDetallepedidoAndRestoreStock = void 0;
const Promocion_controllers_1 = require("./Promocion.controllers");
const Producto_controllers_1 = require("./Producto.controllers");
const Presentacionproducto_controllers_1 = require("./Presentacionproducto.controllers");
const idGenerator_1 = require("../utils/idGenerator");
const error_handler_1 = require("../utils/error.handler");
const DetallePedido_1 = require("../entities/DetallePedido");
const Pedido_Controllers_1 = require("./Pedido.Controllers");
const deleteDetallepedidoAndRestoreStock = async ({ Iddetalle, IdSucursal }) => {
    const detalleToDelete = await DetallePedido_1.Detallepedido.findOne({
        where: { IdDetallePedido: Iddetalle },
        relations: ["Producto", "Paquete", "Promocion"]
    });
    if (!detalleToDelete) {
        throw new error_handler_1.HttpError(404, `El detalle de venta con ID ${Iddetalle} no existe.`);
    }
    await detalleToDelete.remove();
};
exports.deleteDetallepedidoAndRestoreStock = deleteDetallepedidoAndRestoreStock;
const createDetallePedido = async ({ IdPromocion, IdProducto, Cantidad, IdPaquete, IdVenta, Precio, Modo }) => {
    const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('DP');
    const nuevoDetalleventa = new DetallePedido_1.Detallepedido();
    nuevoDetalleventa.IdDetallePedido = nuevoId;
    nuevoDetalleventa.Cantidad = Cantidad;
    if (IdPaquete)
        nuevoDetalleventa.Paquete = await (0, Presentacionproducto_controllers_1.verifyPaquete)({ PaqueteId: IdPaquete });
    if (IdPromocion)
        nuevoDetalleventa.Promocion = await (0, Promocion_controllers_1.verifyPromocion)({ PromocionId: IdPromocion });
    if (IdProducto)
        nuevoDetalleventa.Producto = await (0, Producto_controllers_1.verifyProducto)({ ProductoId: IdProducto });
    nuevoDetalleventa.Pedido = await (0, Pedido_Controllers_1.verifyPedido)({ tipo: IdVenta });
    nuevoDetalleventa.Precio = Precio;
    nuevoDetalleventa.Modo = Modo;
    await nuevoDetalleventa.save();
    return nuevoDetalleventa;
};
exports.createDetallePedido = createDetallePedido;
const updateDetallePedido = async ({ Iddetalle, IdPromocion, IdProducto, Cantidad, IdPaquete, IdVenta, Precio, Modo }) => {
    if (!Iddetalle) {
        return (0, exports.createDetallePedido)({ IdPromocion, IdProducto, Cantidad, IdPaquete, IdVenta, Precio, Modo });
    }
    const detalleVentaToUpdate = await DetallePedido_1.Detallepedido.findOne({
        where: { IdDetallePedido: Iddetalle },
        relations: ["Producto", "Paquete", "Promocion"] // Cargar relaciones para obtener los IDs antiguos.
    });
    if (!detalleVentaToUpdate) {
        throw new error_handler_1.HttpError(404, `El detalle de venta con ID ${Iddetalle} no existe.`);
    }
    detalleVentaToUpdate.Cantidad = Cantidad;
    detalleVentaToUpdate.Precio = Precio;
    detalleVentaToUpdate.Modo = Modo;
    await detalleVentaToUpdate.save();
    return detalleVentaToUpdate;
};
exports.updateDetallePedido = updateDetallePedido;
