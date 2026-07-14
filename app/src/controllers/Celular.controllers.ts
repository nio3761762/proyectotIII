import { Request, Response } from "express";
import { Celular } from "../entities/Celular";
import { verifyPersona } from "./Persona.controllers";
import { generarIdSecuencial } from "../utils/idGenerator";
import { HttpError } from "../utils/error.handler";
import { AppDataSource } from "../db";

export const createCelular = async ({  Numero,PersonaId }: {  Numero: string,PersonaId:string }) => {
  

  const nuevoId = await generarIdSecuencial('CEL'); 


    const nuevo= new Celular();
    nuevo.IdCelular = nuevoId;
    nuevo.Numero = Numero;
    nuevo.Persona = await verifyPersona({PersonaId:PersonaId});
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
         const result = await AppDataSource.query(`
             SELECT p.numero
             FROM celular p;
           `);
       
           return res.json(result); // ya es un array de objetos
       
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message })
        }
    }
}