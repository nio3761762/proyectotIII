import { Request, Response } from "express";

import { Celular } from "../entities/Celular";
import { Persona } from "../entities/Persona";
import { verifyPersona } from "./Persona.controllers";
import { generarIdSecuencial } from "../utils/idGenerator";
import { verifyEstado } from "./Estado.controllers";
import { HttpError } from "../utils/error.handler";

export const createCelular = async ({  Numero,PersonaId }: {  Numero: string,PersonaId:string }) => {
  

  const nuevoId = await generarIdSecuencial('CEL'); 


    const nuevo= new Celular();
    nuevo.IdCelular = nuevoId;
    nuevo.Numero = Numero;
    nuevo.Persona = await verifyPersona({PersonaId:PersonaId});
    nuevo.Estado = await verifyEstado({EstadoId:1});
    await nuevo.save();

    return nuevo;
};

export const updateCelular = async ({ CelularId, Numero,PersonaId }: { CelularId: string, Numero: string,PersonaId:string}) => {

  if(CelularId){
const existCelular = await verifyCelular({ CelularId:CelularId });
    
    existCelular.Numero= Numero;
    existCelular.Persona= await verifyPersona({PersonaId:PersonaId});
    
    await existCelular.save();

    return existCelular;
  }  else
    return await createCelular({Numero:Numero,PersonaId:PersonaId});
  
};



export const verifyCelular = async ({ CelularId }: { CelularId: string }) => {
    const existCelular = await Celular.findOne({ where: { IdCelular: CelularId } });
   if (!existCelular) {
    throw new HttpError(404,`El celular con ID ${existCelular} no existe.`);
  }
    return existCelular;
};


export const getCelular = async (req: Request, res: Response) => {
    try {

        const complemento = await Celular.find({});
        
        return res.json(complemento)
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message })
        }
    }
}