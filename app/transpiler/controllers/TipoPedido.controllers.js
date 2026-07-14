"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTipoPedido = exports.getTipopedido = void 0;
const error_handler_1 = require("../utils/error.handler");
const TipoPedido_1 = require("../entities/TipoPedido");
const db_1 = require("../db");
const getTipopedido = async (req, res) => {
    try {
        const result = await db_1.AppDataSource.query(`
            SELECT 
              p.idtipopedido,
              p.nombre
            FROM tipopedido p
          `);
        return res.json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getTipopedido = getTipopedido;
const verifyTipoPedido = async (tipo) => {
    const existVenta = await TipoPedido_1.Tipopedido.findOne({ where: { IdTipoPedido: tipo } });
    if (!existVenta) {
        throw new error_handler_1.HttpError(404, `El Metodo Venta con ID ${tipo} no existe.`);
    }
    return existVenta;
};
exports.verifyTipoPedido = verifyTipoPedido;
