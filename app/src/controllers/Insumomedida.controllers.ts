import { Request, Response } from "express";
import { Insumomedida } from "../entities/InsumoMedida";
import { generarIdSecuencial } from "../utils/idGenerator";
import { verifyInsumo } from "./Insumo.controllers";
import { verifyUnidadMedida } from "./Medida.controllers";
import { HttpError } from "../utils/error.handler";
import { AppDataSource } from "../db";



export const getInsumoInMedida = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await AppDataSource.query(`
      SELECT 
        im.idinsumomedida,
        im.fecharegistro,
        im.cantidad AS cantidadmedida,

        um.idunidadmedida,
        um.nombre AS unidad_nombre,
        um.cantidad, 
        um.abreviatura,

        cat.idcategoriamedida,
        cat.nombre AS categoria_nombre

      FROM insumomedida im

      INNER JOIN unidadmedida um 
        ON im.idunidadmedida = um.idunidadmedida

      INNER JOIN categoriamedida cat 
        ON um.idcategoriamedida = cat.idcategoriamedida

      WHERE im.idinsumo = $1
    `, [id]);

    if (!result.length) {
      return res.status(404).json({ message: "No se encontraron medidas para este insumo." });
    }

    return res.json(result);

  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};



export const updateInsumoMedida = async (
  IdProductomedida:string,
  IdProducto:string,
  IdUnidadMedida:number,
  Cantidad:number,
  Estado:number
) => {

  if (IdProductomedida) {
    const nuevoPaquete = await verifyInsumoMedida({ PaqueteId: IdProductomedida });
    nuevoPaquete.Cantidad = Cantidad || 0;
    nuevoPaquete.Insumo = await verifyInsumo({ ProductoId: IdProducto });
    nuevoPaquete.Unidadmedida = await verifyUnidadMedida({ UnidadMedidaId: IdUnidadMedida });
    nuevoPaquete.FechaActualizacion = new Date();
    nuevoPaquete.Estado= Estado
    await nuevoPaquete.save();

    return nuevoPaquete;
  }

  return createInsumoMedida(IdProducto, IdUnidadMedida,  Cantidad)
};
export const createInsumoMedida = async (
  IdProducto:string,
  IdUnidadMedida:number,
  Cantidad:number,
) => {
  const nuevoId = await generarIdSecuencial('ISM');

  const nuevoPaquete = new Insumomedida();
  nuevoPaquete.IdinsumoMedida = nuevoId;
  nuevoPaquete.Cantidad = Cantidad || 0;
  nuevoPaquete.Insumo = await verifyInsumo({ ProductoId: IdProducto });
  nuevoPaquete.Unidadmedida = await verifyUnidadMedida({ UnidadMedidaId: IdUnidadMedida });
  nuevoPaquete.FechaRegistro = new Date();
  await nuevoPaquete.save();

  return nuevoPaquete;
};

export const verifyInsumoMedida = async ({ PaqueteId }: { PaqueteId: string }) => {
  const existPaquete = await Insumomedida.findOne({
    where: { IdinsumoMedida: PaqueteId },
    relations: ["Insumo", "Unidadmedida"]
  });
if (!existPaquete) {
    throw new HttpError(404, `La medida con ID ${PaqueteId} no existe.`);
  }

  return existPaquete;
}; 