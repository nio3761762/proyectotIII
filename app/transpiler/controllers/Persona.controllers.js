"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPersonas = exports.getClientes = exports.UpdatePersona = exports.deletePersona = exports.CreatePersona = exports.getPersona = exports.updatePersona = exports.SubirPhoto = exports.verifyPersona = exports.createPersona = exports.AnanirPersona = void 0;
const Persona_1 = require("../entities/Persona");
const Direccion_controllers_1 = require("./Direccion.controllers");
const Estado_controllers_1 = require("./Estado.controllers");
const Genero_controllers_1 = require("./Genero.controllers");
const Email_controllers_1 = require("./Email.controllers");
const Celular_controllers_1 = require("./Celular.controllers");
const Foto_controllers_1 = require("./Foto.controllers");
const error_handler_1 = require("../utils/error.handler");
const Celular_1 = require("../entities/Celular");
const idGenerator_1 = require("../utils/idGenerator");
const Documento_controllers_1 = require("./Documento.controllers");
const AnanirPersona = async ({ Nombre, ApellidoPaterno, ApellidoMaterno, FechaDeNacimiento, IdGenero, email, }) => {
    // Obtener último ID
    const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('PER');
    // Crear nueva persona
    const nueva = new Persona_1.Persona();
    nueva.IdPersona = nuevoId;
    if (Nombre)
        nueva.Nombre = Nombre;
    if (ApellidoPaterno)
        nueva.ApellidoPaterno = ApellidoPaterno;
    if (ApellidoMaterno)
        nueva.ApellidoMaterno = ApellidoMaterno;
    if (FechaDeNacimiento)
        nueva.FechaDeNacimiento = new Date(FechaDeNacimiento);
    nueva.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: 1 });
    nueva.FechaRegistro = new Date();
    nueva.Genero = await (0, Genero_controllers_1.verifyGenero)({ GeneroId: IdGenero });
    // if(Salario)
    // nueva.Salario=await verifySalario({SalarioId:Salario});
    await nueva.save();
    if (email)
        await (0, Email_controllers_1.createEmail)({ email: email, idpersona: nuevoId });
    return nueva;
};
exports.AnanirPersona = AnanirPersona;
const createPersona = async ({ Nombre, ApellidoPaterno, ApellidoMaterno, FechaDeNacimiento, IdGenero, email, BarrioId, Direccion, Referencia, Url }) => {
    // Obtener último ID
    const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('PER');
    // Crear nueva persona
    const nueva = new Persona_1.Persona();
    nueva.IdPersona = nuevoId;
    if (Nombre)
        nueva.Nombre = Nombre;
    if (ApellidoPaterno)
        nueva.ApellidoPaterno = ApellidoPaterno;
    if (ApellidoMaterno)
        nueva.ApellidoMaterno = ApellidoMaterno;
    if (FechaDeNacimiento)
        nueva.FechaDeNacimiento = new Date(FechaDeNacimiento);
    nueva.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: 1 });
    nueva.FechaRegistro = new Date();
    if (BarrioId || Direccion || Referencia) {
        nueva.Direccion = await (0, Direccion_controllers_1.createDireccion)({
            BarrioId: BarrioId ?? null,
            Direccions: Direccion ?? '',
            Referencia: Referencia ?? '',
            Ubicacion: ''
        });
    }
    nueva.Genero = await (0, Genero_controllers_1.verifyGenero)({ GeneroId: IdGenero });
    if (Url)
        nueva.Imagen = await (0, Foto_controllers_1.createImagen)({ Foto: Url });
    // if(Salario)
    // nueva.Salario=await verifySalario({SalarioId:Salario});
    await nueva.save();
    await (0, Email_controllers_1.createEmail)({ email: email, idpersona: nuevoId });
    return nueva;
};
exports.createPersona = createPersona;
const verifyPersona = async ({ PersonaId }) => {
    const existPersona = await Persona_1.Persona.findOne({ where: { IdPersona: PersonaId }, relations: ['Email'] });
    if (!existPersona) {
        throw new error_handler_1.HttpError(404, `La persona con ID ${PersonaId} no existe.`);
    }
    return existPersona;
};
exports.verifyPersona = verifyPersona;
const SubirPhoto = async (req, res) => {
    try {
        const { id } = req.params;
        const { Foto } = req.body;
        const persona = await Persona_1.Persona.findOneBy({ IdPersona: id });
        if (!persona)
            return res.status(404).json({ message: "La Persona no cuenta con un imagen" });
        persona.Imagen = await (0, Foto_controllers_1.createImagen)({ Foto });
        await persona.save();
        return res.status(200).json({ message: "Se actualizo la imagen del Persona exitosamente" });
    }
    catch (error) {
        console.error("Error al obtener los menús del rol:", error);
        return res.status(500).json({ mensaje: "Error del servidor" });
    }
};
exports.SubirPhoto = SubirPhoto;
const updatePersona = async ({ IdPersona, Nombre, ApellidoPaterno, ApellidoMaterno, FechaDeNacimiento, IdGenero, IdEmail, email, IdDireccion, BarrioId, Direccion, Referencia, IdImagen, Url }) => {
    const persona = await (0, exports.verifyPersona)({ PersonaId: IdPersona });
    console.log(IdImagen + " - " + Url);
    if (Nombre)
        persona.Nombre = Nombre;
    if (ApellidoPaterno)
        persona.ApellidoPaterno = ApellidoPaterno;
    if (ApellidoMaterno)
        persona.ApellidoMaterno = ApellidoMaterno;
    if (FechaDeNacimiento)
        persona.FechaDeNacimiento = new Date(FechaDeNacimiento);
    persona.FechaActualizacion = new Date();
    if (IdDireccion || BarrioId || Direccion || Referencia)
        persona.Direccion = await (0, Direccion_controllers_1.updateDireccion)({ IdDireccion: IdDireccion, BarrioId: BarrioId, Direccions: Direccion, Referencia: Referencia, Ubicacion: '' });
    persona.Genero = await (0, Genero_controllers_1.verifyGenero)({ GeneroId: IdGenero });
    if (IdImagen) {
        persona.Imagen = await (0, Foto_controllers_1.updateImagen)({ ImagenId: IdImagen, Foto: Url });
    }
    else if (Url)
        persona.Imagen = await (0, Foto_controllers_1.createImagen)({ Foto: Url });
    // if(Salario)
    // nueva.Salario=await verifySalario({SalarioId:Salario});
    await persona.save();
    await (0, Email_controllers_1.updateEmail)({ EmailId: IdEmail, email: email });
    return persona;
};
exports.updatePersona = updatePersona;
const getPersona = async (req, res) => {
    try {
        const { id } = req.params;
        const persona = await Persona_1.Persona.findOne({
            where: { Usuario: { IdUsuario: id } },
            relations: [
                "Estado",
                "Email",
                "Genero",
                'Documento',
                'Documento.Tipodocumento',
                'Documento.Complemento',
                //"Salario",
                "Imagen",
                "Celulares",
                "Direccion",
                "Direccion.Barrio",
                "Usuario.Rolusuario",
                "Usuario.Rolusuario.Rol"
            ]
        });
        if (persona === null) {
            return res.status(404).json('Persona not found');
        }
        return res.json(persona);
        //return res.json(Persona);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getPersona = getPersona;
const CreatePersona = async (req, res) => {
    try {
        const { Personas } = req.body;
        const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('PER');
        const persona = new Persona_1.Persona();
        persona.IdPersona = nuevoId;
        persona.Nombre = Personas.Nombre;
        persona.ApellidoPaterno = Personas.ApellidoPaterno;
        persona.ApellidoMaterno = Personas.ApellidoMaterno;
        persona.FechaDeNacimiento = new Date(Personas.FechaDeNacimiento);
        persona.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: 1 });
        persona.FechaRegistro = new Date();
        persona.Direccion = await (0, Direccion_controllers_1.createDireccion)({ BarrioId: Personas.BarrioId, Direccions: Personas.Direccion, Referencia: Personas.Referencia, Ubicacion: '' });
        ;
        persona.Genero = await (0, Genero_controllers_1.verifyGenero)({ GeneroId: Personas.IdGenero });
        if (Personas.Url)
            persona.Imagen = await (0, Foto_controllers_1.createImagen)({ Foto: Personas.Url });
        await persona.save();
        await (0, Email_controllers_1.createEmail)({ email: Personas.email, idpersona: nuevoId });
        if (Personas.Celulares.length > 0)
            for (const celules of Personas.Celulares)
                await (0, Celular_controllers_1.createCelular)({ Numero: celules.Numero, PersonaId: nuevoId });
        if (Personas.Documento.length > 0)
            for (const documento of Personas.Documento)
                await (0, Documento_controllers_1.createDocumento)({ IdTipoDocumento: documento.IdTipodocumento, IdComplemento: documento.Complemento, Documentos: documento.Documento, PersonaId: nuevoId });
        return res.status(200).json({ message: "Se registro al cliente exitosamente" });
    }
    catch (error) {
        console.error("Error al obtener los menús del rol:", error);
        return res.status(500).json({ message: "Error del servidor" });
    }
};
exports.CreatePersona = CreatePersona;
const deletePersona = async (req, res) => {
    try {
        const { id } = req.params;
        const persona = await Persona_1.Persona.findOne({
            where: { IdPersona: id },
            relations: ['Estado']
        });
        if (!persona) {
            return res.status(404).json({ message: "Persona no encontrado" });
        }
        const esActivo = persona.Estado?.IdEstado === 1;
        const nuevoEstadoId = esActivo ? 2 : 1;
        const mensajeAccion = esActivo ? 'eliminaron' : 'habilitaron';
        const nuevoEstado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: nuevoEstadoId });
        if (!nuevoEstado) {
            return res.status(500).json({ message: "No se pudo obtener el estado requerido." });
        }
        persona.Estado = nuevoEstado;
        await persona.save();
        return res.json({ message: `Se ${mensajeAccion} los datos del Cliente correctamente` });
    }
    catch (error) {
        console.error("Error al cambiar el estado del Persona:", error);
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.deletePersona = deletePersona;
const UpdatePersona = async (req, res) => {
    try {
        const { id } = req.params;
        const { Personas } = req.body;
        console.log(Personas);
        const persona = await Persona_1.Persona.findOneBy({ IdPersona: id });
        if (!persona)
            return res.status(404).json({ message: "El cliente no existe" });
        persona.Nombre = Personas.Nombre;
        persona.ApellidoPaterno = Personas.ApellidoPaterno;
        persona.ApellidoMaterno = Personas.ApellidoMaterno;
        persona.FechaDeNacimiento = new Date(Personas.FechaDeNacimiento);
        persona.FechaActualizacion = new Date();
        persona.Direccion = await (0, Direccion_controllers_1.updateDireccion)({ IdDireccion: Personas.IdDireccion, BarrioId: Personas.BarrioId, Direccions: Personas.Direccion, Referencia: Personas?.Referencia, Ubicacion: Personas?.Ubicacion });
        persona.Genero = await (0, Genero_controllers_1.verifyGenero)({ GeneroId: Personas.IdGenero });
        persona.Email = await (0, Email_controllers_1.updateEmail)({ EmailId: Personas.IdEmail, email: Personas.email });
        if (Personas.IdImagen) {
            persona.Imagen = await (0, Foto_controllers_1.updateImagen)({ ImagenId: Personas.IdImagen, Foto: Personas.Url });
        }
        else if (Personas.Url)
            persona.Imagen = await (0, Foto_controllers_1.createImagen)({ Foto: Personas.Url });
        await persona.save();
        if (Personas.Celulares && Personas.Celulares.length > 0) {
            const celularesActuales = await Celular_1.Celular.find({
                where: { Persona: { IdPersona: id } }
            });
            const idsEnviados = Personas.Celulares
                .filter((c) => c.IdCelular) // solo los que tienen ID
                .map((c) => c.IdCelular);
            for (const celularExistente of celularesActuales) {
                if (!idsEnviados.includes(celularExistente.IdCelular)) {
                    await celularExistente.remove(); // o .destroy() si usas Sequelize
                }
            }
            for (const celules of Personas.Celulares) {
                await (0, Celular_controllers_1.updateCelular)({
                    CelularId: celules.IdCelular,
                    Numero: celules.Numero,
                    PersonaId: id
                });
            }
        }
        if (Personas.Documento && Personas.Documento.length > 0)
            for (const documento of Personas.Documento)
                await (0, Documento_controllers_1.updateDocumento)({ DocumentoId: documento.IdDocumento, IdTipoDocumento: documento.IdTipodocumento, IdComplemento: documento.Complemento, Documentos: documento.Documento, PersonaId: id });
        return res.status(200).json({ message: "Se actualizo al cliente exitosamente" });
    }
    catch (error) {
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
};
exports.UpdatePersona = UpdatePersona;
const getClientes = async (req, res) => {
    try {
        const Personas = await Persona_1.Persona.find({ relations: ["Estado",
                "Email",
                "Genero",
                "Imagen",
                "Celulares",
                "Documento",
                "Documento.Tipodocumento",
                "Documento.Complemento",
                "Direccion",
                "Direccion.Barrio",
            ] });
        return res.json(Personas);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getClientes = getClientes;
const getPersonas = async (req, res) => {
    try {
        const personas = await Persona_1.Persona.find({
            relations: [
                "Estado",
                "Email",
                "Genero",
                "Imagen",
                "Celulares",
                "Documento",
                "Documento.Tipodocumento",
                "Documento.Complemento",
                "Direccion",
                "Direccion.Barrio",
                "Usuario",
                "Usuario.Estado",
                "Proveedor",
                "Proveedor.Estado"
            ]
        });
        const personasFiltradas = personas.filter(persona => {
            const usuarioInactivo = persona.Usuario && persona.Usuario.Estado && persona.Usuario.Estado.Nombre === "Activo";
            const proveedorInactivo = persona.Proveedor && persona.Proveedor.Estado && persona.Proveedor.Estado.Nombre === "Activo";
            return !(usuarioInactivo || proveedorInactivo);
        });
        return res.json(personasFiltradas);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getPersonas = getPersonas;
