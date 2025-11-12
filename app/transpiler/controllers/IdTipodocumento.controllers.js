"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTipodocumento = void 0;
const TipoDocumento_1 = require("../entities/TipoDocumento");
const verifyTipodocumento = async ({ TipoDocumentoId }) => {
    const existTipodocumento = await TipoDocumento_1.Tipodocumento.findOne({ where: { IdTipoDocumento: TipoDocumentoId } });
    if (!existTipodocumento) {
        throw new Error(`El Tipo de documento con ID ${existTipodocumento} no existe.`);
    }
    return existTipodocumento;
};
exports.verifyTipodocumento = verifyTipodocumento;
