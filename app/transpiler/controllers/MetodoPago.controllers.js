"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyMetodoPago = exports.getMetodoPagos = void 0;
const MetodoPago_1 = require("../entities/MetodoPago");
const error_handler_1 = require("../utils/error.handler");
const getMetodoPagos = async (req, res) => {
    try {
        const MetodoPagos = await MetodoPago_1.Metodopago.find({});
        return res.json(MetodoPagos);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getMetodoPagos = getMetodoPagos;
const verifyMetodoPago = async ({ MetodoPagoId }) => {
    const existMetodoPago = await MetodoPago_1.Metodopago.findOne({ where: { IdMetodoPago: MetodoPagoId } });
    if (!existMetodoPago) {
        throw new error_handler_1.HttpError(404, `El Metodo Pago con ID ${MetodoPagoId} no existe.`);
    }
    return existMetodoPago;
};
exports.verifyMetodoPago = verifyMetodoPago;
