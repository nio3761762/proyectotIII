"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVentas = exports.updatePago = exports.createPagoPedido = exports.createPago = exports.verifyPago = exports.getPagosVenta = exports.getPagos = void 0;
const Pago_1 = require("../entities/Pago");
const error_handler_1 = require("../utils/error.handler");
const MetodoPago_controllers_1 = require("./MetodoPago.controllers");
const idGenerator_1 = require("../utils/idGenerator");
const MetodoPago_1 = require("../entities/MetodoPago");
const Fecha_1 = require("../utils/Fecha");
const { fecha, hora } = (0, Fecha_1.getFechaHoraBolivia)();
const getPagos = async (req, res) => {
    try {
        const Pagos = await MetodoPago_1.Metodopago.find();
        return res.json(Pagos);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getPagos = getPagos;
const getPagosVenta = async (req, res) => {
    try {
        const { id } = req.params;
        const Pagos = await Pago_1.Pago.find({
            where: { Venta: { IdVenta: id } },
            relations: ["Metodopago"],
        });
        // Mapear cada pago en un objeto más claro
        const pagosMapped = Pagos.map(p => ({
            Metodopago: p.Metodopago?.IdMetodoPago,
            Nombre: p.Metodopago?.Nombre,
            Cambio: p.Cambio,
            Monto: p.Monto,
            IdPago: p.IdPago,
        })) || [];
        return res.json(pagosMapped);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getPagosVenta = getPagosVenta;
const verifyPago = async ({ PagoId }) => {
    const existPago = await Pago_1.Pago.findOne({ where: { IdPago: PagoId } });
    if (!existPago) {
        throw new error_handler_1.HttpError(404, `El Metodo Pago con ID ${PagoId} no existe.`);
    }
    return existPago;
};
exports.verifyPago = verifyPago;
const createPago = async (queryRunner, venta, Monto, Cambio, IdMetodoPago, pedido) => {
    const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('PA');
    const nuevoPago = new Pago_1.Pago();
    nuevoPago.IdPago = nuevoId;
    nuevoPago.FechaPago = fecha;
    nuevoPago.HoraPago = hora;
    nuevoPago.Metodopago = await (0, MetodoPago_controllers_1.verifyMetodoPago)({ MetodoPagoId: IdMetodoPago });
    if (venta)
        nuevoPago.Venta = venta;
    nuevoPago.Monto = Monto;
    nuevoPago.Cambio = Cambio;
    if (pedido)
        nuevoPago.Pedido = pedido;
    await queryRunner.manager.save(nuevoPago);
};
exports.createPago = createPago;
const createPagoPedido = async (queryRunner, pedido, Monto, Cambio, IdMetodoPago) => {
    const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('PA');
    const nuevoPago = new Pago_1.Pago();
    nuevoPago.IdPago = nuevoId;
    nuevoPago.FechaPago = fecha;
    nuevoPago.HoraPago = hora;
    nuevoPago.Metodopago = await (0, MetodoPago_controllers_1.verifyMetodoPago)({ MetodoPagoId: IdMetodoPago });
    nuevoPago.Pedido = pedido;
    nuevoPago.Monto = Monto;
    nuevoPago.Cambio = Cambio;
    await queryRunner.manager.save(nuevoPago);
};
exports.createPagoPedido = createPagoPedido;
const updatePago = async ({ IdVenta, IdPago, Monto, Cambio, IdMetodoPago }) => {
    const exitPago = await (0, exports.verifyPago)({ PagoId: IdPago });
    exitPago.FechaPago = new Date();
    exitPago.Metodopago = await (0, MetodoPago_controllers_1.verifyMetodoPago)({ MetodoPagoId: IdMetodoPago });
    // exitPago.Venta = await verifyVenta({VentaId:IdVenta});
    exitPago.Monto = Monto,
        exitPago.Cambio = Cambio,
        await exitPago.save();
    return exitPago;
};
exports.updatePago = updatePago;
const getVentas = async (req, res) => {
    try {
        const { id } = req.params;
        const pagos = await Pago_1.Pago.findOne({
            where: { Venta: { IdVenta: id } },
            relations: [
                "Metodopago",
            ]
        });
        return res.json(pagos);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getVentas = getVentas;
