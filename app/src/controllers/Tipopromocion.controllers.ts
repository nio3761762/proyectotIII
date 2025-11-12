import { Request, Response } from "express";
import { Tipopromocion } from "../entities/Tipopromocion";
import { HttpError } from "../utils/error.handler";

export const getTipopromocions = async (req: Request, res: Response) => {
    try {
        const Tipopromocions = await Tipopromocion.find();
        return res.json(Tipopromocions);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const verifyTipoPromocion = async ({ PromocionId }: { PromocionId: number }) => {

    const existtipo = await Tipopromocion.findOne({ where: { IdTipoPromocion: PromocionId } });
    
    
   if (!existtipo) {
    throw new HttpError(404,`El tipo de promocion con ID ${PromocionId} no existe.`);
  }
  
    return existtipo;
};