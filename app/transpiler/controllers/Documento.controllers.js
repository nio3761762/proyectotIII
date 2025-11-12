"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDocumento = exports.createDocumento = exports.verifyDocumento = void 0;
const Documento_1 = require("../entities/Documento");
const error_handler_1 = require("../utils/error.handler");
const idGenerator_1 = require("../utils/idGenerator");
const Complemento_controllers_1 = require("./Complemento.controllers");
const Persona_controllers_1 = require("./Persona.controllers");
const TipoDocumento_controllers_1 = require("./TipoDocumento.controllers");
const verifyDocumento = async ({ Documentoid }) => {
    const existDocumento = await Documento_1.Documento.findOne({ where: { IdDocumento: Documentoid } });
    if (!existDocumento) {
        throw new error_handler_1.HttpError(404, `El Documento con ID ${Documentoid} no existe.`);
    }
    return existDocumento;
};
exports.verifyDocumento = verifyDocumento;
const createDocumento = async ({ IdTipoDocumento, IdComplemento, Documentos, PersonaId }) => {
    if (Documentos) {
        const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('DC');
        const nuevoDocumento = new Documento_1.Documento();
        nuevoDocumento.IdDocumento = nuevoId;
        if (PersonaId)
            nuevoDocumento.Persona = await (0, Persona_controllers_1.verifyPersona)({ PersonaId: PersonaId });
        if (Documentos)
            nuevoDocumento.Documento = Documentos;
        if (IdTipoDocumento)
            nuevoDocumento.Tipodocumento = await (0, TipoDocumento_controllers_1.verifyTipoDocumento)({ TipoId: IdTipoDocumento });
        if (IdComplemento)
            nuevoDocumento.Complemento = await (0, Complemento_controllers_1.verifyComplemento)({ TipoId: IdComplemento });
        await nuevoDocumento.save();
        return nuevoDocumento;
    }
    else
        return null;
};
exports.createDocumento = createDocumento;
const updateDocumento = async ({ DocumentoId, IdTipoDocumento, IdComplemento, Documentos, PersonaId }) => {
    if (DocumentoId) {
        const existDocumento = await (0, exports.verifyDocumento)({ Documentoid: DocumentoId });
        if (Documentos)
            existDocumento.Documento = Documentos;
        if (IdTipoDocumento)
            existDocumento.Tipodocumento = await (0, TipoDocumento_controllers_1.verifyTipoDocumento)({ TipoId: IdTipoDocumento });
        if (IdComplemento)
            existDocumento.Complemento = await (0, Complemento_controllers_1.verifyComplemento)({ TipoId: IdComplemento });
        await existDocumento.save();
        return existDocumento;
    }
    else
        return (0, exports.createDocumento)({ IdTipoDocumento: IdTipoDocumento, IdComplemento: IdComplemento, Documentos: Documentos, PersonaId: PersonaId });
};
exports.updateDocumento = updateDocumento;
