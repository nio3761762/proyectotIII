import { HttpError } from "../utils/error.handler";
import { Comprobante } from "../entities/Comprobante";
import { Request, Response } from "express";
import { AppDataSource } from "../db";



export const verifyComprobante = async ( TipoId: string ) => {

    const existComprobante = await Comprobante.findOne({ where: { IdComprobante: TipoId } });

    if (!existComprobante) {
        throw new HttpError(404, `El comprobante con ID ${TipoId} no existe.`);
    }

    return existComprobante;
};

export const getComprobante = async (req: Request, res: Response) => {
    try {
 const result = await AppDataSource.query(
      `SELECT 
          c.idcomprobante,
          c.nombre
     FROM comprobante c` );

    return res.json({
       result
    });
    
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message })
        }
    }
}