import { Request, Response } from "express";
import { EmpresaReparto } from "../entities/EmpresaReparto";
import { generarIdSecuencial } from '../utils/idGenerator';

export const createEmpresaReparto = async (req: Request, res: Response) => {
    try {
        const { NombreEmpresa } = req.body;

        const nuevoId = await generarIdSecuencial('EMPR');

        const empresaReparto = new EmpresaReparto();
        empresaReparto.IdEmpresaReparto = nuevoId;
        empresaReparto.NombreEmpresa = NombreEmpresa;

        await empresaReparto.save();

        return res.status(201).json({ message: "Empresa de reparto creada correctamente", empresaReparto });

    } catch (error) {
        if (error instanceof Error) {
            console.error("Error al crear empresa de reparto:", error);
            return res.status(500).json({ message: error.message });
        }
    }
};

export const getEmpresaRepartos = async (req: Request, res: Response) => {
    try {
        const empresasReparto = await EmpresaReparto.find();
        return res.json(empresasReparto);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const getEmpresaReparto = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const empresaReparto = await EmpresaReparto.findOneBy({ IdEmpresaReparto: id });

        if (!empresaReparto) {
            return res.status(404).json({ message: "Empresa de reparto no encontrada" });
        }
        return res.json(empresaReparto);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const updateEmpresaReparto = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { NombreEmpresa } = req.body;

        const empresaReparto = await EmpresaReparto.findOneBy({ IdEmpresaReparto: id });

        if (!empresaReparto) {
            return res.status(404).json({ message: "Empresa de reparto no encontrada" });
        }

        empresaReparto.NombreEmpresa = NombreEmpresa || empresaReparto.NombreEmpresa;

        await empresaReparto.save();

        return res.json({ message: "Empresa de reparto actualizada correctamente", empresaReparto });

    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const deleteEmpresaReparto = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const empresaReparto = await EmpresaReparto.findOneBy({ IdEmpresaReparto: id });

        if (!empresaReparto) {
            return res.status(404).json({ message: "Empresa de reparto no encontrada" });
        }

        // For a soft delete, you might add a 'status' column to EmpresaReparto entity
        // For now, this will be a hard delete.
        await empresaReparto.remove();

        return res.json({ message: "Empresa de reparto eliminada correctamente" });

    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const verifyEmpresaReparto = async ({ EmpresaRepartoId }: { EmpresaRepartoId: string }) => {
    const empresaReparto = await EmpresaReparto.findOneBy({ IdEmpresaReparto: EmpresaRepartoId });
    if (!empresaReparto) {
        throw new Error(`La empresa de reparto con ID ${EmpresaRepartoId} no existe.`);
    }
    return empresaReparto;
};