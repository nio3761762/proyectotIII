import { Request, Response } from "express";
import { Tipopromocion } from "../entities/Tipopromocion";
import { HttpError } from "../utils/error.handler";
import { AppDataSource } from "../db";

export const getTipopromocions = async (req: Request, res: Response) => {
    try {
         const result = await AppDataSource.query(`
              SELECT 
                 tp.idtipopromocion,
                 tp.nombre
              FROM tipopromocion tp;
            `);
        
            return res.json({result});
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