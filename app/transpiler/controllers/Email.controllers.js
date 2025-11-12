"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmail = exports.updateEmail = exports.createEmail = exports.verifyEmailId = exports.verifyEmail = void 0;
const Email_1 = require("../entities/Email");
const error_handler_1 = require("../utils/error.handler");
const idGenerator_1 = require("../utils/idGenerator");
const Persona_controllers_1 = require("./Persona.controllers");
const verifyEmail = async ({ email }) => {
    const existEmail = await Email_1.Email.findOne({ where: { Email: email } });
    if (!existEmail) {
        throw new error_handler_1.HttpError(404, `El email  ${email} no existe.`);
    }
    const RelationEmail = await Email_1.Email.findOne({
        where: { Email: email },
        relations: ["Persona", "Persona.Usuario"],
    });
    return RelationEmail;
};
exports.verifyEmail = verifyEmail;
const verifyEmailId = async ({ EmailId }) => {
    const existEmail = await Email_1.Email.findOne({ where: { IdEmail: EmailId } });
    if (!existEmail) {
        throw new error_handler_1.HttpError(404, `El email con ID ${existEmail} no existe.`);
    }
    return existEmail;
};
exports.verifyEmailId = verifyEmailId;
const createEmail = async ({ email, idpersona }) => {
    // const existEmail = await Email.findOne({ where: { Email: email } });
    //    if (existEmail) {
    //      throw new HttpError(404,`El email ${email} ya está registrado.`);
    //   }
    const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('EM');
    const nuevo = new Email_1.Email();
    nuevo.IdEmail = nuevoId;
    nuevo.Email = email;
    nuevo.Persona = await (0, Persona_controllers_1.verifyPersona)({ PersonaId: idpersona });
    await nuevo.save();
    return nuevo;
};
exports.createEmail = createEmail;
const updateEmail = async ({ EmailId, email }) => {
    const existEmail = await (0, exports.verifyEmailId)({ EmailId: EmailId });
    if (!existEmail) {
        throw new error_handler_1.HttpError(404, `Email no registrado.`);
    }
    existEmail.IdEmail = EmailId;
    if (email)
        existEmail.Email = email;
    await existEmail.save();
    return existEmail;
};
exports.updateEmail = updateEmail;
const getEmail = async (req, res) => {
    try {
        const complemento = await Email_1.Email.find({});
        return res.json(complemento);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getEmail = getEmail;
