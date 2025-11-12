"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmpresaReparto = exports.deleteEmpresaReparto = exports.updateEmpresaReparto = exports.getEmpresaReparto = exports.getEmpresaRepartos = exports.createEmpresaReparto = void 0;
const EmpresaReparto_1 = require("../entities/EmpresaReparto");
const idGenerator_1 = require("../utils/idGenerator");
const createEmpresaReparto = async (req, res) => {
    try {
        const { NombreEmpresa } = req.body;
        const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('EMPR');
        const empresaReparto = new EmpresaReparto_1.EmpresaReparto();
        empresaReparto.IdEmpresaReparto = nuevoId;
        empresaReparto.NombreEmpresa = NombreEmpresa;
        await empresaReparto.save();
        return res.status(201).json({ message: "Empresa de reparto creada correctamente", empresaReparto });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error al crear empresa de reparto:", error);
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.createEmpresaReparto = createEmpresaReparto;
const getEmpresaRepartos = async (req, res) => {
    try {
        const empresasReparto = await EmpresaReparto_1.EmpresaReparto.find();
        return res.json(empresasReparto);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getEmpresaRepartos = getEmpresaRepartos;
const getEmpresaReparto = async (req, res) => {
    try {
        const { id } = req.params;
        const empresaReparto = await EmpresaReparto_1.EmpresaReparto.findOneBy({ IdEmpresaReparto: id });
        if (!empresaReparto) {
            return res.status(404).json({ message: "Empresa de reparto no encontrada" });
        }
        return res.json(empresaReparto);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getEmpresaReparto = getEmpresaReparto;
const updateEmpresaReparto = async (req, res) => {
    try {
        const { id } = req.params;
        const { NombreEmpresa } = req.body;
        const empresaReparto = await EmpresaReparto_1.EmpresaReparto.findOneBy({ IdEmpresaReparto: id });
        if (!empresaReparto) {
            return res.status(404).json({ message: "Empresa de reparto no encontrada" });
        }
        empresaReparto.NombreEmpresa = NombreEmpresa || empresaReparto.NombreEmpresa;
        await empresaReparto.save();
        return res.json({ message: "Empresa de reparto actualizada correctamente", empresaReparto });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.updateEmpresaReparto = updateEmpresaReparto;
const deleteEmpresaReparto = async (req, res) => {
    try {
        const { id } = req.params;
        const empresaReparto = await EmpresaReparto_1.EmpresaReparto.findOneBy({ IdEmpresaReparto: id });
        if (!empresaReparto) {
            return res.status(404).json({ message: "Empresa de reparto no encontrada" });
        }
        // For a soft delete, you might add a 'status' column to EmpresaReparto entity
        // For now, this will be a hard delete.
        await empresaReparto.remove();
        return res.json({ message: "Empresa de reparto eliminada correctamente" });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.deleteEmpresaReparto = deleteEmpresaReparto;
const verifyEmpresaReparto = async ({ EmpresaRepartoId }) => {
    const empresaReparto = await EmpresaReparto_1.EmpresaReparto.findOneBy({ IdEmpresaReparto: EmpresaRepartoId });
    if (!empresaReparto) {
        throw new Error(`La empresa de reparto con ID ${EmpresaRepartoId} no existe.`);
    }
    return empresaReparto;
};
exports.verifyEmpresaReparto = verifyEmpresaReparto;
