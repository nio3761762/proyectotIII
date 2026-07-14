import { Request, Response } from "express";
import { Pago } from "../entities/Pago";
import { HttpError } from "../utils/error.handler";
import { verifyMetodoPago } from "./MetodoPago.controllers";
import { verifyVenta } from "./Venta.controllers";
import { generarIdSecuencial } from "../utils/idGenerator";
import { Metodopago } from "../entities/MetodoPago";
import { Venta } from "../entities/Venta";
import { AppDataSource } from "../db";
import { getFechaHoraBolivia } from "../utils/Fecha";
import { QueryRunner } from "typeorm";
import { Pedido } from "../entities/Pedido";
const { fecha, hora } = getFechaHoraBolivia();
export const getPagos = async (req: Request, res: Response) => {
    try {
        const Pagos = await Metodopago.find();
        return res.json(Pagos);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};


export const getPagosVenta = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const Pagos = await Pago.find({
      where: { Venta: { IdVenta: id } },
      relations: ["Metodopago"],
    });

    // Mapear cada pago en un objeto más claro
    const pagosMapped = Pagos.map(p => ({
      Metodopago: p.Metodopago?.IdMetodoPago,
      Nombre: p.Metodopago?.Nombre,
      Cambio: p.Cambio,
      Monto: p.Monto,
      IdPago: p.IdPago,
    })) || [];

    return res.json(pagosMapped);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};



export const verifyPago = async ({ PagoId }: { PagoId: string }) => {

    const existPago = await Pago.findOne({ where: { IdPago: PagoId } });
    
    
   if (!existPago) {
    throw new HttpError(404,`El Metodo Pago con ID ${PagoId} no existe.`);
  }
  
    return existPago;
};


export const createPago = async (
  queryRunner: QueryRunner,
 venta:Venta | null,
  Monto: number,
  Cambio: number,
  IdMetodoPago: number,
  pedido?: Pedido | null
) => {
 
  const nuevoId = await generarIdSecuencial('PA'); 
  const nuevoPago = new Pago();
  nuevoPago.IdPago = nuevoId;
  nuevoPago.FechaPago = fecha;
  nuevoPago.HoraPago = hora;
  nuevoPago.Metodopago = await verifyMetodoPago({MetodoPagoId:IdMetodoPago});
  if(venta) nuevoPago.Venta = venta;
  nuevoPago.Monto = Monto;
  nuevoPago.Cambio = Cambio;
  if(pedido) nuevoPago.Pedido = pedido;

  await queryRunner.manager.save(nuevoPago);

};

export const createPagoPedido = async (
  queryRunner: QueryRunner,
  pedido: Pedido,
  Monto: number,
  Cambio: number,
  IdMetodoPago: number,
) => {
  const nuevoId = await generarIdSecuencial('PA'); 
  const nuevoPago = new Pago();
  nuevoPago.IdPago = nuevoId;
  nuevoPago.FechaPago = fecha;
  nuevoPago.HoraPago = hora;
  nuevoPago.Metodopago = await verifyMetodoPago({MetodoPagoId:IdMetodoPago});
  nuevoPago.Pedido = pedido;
  nuevoPago.Monto = Monto;
  nuevoPago.Cambio = Cambio; 

  await queryRunner.manager.save(nuevoPago);
};


export const updatePago = async ({
  IdVenta, IdPago, Monto, Cambio, IdMetodoPago
}: {
  IdVenta: string;
  IdPago: string;
  Monto: number;
  Cambio: number;
  IdMetodoPago: number;
}) => {
  
const exitPago = await verifyPago({PagoId:IdPago})
 

  exitPago.FechaPago = new Date();
  exitPago.Metodopago = await verifyMetodoPago({MetodoPagoId:IdMetodoPago});
  // exitPago.Venta = await verifyVenta({VentaId:IdVenta});
  exitPago.Monto = Monto,
  exitPago.Cambio =Cambio, 
  await exitPago.save();

  return exitPago;
};


export const getVentas = async ( req:Request, res:Response) =>{
    try {
       const { id } = req.params;
        const pagos = await Pago.findOne({
            where:{Venta:{IdVenta:id}},
             relations: 
          [
            "Metodopago",
            ]});
        return res.json(pagos)    
    } catch (error) {
        if(error instanceof Error){
            return res.status(500).json({message: error.message})
        }
    }
}