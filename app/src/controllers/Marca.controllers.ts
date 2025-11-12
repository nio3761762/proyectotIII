import { Request, Response } from "express";
import { Marca } from "../entities/Marca";
import { HttpError } from "../utils/error.handler";


export const getMarcas = async (req: Request, res: Response) => {
  try {
    const Marcas = await Marca.find({
    //   relations: ['Estado', 'Marca', 'Unidadmedida', 'TipoMarca', 'Subcategoria', 'Subcategoria.categoria']
    });
    return res.json(Marcas);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const verifyMarca = async ({ Marcaid }: { Marcaid:string }) => {

    const existMarca= await Marca.findOne({ where: { IdMarca: Marcaid} });
    
    
   if (!existMarca) {
     throw new HttpError(404, `El Marca con ID ${Marcaid} no existe.`);
  }
  
    return existMarca;
};
