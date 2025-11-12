import { Enlace } from "../entities/Enlace";
import { HttpError } from "../utils/error.handler";
import { generarIdSecuencial } from "../utils/idGenerator";

export const createEnlace= async ({archivo }: {  archivo:string }) => {

   const nuevoId = await generarIdSecuencial('EN');

    const existEnlace= new Enlace();
   existEnlace.IdEnlace = nuevoId;
   existEnlace.Enlace = archivo ;
   
   await existEnlace.save();

    return existEnlace;
};
