import { Request, Response } from "express";
import { Tipoproveedor } from "../entities/TipoProveedor";
import { HttpError } from "../utils/error.handler";
import { AppDataSource } from "../db";


export const getTipoproveedor = async (req: Request, res: Response) => {
    try {
              const result = await AppDataSource.query(`
      SELECT COALESCE(
        json_agg(
          json_build_object(
            'idtipoproveedor', b.idtipoproveedor,
            'nombre', b.nombre
          )
        ),
        '[]'::json
      ) AS tipoproveedors
      FROM Tipoproveedor b;
    `);

    return res.json(result[0].tipoproveedors);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const verifyTipoproveedor = async ({ TipoproveedorId }: { TipoproveedorId: number }) => {

    const existTipoproveedor = await Tipoproveedor.findOne({ where: { IdTipoProveedor: TipoproveedorId } });
    
    
   if (!existTipoproveedor) {
    throw new HttpError(404,`El Tipoproveedor con ID ${TipoproveedorId} no existe.`);
  }
  
    return existTipoproveedor;
};