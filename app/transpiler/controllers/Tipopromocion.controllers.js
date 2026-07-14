"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTipoPromocion = exports.getTipopromocions = void 0;
const Tipopromocion_1 = require("../entities/Tipopromocion");
const error_handler_1 = require("../utils/error.handler");
const db_1 = require("../db");
const getTipopromocions = async (req, res) => {
    try {
        const result = await db_1.AppDataSource.query(`
              SELECT 
                 tp.idtipopromocion,
                 tp.nombre
              FROM tipopromocion tp;
            `);
        return res.json({ result });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getTipopromocions = getTipopromocions;
const verifyTipoPromocion = async ({ PromocionId }) => {
    const existtipo = await Tipopromocion_1.Tipopromocion.findOne({ where: { IdTipoPromocion: PromocionId } });
    if (!existtipo) {
        throw new error_handler_1.HttpError(404, `El tipo de promocion con ID ${PromocionId} no existe.`);
    }
    return existtipo;
};
exports.verifyTipoPromocion = verifyTipoPromocion;
