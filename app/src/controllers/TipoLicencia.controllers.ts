import { Request, Response } from "express";
import { TipoLicencia } from "../entities/TipoLicencia";
import { generarIdSecuencial } from '../utils/idGenerator';

export const createTipoLicencia = async (req: Request, res: Response) => {
    try {
        const { NombreTipoLicencia } = req.body;

        const nuevoId = await generarIdSecuencial('LIC');

        const tipoLicencia = new TipoLicencia();
        tipoLicencia.IdTipoLicencia = nuevoId;
        tipoLicencia.NombreTipoLicencia = NombreTipoLicencia;

        await tipoLicencia.save();

        return res.status(201).json({ message: "Tipo de licencia creado correctamente", tipoLicencia });

    } catch (error) {
        if (error instanceof Error) {
            console.error("Error al crear tipo de licencia:", error);
            return res.status(500).json({ message: error.message });
        }
    }
};

export const getTipoLicencias = async (req: Request, res: Response) => {
    try {
        const tiposLicencia = await TipoLicencia.find();
        return res.json(tiposLicencia);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const getTipoLicencia = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const tipoLicencia = await TipoLicencia.findOneBy({ IdTipoLicencia: id });

        if (!tipoLicencia) {
            return res.status(404).json({ message: "Tipo de licencia no encontrada" });
        }
        return res.json(tipoLicencia);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const updateTipoLicencia = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { NombreTipoLicencia } = req.body;

        const tipoLicencia = await TipoLicencia.findOneBy({ IdTipoLicencia: id });

        if (!tipoLicencia) {
            return res.status(404).json({ message: "Tipo de licencia no encontrada" });
        }

        tipoLicencia.NombreTipoLicencia = NombreTipoLicencia || tipoLicencia.NombreTipoLicencia;

        await tipoLicencia.save();

        return res.json({ message: "Tipo de licencia actualizada correctamente", tipoLicencia });

    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const deleteTipoLicencia = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const tipoLicencia = await TipoLicencia.findOneBy({ IdTipoLicencia: id });

        if (!tipoLicencia) {
            return res.status(404).json({ message: "Tipo de licencia no encontrada" });
        }

        // For a soft delete, you might add a 'status' column to TipoLicencia entity
        // For now, this will be a hard delete.
        await tipoLicencia.remove();

        return res.json({ message: "Tipo de licencia eliminada correctamente" });

    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const verifyTipoLicencia = async ({ TipoLicenciaId }: { TipoLicenciaId: string }) => {
    const tipoLicencia = await TipoLicencia.findOneBy({ IdTipoLicencia: TipoLicenciaId });
    if (!tipoLicencia) {
        throw new Error(`El tipo de licencia con ID ${TipoLicenciaId} no existe.`);
    }
    return tipoLicencia;
};