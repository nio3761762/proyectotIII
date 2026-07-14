import { Request, Response } from "express";
import { Metodopago } from "../entities/MetodoPago";
import { HttpError } from "../utils/error.handler";

export const verifyMetodoPago = async ({ MetodoPagoId }: { MetodoPagoId: number }) => {

    const existMetodoPago = await Metodopago.findOne({ where: { IdMetodoPago: MetodoPagoId } });
    
    
   if (!existMetodoPago) {
    throw new HttpError(404,`El Metodo Pago con ID ${MetodoPagoId} no existe.`);
  }
  
    return existMetodoPago;
};