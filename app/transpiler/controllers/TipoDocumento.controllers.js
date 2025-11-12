"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTipoDocumento = void 0;
const error_handler_1 = require("../utils/error.handler");
const TipoDocumento_1 = require("../entities/TipoDocumento");
const verifyTipoDocumento = async ({ TipoId }) => {
    const existTipoDocumento = await TipoDocumento_1.Tipodocumento.findOne({ where: { IdTipoDocumento: TipoId } });
    if (!existTipoDocumento) {
        throw new error_handler_1.HttpError(404, `El Documento con ID ${TipoId} no existe.`);
    }
    return existTipoDocumento;
};
exports.verifyTipoDocumento = verifyTipoDocumento;
