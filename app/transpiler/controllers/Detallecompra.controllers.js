"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyDetalleCompra = exports.createDetalleCompra = void 0;
const idGenerator_1 = require("../utils/idGenerator");
const error_handler_1 = require("../utils/error.handler");
const DetalleCompra_1 = require("../entities/DetalleCompra");
const Insumomedida_controllers_1 = require("./Insumomedida.controllers");
const Fecha_1 = require("../utils/Fecha");
const createDetalleCompra = async (queryRunner, compra, Cantidad, IdMedida, Precio, Fecha) => {
    const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('DTC');
    const detalle = new DetalleCompra_1.Detallecompra();
    detalle.IdDetalleCompra = nuevoId;
    detalle.Cantidad = Cantidad;
    const insumoMedida = await (0, Insumomedida_controllers_1.verifyInsumoMedida)({ PaqueteId: IdMedida });
    if (!insumoMedida) {
        throw new Error("InsumoMedida no encontrada");
    }
    detalle.Insumomedida = insumoMedida;
    detalle.Insumo = insumoMedida.Insumo;
    detalle.Compra = compra;
    detalle.Precio = Precio;
    detalle.PrecioTotal = Cantidad * Precio;
    detalle.FechaVencimineto = (0, Fecha_1.parseFechaLocal)(Fecha);
    await queryRunner.manager.save(detalle);
};
exports.createDetalleCompra = createDetalleCompra;
const verifyDetalleCompra = async ({ PaqueteId }) => {
    const existPaquete = await DetalleCompra_1.Detallecompra.findOne({
        where: { IdDetalleCompra: PaqueteId },
        relations: ["Insumomedida", "Insumomedida.Producto"]
    });
    if (!existPaquete) {
        throw new error_handler_1.HttpError(404, `El detalle de la compra con ID ${PaqueteId} no existe.`);
    }
    return existPaquete;
};
exports.verifyDetalleCompra = verifyDetalleCompra;
