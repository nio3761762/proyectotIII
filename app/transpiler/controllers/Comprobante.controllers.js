"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComprobante = exports.verifyComprobante = void 0;
const error_handler_1 = require("../utils/error.handler");
const Comprobante_1 = require("../entities/Comprobante");
const verifyComprobante = async ({ TipoId }) => {
    const existComprobante = await Comprobante_1.Comprobante.findOne({ where: { IdComprobante: TipoId } });
    if (!existComprobante) {
        throw new error_handler_1.HttpError(404, `El comprobante con ID ${TipoId} no existe.`);
    }
    return existComprobante;
};
exports.verifyComprobante = verifyComprobante;
const getComprobante = async (req, res) => {
    try {
        const comprobante = await Comprobante_1.Comprobante.find();
        return res.json(comprobante);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getComprobante = getComprobante;
