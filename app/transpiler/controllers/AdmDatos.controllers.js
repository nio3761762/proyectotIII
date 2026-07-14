"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyDatos = exports.updateDatosPhoto = exports.updateDatos = exports.getDatos = void 0;
const AdmDatos_1 = require("../entities/AdmDatos");
const Persona_controllers_1 = require("./Persona.controllers");
const db_1 = require("../db");
// Obtener todos
const getDatos = async (req, res) => {
    try {
        const result = await db_1.AppDataSource.query(`
      SELECT 
          ad.*,
          row_to_json(p) AS persona
      FROM administrardatos ad
      LEFT JOIN persona p 
          ON p.idpersona = ad.idpropietario;
    `);
        //  siempre devuelve array
        return res.json(result.length > 0 ? result : []);
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
        if (updateDatos.Email)
            datos.Email = updateDatos.Email;
        if (updateDatos.Url)
            datos.Foto = updateDatos.Url;
        if (updateDatos.Celular)
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
        const datos = await AdmDatos_1.Administrardatos.findOne({ where: { IdDatos: parseInt(id) } });
        if (!datos) {
            return res.status(404).json({ message: "Dato no encontrado" });
        }
        if (Foto)
            datos.Foto = Foto;
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
