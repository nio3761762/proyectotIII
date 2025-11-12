import { Request, Response } from "express"
import { generarIdSecuencial } from "../utils/idGenerator";
import { Factura } from "../entities/Factura";
import { verifyVenta } from "./Venta.controllers";
import { createEnlace } from "./Enlace.controllers";
import { Between } from "typeorm";
import { Venta } from "../entities/Venta";


export const createFactura = async (req: Request, res: Response) => {
  try {
    const { factura } = req.body;

    // Fecha y hora actual en Bolivia (UTC-4)
    const ahora = new Date();

    // Formatear fecha (solo YYYY-MM-DD)
    const fechaBoliviaStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/La_Paz",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(ahora);

    // Formatear hora (HH:mm:ss)
    const horaBoliviaStr = new Intl.DateTimeFormat("en-GB", {
      timeZone: "America/La_Paz",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }).format(ahora);

    // Convertir la fecha string a Date (para la BD tipo "date")
    const fechaEmicionDate = new Date(fechaBoliviaStr);

    // Calcular correlativo del día Bolivia
    const [year, month, day] = fechaBoliviaStr.split("-").map(Number);
    const inicioBolivia = new Date(Date.UTC(year, month - 1, day, 4, 0, 0)); // 00:00 Bolivia = 04:00 UTC
    const finBolivia = new Date(Date.UTC(year, month - 1, day + 1, 3, 59, 59, 999));

    const facturasHoy = await Factura.count({
      where: {
        FechaEmicion: Between(inicioBolivia, finBolivia)
      }
    });

    const numeroSecuencial = (facturasHoy + 1).toString().padStart(4, "0");
    const nroFactura = `${fechaBoliviaStr.replace(/-/g, "")}-${numeroSecuencial}`;

    // Crear factura
    const nuevaFactura = new Factura();
    nuevaFactura.Venta = await verifyVenta({ VentaId: factura.IdVenta });
    nuevaFactura.IdFactura = await generarIdSecuencial("F#");
    nuevaFactura.FechaEmicion = fechaEmicionDate; // "2025-09-23"
    nuevaFactura.HoraEmicion = horaBoliviaStr;    // "19:48:42"
    nuevaFactura.Aprobado = "Si";
    nuevaFactura.NroFactura = nroFactura;

    await nuevaFactura.save();

    return res.json({
       message: "La Factura se registró exitosamente",
  nuevaFactura: {
    ...nuevaFactura,
    FechaEmicion: nuevaFactura.FechaEmicion
      ? nuevaFactura.FechaEmicion.toISOString().split("T")[0] // -> "YYYY-MM-DD"
      : null,
    HoraEmicion: nuevaFactura.HoraEmicion // ya tienes "HH:mm:ss"
  }
    });
  } catch (error) {
    console.error("Error al crear factura:", error);
    return res.status(500).json({ message: (error as Error).message });
  }
};

export const insertarEnlaceFactura = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { factura } = req.body;
  console.log(factura, id)
    const facturasHoy = await Factura.findOne({
      where: {
       IdFactura:factura.IdFactura
      } 
    });
    if(!facturasHoy)
      return res.status(404).json({ message: "Factura no encontrada" });
    
    facturasHoy.Enlace = await createEnlace({ archivo: factura.archivo });
   
    await facturasHoy.save();

    return res.json({ message: "Se asigno el enlace exitosamente", facturasHoy });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error al crear factura:", error);
      return res.status(500).json({ message: error.message });
    }
  }
};

export const ObtenerFactura = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
 
    const facturasHoy = await Venta.findOne({
      where: {  IdVenta: id  }
       ,relations:['Persona','Factura.Enlace']
    });
    if(!facturasHoy)
      return res.json(null);

    return res.json(facturasHoy);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error al crear factura:", error);
      return res.status(500).json({ message: error.message });
    }
  }
};

