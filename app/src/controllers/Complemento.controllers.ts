import { HttpError } from "../utils/error.handler";
import { Complemento } from "../entities/Complemento";
import { Request, Response } from "express";
import { AppDataSource } from "../db";


export const verifyComplemento = async ({ TipoId }: { TipoId: string }) => {

    const existComplemento = await Complemento.findOne({ where: { IdComplemento: TipoId } });

    if (!existComplemento) {
        throw new HttpError(404, `El complemento con ID ${TipoId} no existe.`);
    }

    return existComplemento;
};

export const getComplemento = async (req: Request, res: Response) => {
    try {
        const result = await AppDataSource.query(`
      SELECT COALESCE(
        json_agg(
          json_build_object(
            'idcomplemento', b.IdComplemento,
            'nombre', b.Nombre
          )
        ),
        '[]'::json
      ) AS complementos
      FROM Complemento b;
    `);

    return res.json(result[0].complementos);

    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message })
        }
    }
}



export const getDocumento = async (req: Request, res: Response) => {
    try {
      
       const result = await AppDataSource.query(`
      SELECT d.documento
      FROM Documento d;
    `);

    return res.json(result);

    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message })
        }
    }
}
