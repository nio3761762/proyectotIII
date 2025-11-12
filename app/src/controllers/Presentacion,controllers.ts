import { Request, Response } from "express";
import { HttpError } from "../utils/error.handler";
import { generarIdSecuencial } from "../utils/idGenerator";
import { Presentacion } from "../entities/Presentacion";
import { verifyEstado } from "./Estado.controllers";

export const AddPresentacion = async (req: Request, res: Response) => {
    try {
        const {Nombre} = req.body;
        
        const nuevo = new Presentacion();
        
        const nuevoId = await generarIdSecuencial('PREN');
        nuevo.IdPresentacion = nuevoId;
        nuevo.Nombre =Nombre;
        nuevo.Estado = await verifyEstado({EstadoId:1});
        nuevo.FechaRegistro = new Date();
        
        await nuevo.save();
 
        return res.json({message:"Se registro la presentacion"});
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};


export const updatePresentacion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {Nombre} = req.body;
        
         const existe = await Presentacion.findOne({
          
          where:{ IdPresentacion:id},
          });

        if(!existe)
            return res.status(404).json({ message: "La presentacion no se encuentra registrada" });
        
        existe.Nombre = Nombre;
        existe.FechaActualizacion = new Date();
        
        await existe.save();

        return res.json({message:"Se actualizo la presentacion"});
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const verifyPresentacion = async ({ PresentacionId }: { PresentacionId: string }) => {

    const exist = await Presentacion.findOne({ where: { IdPresentacion: PresentacionId } });
    
    
   if (!exist) {
    throw new HttpError(404,`La presentacion con ID ${PresentacionId} no existe.`);
  }
  
    return exist;
};


export const getPresentacionEstaoo = async (req: Request, res: Response) => {
    try {
        const presentacion = await Presentacion.find({
          where:{Estado:{IdEstado:1}},
        });

        const resultado = presentacion.map(p => ({
            ...p,
            Estado: p.Estado?.IdEstado
        }));

        return res.json(resultado);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};


export const getPresentacion = async (req: Request, res: Response) => {
    try {
        const presentacion = await Presentacion.find({
            relations: ['Estado']
        });

        const resultado = presentacion.map(p => ({
            ...p,
            Estado: p.Estado?.IdEstado
        }));

        return res.json(resultado);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const getpresentacion = async ( req:Request, res:Response) =>{
    try {
       const {id}  = req.body;
        const presentacion = await Presentacion.findOne({ 
               where:{IdPresentacion:id},
                relations:['Estado']})

    if (!presentacion) {
      return res.status(404).json({ message: "presentacion no encontrado" });
    }
      return res.json(presentacion)    
    } catch (error) {
        if(error instanceof Error){
            return res.status(500).json({message: error.message})
        }
    }
}

export const deletePresentacion= async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const presentacion = await Presentacion.findOne({
      where: { IdPresentacion: id },
      relations: ['Estado']
    });

    if (!presentacion) {
      return res.status(404).json({ message: "presentacion no encontrado" });
    }
    
    const esActivo = presentacion.Estado?.IdEstado === 1;
    const nuevoEstadoId = esActivo ? 2 : 1; 
    const mensajeAccion = esActivo ? 'eliminaron' : 'habilitaron';

    const nuevoEstado = await verifyEstado({ EstadoId: nuevoEstadoId });

    if (!nuevoEstado) {
      return res.status(500).json({ message: "No se pudo obtener el estado requerido." });
    }

    presentacion.Estado = nuevoEstado;
    await presentacion.save();

    return res.json({ message: `Se ${mensajeAccion} los datos de la presentacion correctamente` });

  } catch (error) {
    console.error("Error al cambiar el estado del usuario:", error);
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};