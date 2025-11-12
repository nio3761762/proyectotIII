import { HttpError } from "../utils/error.handler";
import { Complemento } from "../entities/Complemento";
import { Request, Response } from "express";
import { Documento } from "../entities/Documento";


export const verifyComplemento = async ({ TipoId }: { TipoId: string }) => {

    const existComplemento = await Complemento.findOne({ where: { IdComplemento: TipoId } });

    if (!existComplemento) {
        throw new HttpError(404, `El complemento con ID ${TipoId} no existe.`);
    }

    return existComplemento;
};

export const getComplemento = async (req: Request, res: Response) => {
    try {

        const complemento = await Complemento.find();
        
        return res.json(complemento)
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message })
        }
    }
}

export const getDocumento = async (req: Request, res: Response) => {
    try {

        const complemento = await Documento.find({
            relations:['Tipodocumento']
        });
        
        return res.json(complemento)
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message })
        }
    }
}
