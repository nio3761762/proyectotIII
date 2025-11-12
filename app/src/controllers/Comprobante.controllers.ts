import { HttpError } from "../utils/error.handler";
import { Comprobante } from "../entities/Comprobante";
import { Request, Response } from "express";



export const verifyComprobante = async ({ TipoId }: { TipoId: string }) => {

    const existComprobante = await Comprobante.findOne({ where: { IdComprobante: TipoId } });

    if (!existComprobante) {
        throw new HttpError(404, `El comprobante con ID ${TipoId} no existe.`);
    }

    return existComprobante;
};

export const getComprobante = async (req: Request, res: Response) => {
    try {

        const comprobante = await Comprobante.find();
        
        return res.json(comprobante)
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message })
        }
    }
}