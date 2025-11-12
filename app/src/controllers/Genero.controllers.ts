import { Request, Response } from "express";
import { Genero } from "../entities/Genero";



export const verifyGenero = async ({ GeneroId }: { GeneroId : number }) => {

    const existGenero = await Genero.findOne({ where: { IdGenero: GeneroId } });
    
    
   if (!existGenero) {
    throw new Error(`El genero con ID ${existGenero} no existe.`);
  }
  
    return existGenero;
};