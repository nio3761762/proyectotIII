import { Request, Response } from "express";
import { Estado } from "../entities/Estado";



export const verifyEstado = async ({ EstadoId }: { EstadoId: number }) => {

    const existEstado = await Estado.findOne({ where: { IdEstado: EstadoId } });
    
    
   if (!existEstado) {
    throw new Error(`El estado con ID ${existEstado} no existe.`);
  }
  
    return existEstado;
};