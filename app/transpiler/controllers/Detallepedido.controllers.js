"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDetallePedido = exports.createDetallePedido = exports.deleteDetallepedidoAndRestoreStock = void 0;
const idGenerator_1 = require("../utils/idGenerator");
const error_handler_1 = require("../utils/error.handler");
const DetallePedido_1 = require("../entities/DetallePedido");
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
const createDetallePedido = async (queryRunner, promocion, Cantidad, presentacion, pedido, Precio) => {
    const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('DP');
    const nuevoDetalleventa = new DetallePedido_1.Detallepedido();
    nuevoDetalleventa.IdDetallePedido = nuevoId;
    nuevoDetalleventa.Cantidad = Cantidad;
    if (promocion)
        nuevoDetalleventa.Promocion = promocion;
    if (presentacion) {
        nuevoDetalleventa.Productomedida = presentacion;
        nuevoDetalleventa.Producto = presentacion.Producto;
    }
    nuevoDetalleventa.Subtotal = Number(Precio) * Number(Cantidad);
    nuevoDetalleventa.Pedido = pedido;
    nuevoDetalleventa.Precio = Precio;
    await queryRunner.manager.save(nuevoDetalleventa);
};
exports.createDetallePedido = createDetallePedido;
const updateDetallePedido = async ({ Iddetalle, IdPromocion, IdProducto, Cantidad, IdPaquete, IdVenta, Precio, Modo }) => {
    if (!Iddetalle) {
        //  return createDetallePedido({ IdPromocion, IdProducto, Cantidad, IdPaquete, IdVenta, Precio,Modo });
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
    await detalleVentaToUpdate.save();
    return detalleVentaToUpdate;
};
exports.updateDetallePedido = updateDetallePedido;
