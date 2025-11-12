"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTipoLicencia = exports.deleteTipoLicencia = exports.updateTipoLicencia = exports.getTipoLicencia = exports.getTipoLicencias = exports.createTipoLicencia = void 0;
const TipoLicencia_1 = require("../entities/TipoLicencia");
const idGenerator_1 = require("../utils/idGenerator");
const createTipoLicencia = async (req, res) => {
    try {
        const { NombreTipoLicencia } = req.body;
        const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('LIC');
        const tipoLicencia = new TipoLicencia_1.TipoLicencia();
        tipoLicencia.IdTipoLicencia = nuevoId;
        tipoLicencia.NombreTipoLicencia = NombreTipoLicencia;
        await tipoLicencia.save();
        return res.status(201).json({ message: "Tipo de licencia creado correctamente", tipoLicencia });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error al crear tipo de licencia:", error);
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.createTipoLicencia = createTipoLicencia;
const getTipoLicencias = async (req, res) => {
    try {
        const tiposLicencia = await TipoLicencia_1.TipoLicencia.find();
        return res.json(tiposLicencia);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getTipoLicencias = getTipoLicencias;
const getTipoLicencia = async (req, res) => {
    try {
        const { id } = req.params;
        const tipoLicencia = await TipoLicencia_1.TipoLicencia.findOneBy({ IdTipoLicencia: id });
        if (!tipoLicencia) {
            return res.status(404).json({ message: "Tipo de licencia no encontrada" });
        }
        return res.json(tipoLicencia);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getTipoLicencia = getTipoLicencia;
const updateTipoLicencia = async (req, res) => {
    try {
        const { id } = req.params;
        const { NombreTipoLicencia } = req.body;
        const tipoLicencia = await TipoLicencia_1.TipoLicencia.findOneBy({ IdTipoLicencia: id });
        if (!tipoLicencia) {
            return res.status(404).json({ message: "Tipo de licencia no encontrada" });
        }
        tipoLicencia.NombreTipoLicencia = NombreTipoLicencia || tipoLicencia.NombreTipoLicencia;
        await tipoLicencia.save();
        return res.json({ message: "Tipo de licencia actualizada correctamente", tipoLicencia });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.updateTipoLicencia = updateTipoLicencia;
const deleteTipoLicencia = async (req, res) => {
    try {
        const { id } = req.params;
        const tipoLicencia = await TipoLicencia_1.TipoLicencia.findOneBy({ IdTipoLicencia: id });
        if (!tipoLicencia) {
            return res.status(404).json({ message: "Tipo de licencia no encontrada" });
        }
        // For a soft delete, you might add a 'status' column to TipoLicencia entity
        // For now, this will be a hard delete.
        await tipoLicencia.remove();
        return res.json({ message: "Tipo de licencia eliminada correctamente" });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.deleteTipoLicencia = deleteTipoLicencia;
const verifyTipoLicencia = async ({ TipoLicenciaId }) => {
    const tipoLicencia = await TipoLicencia_1.TipoLicencia.findOneBy({ IdTipoLicencia: TipoLicenciaId });
    if (!tipoLicencia) {
        throw new Error(`El tipo de licencia con ID ${TipoLicenciaId} no existe.`);
    }
    return tipoLicencia;
};
exports.verifyTipoLicencia = verifyTipoLicencia;
