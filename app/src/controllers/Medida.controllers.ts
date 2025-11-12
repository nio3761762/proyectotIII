import { Request, Response } from "express";
import { Estado } from "../entities/Estado";
import { Unidadmedida } from "../entities/UnidadMedida";
import { verifyEstado } from "./Estado.controllers";
import { HttpError } from "../utils/error.handler";
import { verifyCategoriaMedida } from "./CategoriaMedida.controllers";

export const createMediada = async ({ Nombre, Cantidad, Abreviatura, estado, IdCategoria }:{ Nombre:string, Cantidad:number, Abreviatura:string, estado: number, IdCategoria:string }) => {
  
    const result = await Unidadmedida.createQueryBuilder("Unidadmedida")
      .select("MAX(Unidadmedida.IdUnidadMedida)", "maxId")
      .getRawOne();

    const nuevoId = (result.maxId || 0) + 1;

    const unidadmedida = new Unidadmedida();

    unidadmedida.IdUnidadMedida = nuevoId;
    unidadmedida.Nombre=Nombre;
    unidadmedida.Cantidad=Cantidad;
    unidadmedida.Abreviatura=Abreviatura;
    unidadmedida.FechaRegistro=new Date();
    unidadmedida.Estado = await verifyEstado({EstadoId:estado});
    unidadmedida.Categoria = await verifyCategoriaMedida({UnidadMedidaId:IdCategoria})
    
    
    await unidadmedida.save();

    return unidadmedida

};

export const updateMediada = async ({ Idmedida,Nombre, Cantidad, Abreviatura, estado,IdCategoria }:{ Idmedida:number,Nombre:string, Cantidad:number, Abreviatura:string, estado: number,IdCategoria:string }) => {
    if(!Idmedida){
 return createMediada({Nombre:Nombre, Cantidad:Cantidad, Abreviatura:Abreviatura, estado:estado, IdCategoria:IdCategoria})
    }
    
    const unidadmedida = await verifyUnidadMedida({UnidadMedidaId:Idmedida});

    unidadmedida.Nombre=Nombre;
    unidadmedida.Cantidad=Cantidad;
    unidadmedida.Abreviatura=Abreviatura;
    unidadmedida.Estado = await verifyEstado({EstadoId:estado});
    
    
    await unidadmedida.save();

    return unidadmedida

};


export const createUnidadMedida = async (req: Request, res: Response) => {
  try {
    const { RegistroUnidadmedida } = req.body;

    const estado = await Estado.findOneBy({ IdEstado: 1 });

    if (!estado) return res.status(404).json({ message: "Estado no encontrado" });

    const result = await Unidadmedida.createQueryBuilder("Unidadmedida")
      .select("MAX(Unidadmedida.IdUnidadMedida)", "maxId")
      .getRawOne();

    const nuevoId = (result.maxId || 0) + 1;

    const unidadmedida = new Unidadmedida();

    unidadmedida.IdUnidadMedida = nuevoId;
    unidadmedida.Nombre=RegistroUnidadmedida.Nombre;
    unidadmedida.Cantidad=RegistroUnidadmedida.Cantidad;
    unidadmedida.Abreviatura=RegistroUnidadmedida.Abreviatura;
    unidadmedida.FechaRegistro=new Date();
    unidadmedida.Estado = estado;
    
    
    await unidadmedida.save();

    return res.json({ message: `La Medida ${RegistroUnidadmedida.Nombre} no existe.`});
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const deleteUnidadMedida = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const unidadmedida = await Unidadmedida.findOne({
      where: { IdUnidadMedida: Number(id)  },
      relations: ['Estado']
    });

    if (!unidadmedida) {
      return res.status(404).json({ message: "Unidad de medida no encontrado" });
    }
    
    const esActivo = unidadmedida.Estado?.IdEstado === 1;
    const nuevoEstadoId = esActivo ? 2 : 1; 
    const mensajeAccion = esActivo ? 'eliminaron' : 'habilitaron';

    const nuevoEstado = await verifyEstado({ EstadoId: nuevoEstadoId });

    if (!nuevoEstado) {
      return res.status(500).json({ message: "No se pudo obtener el estado requerido." });
    }

    unidadmedida.Estado = nuevoEstado;
    await unidadmedida.save();

    return res.json({ message: `Se ${mensajeAccion} los datos de la  Unidad de medida correctamente` });

  } catch (error) {
    console.error("Error al cambiar el estado del Unidadmedida:", error);
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const getUnidadMedidas = async (req: Request, res: Response) => {
  try {
    const Unidadmedidas = await Unidadmedida.find({
      relations: ['Estado']
    });
    return res.json(Unidadmedidas);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const getUnidadMedida = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const unidadmedida = await Unidadmedida.findOne({
        where: { IdUnidadMedida: Number(id) },
        relations: ['Estado']
    });

    if (!unidadmedida) return res.status(404).json({ message: "Unidad de medida no encontrado" });

    return res.json(unidadmedida);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const updateUnidadMedida = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { RegistroUnidadmedida } = req.body;

    const unidadmedida = await Unidadmedida.findOneBy({ IdUnidadMedida: Number(id) });

    if (!unidadmedida) return res.status(404).json({ message: "Unidadmedida no encontrado" });
    
   if(RegistroUnidadmedida.Nombre) unidadmedida.Nombre=RegistroUnidadmedida.Nombre;
   if(RegistroUnidadmedida.Cantidad) unidadmedida.Cantidad=RegistroUnidadmedida.Cantidad;
   if(RegistroUnidadmedida.Abreviatura) unidadmedida.Abreviatura=RegistroUnidadmedida.Abreviatura;


    await unidadmedida.save();

    return res.json({ message: `La Medida ${RegistroUnidadmedida.Nombre} se actualizo correctamente.` });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const verifyUnidadMedida = async ({ UnidadMedidaId }: { UnidadMedidaId: number }) => {

  const existUnidadMedida = await Unidadmedida.findOne({ where: { IdUnidadMedida: UnidadMedidaId } });
  if (!existUnidadMedida) {
    throw new HttpError(404, `El UnidadMedida con ID ${UnidadMedidaId} no existe.`);
  }

  return existUnidadMedida;
};