import { Request, Response } from "express";
import { Tipodocumento } from "../entities/TipoDocumento";

export const verifyTipodocumento = async ({ TipoDocumentoId }: { TipoDocumentoId: string }) => {

    const existTipodocumento = await Tipodocumento.findOne({ where: { IdTipoDocumento: TipoDocumentoId } });
    
    
   if (!existTipodocumento) {
    throw new Error(`El Tipo de documento con ID ${existTipodocumento} no existe.`);
  }
  
    return existTipodocumento;
};