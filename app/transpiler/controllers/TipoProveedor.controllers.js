"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTipoproveedor = exports.getTipoproveedor = void 0;
const TipoProveedor_1 = require("../entities/TipoProveedor");
const error_handler_1 = require("../utils/error.handler");
const db_1 = require("../db");
const getTipoproveedor = async (req, res) => {
    try {
        const result = await db_1.AppDataSource.query(`
      SELECT COALESCE(
        json_agg(
          json_build_object(
            'idtipoproveedor', b.idtipoproveedor,
            'nombre', b.nombre
          )
        ),
        '[]'::json
      ) AS tipoproveedors
      FROM Tipoproveedor b;
    `);
        return res.json(result[0].tipoproveedors);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getTipoproveedor = getTipoproveedor;
const verifyTipoproveedor = async ({ TipoproveedorId }) => {
    const existTipoproveedor = await TipoProveedor_1.Tipoproveedor.findOne({ where: { IdTipoProveedor: TipoproveedorId } });
    if (!existTipoproveedor) {
        throw new error_handler_1.HttpError(404, `El Tipoproveedor con ID ${TipoproveedorId} no existe.`);
    }
    return existTipoproveedor;
};
exports.verifyTipoproveedor = verifyTipoproveedor;
