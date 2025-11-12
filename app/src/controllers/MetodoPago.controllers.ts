import { Request, Response } from "express";
import { Metodopago } from "../entities/MetodoPago";
import { HttpError } from "../utils/error.handler";
export const getMetodoPagos = async (req: Request, res: Response) => {
    try {
        const MetodoPagos = await Metodopago.find({});
        return res.json(MetodoPagos);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const verifyMetodoPago = async ({ MetodoPagoId }: { MetodoPagoId: number }) => {

    const existMetodoPago = await Metodopago.findOne({ where: { IdMetodoPago: MetodoPagoId } });
    
    
   if (!existMetodoPago) {
    throw new HttpError(404,`El Metodo Pago con ID ${MetodoPagoId} no existe.`);
  }
  
    return existMetodoPago;
};