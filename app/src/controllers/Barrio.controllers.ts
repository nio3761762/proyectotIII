import { Request, Response } from "express";
import { Barrio } from "../entities/Barrio";
import { Ciudad } from "../entities/Ciudad";
import { Distribucion } from "../entities/Distribucion";
import { Distritos } from "../entities/Distritos";
import { Departamento } from "../entities/Departamento";

export const getBarrios = async ( req:Request, res:Response) =>{
    try {
      
        const barrios = await Barrio.find();
        return res.json(barrios)    
    } catch (error) {
        if(error instanceof Error){
            return res.status(500).json({message: error.message})
        }
    }
}

export const verifyBarrio = async ({ BarrioId }: { BarrioId: string }) => {
    const existBarrio = await Barrio.findOne({ where: { IdBarrio: BarrioId } });
   if (!existBarrio) {
    throw new Error(`El Barrio con ID ${existBarrio} no existe.`);
  }
    return existBarrio;
};

export const getDepartamento = async ( req:Request, res:Response) =>{
    try {
      
        const barrios = await Departamento.find();
        return res.json(barrios)    
    } catch (error) {
        if(error instanceof Error){
            return res.status(500).json({message: error.message})
        }
    }
}



export const getCiudad = async ( req:Request, res:Response) =>{
    try {
      const { id } = req.params;
        const barrios = await Ciudad.find({
            where:{Departamento:{IdDepto:id}}
        });
        return res.json(barrios)    
    } catch (error) {
        if(error instanceof Error){
            return res.status(500).json({message: error.message})
        }
    }
}



export const getDistrito = async ( req:Request, res:Response) =>{
    try {
       const { id } = req.params;
        const barrios = await Distritos.find({
        where:{Ciudad:{IdCiudad:id}}
        });
        return res.json(barrios)    
    } catch (error) {
        if(error instanceof Error){
            return res.status(500).json({message: error.message})
        }
    }
}

export const getBarrio = async ( req:Request, res:Response) =>{
    try {
       const { id } = req.params;
        const barrios = await Barrio.find({
        where:{Distrito:{IdDistrito:id}}
        });
        return res.json(barrios)    
    } catch (error) {
        if(error instanceof Error){
            return res.status(500).json({message: error.message})
        }
    }
}



