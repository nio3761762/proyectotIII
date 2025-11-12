"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCelular = exports.verifyCelular = exports.updateCelular = exports.createCelular = void 0;
const Celular_1 = require("../entities/Celular");
const Persona_controllers_1 = require("./Persona.controllers");
const idGenerator_1 = require("../utils/idGenerator");
const Estado_controllers_1 = require("./Estado.controllers");
const error_handler_1 = require("../utils/error.handler");
const createCelular = async ({ Numero, PersonaId }) => {
    const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('CEL');
    const nuevo = new Celular_1.Celular();
    nuevo.IdCelular = nuevoId;
    nuevo.Numero = Numero;
    nuevo.Persona = await (0, Persona_controllers_1.verifyPersona)({ PersonaId: PersonaId });
    nuevo.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: 1 });
    await nuevo.save();
    return nuevo;
};
exports.createCelular = createCelular;
const updateCelular = async ({ CelularId, Numero, PersonaId }) => {
    if (CelularId) {
        const existCelular = await (0, exports.verifyCelular)({ CelularId: CelularId });
        existCelular.Numero = Numero;
        existCelular.Persona = await (0, Persona_controllers_1.verifyPersona)({ PersonaId: PersonaId });
        await existCelular.save();
        return existCelular;
    }
    else
        return await (0, exports.createCelular)({ Numero: Numero, PersonaId: PersonaId });
};
exports.updateCelular = updateCelular;
const verifyCelular = async ({ CelularId }) => {
    const existCelular = await Celular_1.Celular.findOne({ where: { IdCelular: CelularId } });
    if (!existCelular) {
        throw new error_handler_1.HttpError(404, `El celular con ID ${existCelular} no existe.`);
    }
    return existCelular;
};
exports.verifyCelular = verifyCelular;
const getCelular = async (req, res) => {
    try {
        const complemento = await Celular_1.Celular.find({});
        return res.json(complemento);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getCelular = getCelular;
