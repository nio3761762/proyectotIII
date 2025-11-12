"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDocumento = exports.getComplemento = exports.verifyComplemento = void 0;
const error_handler_1 = require("../utils/error.handler");
const Complemento_1 = require("../entities/Complemento");
const Documento_1 = require("../entities/Documento");
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
        const complemento = await Complemento_1.Complemento.find();
        return res.json(complemento);
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
        const complemento = await Documento_1.Documento.find({
            relations: ['Tipodocumento']
        });
        return res.json(complemento);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getDocumento = getDocumento;
