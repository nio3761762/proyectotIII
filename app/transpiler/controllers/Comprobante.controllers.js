"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComprobante = exports.verifyComprobante = void 0;
const error_handler_1 = require("../utils/error.handler");
const Comprobante_1 = require("../entities/Comprobante");
const db_1 = require("../db");
const verifyComprobante = async (TipoId) => {
    const existComprobante = await Comprobante_1.Comprobante.findOne({ where: { IdComprobante: TipoId } });
    if (!existComprobante) {
        throw new error_handler_1.HttpError(404, `El comprobante con ID ${TipoId} no existe.`);
    }
    return existComprobante;
};
exports.verifyComprobante = verifyComprobante;
const getComprobante = async (req, res) => {
    try {
        const result = await db_1.AppDataSource.query(`SELECT 
          c.idcomprobante,
          c.nombre
     FROM comprobante c`);
        return res.json({
            result
        });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getComprobante = getComprobante;
