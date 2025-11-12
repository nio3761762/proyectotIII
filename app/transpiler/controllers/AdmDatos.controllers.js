"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyDatos = exports.updateDatosPhoto = exports.updateDatos = exports.getDatos = void 0;
const AdmDatos_1 = require("../entities/AdmDatos");
const Foto_controllers_1 = require("./Foto.controllers");
const Email_controllers_1 = require("./Email.controllers");
const Persona_controllers_1 = require("./Persona.controllers");
// Obtener todos
const getDatos = async (req, res) => {
    try {
        const datos = await AdmDatos_1.Administrardatos.find({ relations: ['Imagen', 'Email', 'Persona'], });
        return res.json(datos);
    }
    catch (error) {
        return res.status(500).json({ message: "Error al obtener los datos", error });
    }
};
exports.getDatos = getDatos;
// Actualizar
const updateDatos = async (req, res) => {
    try {
        const { id } = req.params;
        const { updateDatos } = req.body;
        const datos = await AdmDatos_1.Administrardatos.findOne({ where: { IdDatos: parseInt(id) } });
        if (!datos) {
            return res.status(404).json({ message: "Dato no encontrado" });
        }
        if (updateDatos.Nombre)
            datos.Nombre = updateDatos.Nombre;
        if (updateDatos.IdPersona)
            datos.Persona = await (0, Persona_controllers_1.verifyPersona)({ PersonaId: updateDatos.IdPersona });
        if (updateDatos.IdEmail)
            datos.Email = await (0, Email_controllers_1.updateEmail)({ EmailId: updateDatos.IdEmail, email: updateDatos.Email });
        datos.Celular = updateDatos.Celular;
        await datos.save();
        return res.json({ message: "Se actualizaron los datos de la Panaderia correctamente" });
    }
    catch (error) {
        return res.status(500).json({ message: "Error al actualizar el dato", error });
    }
};
exports.updateDatos = updateDatos;
const updateDatosPhoto = async (req, res) => {
    try {
        const { id } = req.params;
        const { Foto, } = req.body;
        const datos = await AdmDatos_1.Administrardatos.findOne({ where: { IdDatos: parseInt(id) }, relations: ["Imagen"] });
        if (!datos) {
            return res.status(404).json({ message: "Dato no encontrado" });
        }
        let UpdateImagen;
        try {
            UpdateImagen = await (0, Foto_controllers_1.updateImagen)({ ImagenId: datos.Imagen.IdImagen, Foto });
        }
        catch (error) {
            if (error instanceof Error)
                return res.status(400).json({ message: error.message });
        }
        if (!UpdateImagen) {
            return res.status(500).json({ message: "No se pudo actiualizar la Imagen" });
        }
        datos.Imagen = UpdateImagen;
        await datos.save();
        return res.json({ message: "Se actualizo la Imagen correctamente" });
    }
    catch (error) {
        return res.status(500).json({ message: "Error al actualizar el dato", error });
    }
};
exports.updateDatosPhoto = updateDatosPhoto;
const verifyDatos = async ({ DatoId }) => {
    const existDato = await AdmDatos_1.Administrardatos.findOne({ where: { IdDatos: DatoId } });
    if (!existDato) {
        throw new Error(`El Dato con ID ${existDato} no existe.`);
    }
    return existDato;
};
exports.verifyDatos = verifyDatos;
