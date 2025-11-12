"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDetalleVentas = exports.updateDetalleventaPedido = exports.createDetalleventaPedido = exports.deleteDetalleventaAndRestoreStock = exports.updateDetalleventa = exports.createDetalleventa = void 0;
const DetalleVenta_1 = require("../entities/DetalleVenta");
const Promocion_controllers_1 = require("./Promocion.controllers");
const Producto_controllers_1 = require("./Producto.controllers");
const Presentacionproducto_controllers_1 = require("./Presentacionproducto.controllers");
const Venta_controllers_1 = require("./Venta.controllers");
const SucursalProducto_controllers_1 = require("./SucursalProducto.controllers");
const idGenerator_1 = require("../utils/idGenerator");
const error_handler_1 = require("../utils/error.handler");
const createDetalleventa = async ({ IdPromocion, IdProducto, Cantidad, IdPaquete, IdVenta, Precio, IdSucursal, Modo }) => {
    const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('DV');
    const nuevoDetalleventa = new DetalleVenta_1.Detalleventa();
    nuevoDetalleventa.IdDetalleVenta = nuevoId;
    nuevoDetalleventa.Cantidad = Cantidad;
    if (IdPaquete)
        nuevoDetalleventa.Paquete = await (0, Presentacionproducto_controllers_1.verifyPaquete)({ PaqueteId: IdPaquete });
    if (IdPromocion)
        nuevoDetalleventa.Promocion = await (0, Promocion_controllers_1.verifyPromocion)({ PromocionId: IdPromocion });
    if (IdProducto)
        nuevoDetalleventa.Producto = await (0, Producto_controllers_1.verifyProducto)({ ProductoId: IdProducto });
    nuevoDetalleventa.Venta = await (0, Venta_controllers_1.verifyVenta)({ VentaId: IdVenta });
    nuevoDetalleventa.Precio = Precio;
    nuevoDetalleventa.Modo = Modo;
    await nuevoDetalleventa.save();
    if (IdProducto && IdSucursal)
        await (0, SucursalProducto_controllers_1.DecrementProducto)({ ProductoId: IdProducto, SucursalId: IdSucursal, Cantidad: Cantidad });
    if (IdPaquete && IdSucursal)
        await (0, SucursalProducto_controllers_1.DecrementPaquete)({ SucursalId: IdSucursal, Cantidad: Cantidad, PaqueteId: IdPaquete });
    if (IdPromocion && IdSucursal)
        await (0, SucursalProducto_controllers_1.DecrementPromocion)({ SucursalId: IdSucursal, Cantidad: Cantidad, PromocionId: IdPromocion });
    return nuevoDetalleventa;
};
exports.createDetalleventa = createDetalleventa;
const updateDetalleventa = async ({ Iddetalle, IdPromocion, IdProducto, Cantidad, IdPaquete, IdVenta, Precio, IdSucursal, Modo }) => {
    if (!Iddetalle) {
        return (0, exports.createDetalleventa)({ IdPromocion, IdProducto, Cantidad, IdPaquete, IdVenta, Precio, IdSucursal, Modo });
    }
    const detalleVentaToUpdate = await DetalleVenta_1.Detalleventa.findOne({
        where: { IdDetalleVenta: Iddetalle },
        relations: ["Producto", "Paquete", "Promocion"] // Cargar relaciones para obtener los IDs antiguos.
    });
    if (!detalleVentaToUpdate) {
        throw new error_handler_1.HttpError(404, `El detalle de venta con ID ${Iddetalle} no existe.`);
    }
    const oldCantidad = detalleVentaToUpdate.Cantidad;
    if (detalleVentaToUpdate.Producto) {
        await (0, SucursalProducto_controllers_1.IncrementProducto)({ SucursalId: IdSucursal, ProductoId: detalleVentaToUpdate.Producto.IdProducto, Cantidad: oldCantidad });
    }
    if (detalleVentaToUpdate.Paquete) {
        await (0, SucursalProducto_controllers_1.IncrementPaquete)({ SucursalId: IdSucursal, Cantidad: oldCantidad, PaqueteId: detalleVentaToUpdate.Paquete.IdPaquete });
    }
    if (detalleVentaToUpdate.Promocion) {
        await (0, SucursalProducto_controllers_1.IncrementPromocion)({ SucursalId: IdSucursal, PromocionId: detalleVentaToUpdate.Promocion.IdPromocion, Cantidad: oldCantidad });
    }
    detalleVentaToUpdate.Cantidad = Cantidad;
    detalleVentaToUpdate.Precio = Precio;
    detalleVentaToUpdate.Modo = Modo;
    await detalleVentaToUpdate.save();
    if (IdProducto) {
        await (0, SucursalProducto_controllers_1.DecrementProducto)({ ProductoId: IdProducto, SucursalId: IdSucursal, Cantidad: Cantidad });
    }
    if (IdPaquete) {
        await (0, SucursalProducto_controllers_1.DecrementPaquete)({ SucursalId: IdSucursal, Cantidad: Cantidad, PaqueteId: IdPaquete });
    }
    if (IdPromocion) {
        await (0, SucursalProducto_controllers_1.DecrementPromocion)({ SucursalId: IdSucursal, Cantidad: Cantidad, PromocionId: IdPromocion });
    }
    return detalleVentaToUpdate;
};
exports.updateDetalleventa = updateDetalleventa;
const deleteDetalleventaAndRestoreStock = async ({ Iddetalle, IdSucursal }) => {
    const detalleToDelete = await DetalleVenta_1.Detalleventa.findOne({
        where: { IdDetalleVenta: Iddetalle },
        relations: ["Producto", "Paquete", "Promocion"]
    });
    if (!detalleToDelete) {
        throw new error_handler_1.HttpError(404, `El detalle de venta con ID ${Iddetalle} no existe.`);
    }
    const cantidad = detalleToDelete.Cantidad;
    if (detalleToDelete.Producto) {
        await (0, SucursalProducto_controllers_1.IncrementProducto)({
            SucursalId: IdSucursal,
            ProductoId: detalleToDelete.Producto.IdProducto,
            Cantidad: cantidad
        });
    }
    else if (detalleToDelete.Paquete) {
        await (0, SucursalProducto_controllers_1.IncrementPaquete)({
            SucursalId: IdSucursal,
            PaqueteId: detalleToDelete.Paquete.IdPaquete,
            Cantidad: cantidad
        });
    }
    else if (detalleToDelete.Promocion) {
        await (0, SucursalProducto_controllers_1.IncrementPromocion)({
            SucursalId: IdSucursal,
            PromocionId: detalleToDelete.Promocion.IdPromocion,
            Cantidad: cantidad
        });
    }
    await detalleToDelete.remove(); // This will delete the entity from the database
};
exports.deleteDetalleventaAndRestoreStock = deleteDetalleventaAndRestoreStock;
const createDetalleventaPedido = async ({ IdPromocion, IdProducto, Cantidad, IdPaquete, IdVenta, Precio, Modo }) => {
    const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('DV');
    const nuevoDetalleventa = new DetalleVenta_1.Detalleventa();
    nuevoDetalleventa.IdDetalleVenta = nuevoId;
    nuevoDetalleventa.Cantidad = Cantidad;
    if (IdPaquete)
        nuevoDetalleventa.Paquete = await (0, Presentacionproducto_controllers_1.verifyPaquete)({ PaqueteId: IdPaquete });
    if (IdPromocion)
        nuevoDetalleventa.Promocion = await (0, Promocion_controllers_1.verifyPromocion)({ PromocionId: IdPromocion });
    if (IdProducto)
        nuevoDetalleventa.Producto = await (0, Producto_controllers_1.verifyProducto)({ ProductoId: IdProducto });
    nuevoDetalleventa.Venta = await (0, Venta_controllers_1.verifyVenta)({ VentaId: IdVenta });
    nuevoDetalleventa.Precio = Precio;
    nuevoDetalleventa.Modo = Modo;
    await nuevoDetalleventa.save();
    return nuevoDetalleventa;
};
exports.createDetalleventaPedido = createDetalleventaPedido;
const updateDetalleventaPedido = async ({ Iddetalle, IdPromocion, IdProducto, Cantidad, IdPaquete, IdVenta, Precio, Modo }) => {
    if (!Iddetalle) {
        return (0, exports.createDetalleventaPedido)({ IdPromocion, IdProducto, Cantidad, IdPaquete, IdVenta, Precio, Modo });
    }
    const detalleVentaToUpdate = await DetalleVenta_1.Detalleventa.findOne({
        where: { IdDetalleVenta: Iddetalle },
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
exports.updateDetalleventaPedido = updateDetalleventaPedido;
const getDetalleVentas = async (req, res) => {
    try {
        const { id } = req.params;
        const Detalleventas = await DetalleVenta_1.Detalleventa.findOne({
            where: { Venta: { IdVenta: id } },
            relations: [
                "Producto",
                "Promocion",
                "Paquete",
            ]
        });
        return res.json(Detalleventas);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getDetalleVentas = getDetalleVentas;
