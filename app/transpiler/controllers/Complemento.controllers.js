"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDocumento = exports.getComplemento = exports.verifyComplemento = void 0;
const error_handler_1 = require("../utils/error.handler");
const Complemento_1 = require("../entities/Complemento");
const db_1 = require("../db");
const verifyComplemento = async ({ TipoId }) => {
    const existComplemento = await Complemento_1.Complemento.findOne({ where: { IdComplemento: TipoId } });
    if (!existComplemento) {
        throw new error_handler_1.HttpError(404, `El complemento con ID ${TipoId} no existe.`);
    }
    return existComplemento;
};
exports.verifyComplemento = verifyComplemento;
const getComplemento = async (req, res) => {
    try {
        const result = await db_1.AppDataSource.query(`
      SELECT COALESCE(
        json_agg(
          json_build_object(
            'idcomplemento', b.IdComplemento,
            'nombre', b.Nombre
          )
        ),
        '[]'::json
      ) AS complementos
      FROM Complemento b;
    `);
        return res.json(result[0].complementos);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getComplemento = getComplemento;
const getDocumento = async (req, res) => {
    try {
        const result = await db_1.AppDataSource.query(`
      SELECT d.documento
      FROM Documento d;
    `);
        return res.json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getDocumento = getDocumento;
