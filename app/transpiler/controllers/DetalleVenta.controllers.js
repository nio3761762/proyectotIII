"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDetalleVentas = exports.createDetalleventa = void 0;
const DetalleVenta_1 = require("../entities/DetalleVenta");
const idGenerator_1 = require("../utils/idGenerator");
const Inventario_controllers_1 = require("./Inventario.controllers");
const createDetalleventa = async (queryRunner, venta, presentacion, promocion, Cantidad, Precio, IdSucursal, tipo = "SALIDA_VENTA") => {
    const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('DV');
    const nuevoDetalleventa = new DetalleVenta_1.Detalleventa();
    nuevoDetalleventa.IdDetalleVenta = nuevoId;
    nuevoDetalleventa.Cantidad = Cantidad;
    if (promocion)
        nuevoDetalleventa.Promocion = promocion;
    if (presentacion) {
        nuevoDetalleventa.Producto = presentacion.Producto;
        nuevoDetalleventa.Productomedida = presentacion;
    }
    nuevoDetalleventa.Venta = venta;
    nuevoDetalleventa.Precio = Precio;
    await queryRunner.manager.save(nuevoDetalleventa);
    if (presentacion && IdSucursal)
        await (0, Inventario_controllers_1.DecrementProducto)(queryRunner, presentacion, IdSucursal, Cantidad, venta.IdVenta, tipo);
    if (promocion && IdSucursal)
        await (0, Inventario_controllers_1.DecrementPromocion)(queryRunner, IdSucursal, Cantidad, promocion, venta.IdVenta, tipo);
    return nuevoDetalleventa;
};
exports.createDetalleventa = createDetalleventa;
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
