import { Request, Response } from "express";
import { HttpError } from "../utils/error.handler";
import { Tipopedido } from "../entities/TipoPedido";

export const getTipopedido = async (req: Request, res: Response) => {
    try {
        const Tipopromocions = await Tipopedido.find();
        return res.json(Tipopromocions);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const verifyTipoPedido = async ({ tipo }: { tipo: string }) => {

    const existVenta = await Tipopedido.findOne({ where: { IdTipoPedido: tipo } });
    
    
   if (!existVenta) {
    throw new HttpError(404,`El Metodo Venta con ID ${tipo} no existe.`);
  }
  
    return existVenta;
};