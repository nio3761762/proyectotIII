import { Request, Response } from "express"
import { generarIdSecuencial } from "../utils/idGenerator";
import { Factura } from "../entities/Factura";
import { verifyVenta } from "./Venta.controllers";
import { createEnlace } from "./Enlace.controllers";
import { Venta } from "../entities/Venta";
import { AppDataSource } from "../db";
import { getFechaHoraBolivia } from "../utils/Fecha";

export const createFactura = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {

    const { factura } = req.body;

    const { fecha, hora } = getFechaHoraBolivia();

    // Contar facturas del día
    const facturasHoy = await queryRunner.manager.count(Factura, {
      where: {
        FechaEmicion: fecha
      }
    });

    // Generar número secuencial
    const numeroSecuencial = (facturasHoy + 1)
      .toString()
      .padStart(6, "0");

    // YYYYMMDD-0001
   const fechaCompacta = fecha
  .toISOString()
  .split("T")[0]
  .replace(/-/g, "");

const nroFactura = `${fechaCompacta}-${numeroSecuencial}`;

    // Verificar venta
    const venta = await verifyVenta(factura.IdVenta);

    // Crear factura
    const nuevaFactura = queryRunner.manager.create(Factura, {
      IdFactura: await generarIdSecuencial("F#"),
      Venta: venta,
      FechaEmicion: fecha,
      HoraEmicion: hora,
      NitCiFacturacion: factura.documento,
      NombreFacturacion: factura.Cliente,
      Aprobado: "Si",
      NroFactura: nroFactura
    });

    await queryRunner.manager.save(nuevaFactura);

    await queryRunner.commitTransaction();

    return res.status(201).json({
      message: "La factura se registró exitosamente",
      factura: {
        ...nuevaFactura,
        FechaEmicion: nuevaFactura.FechaEmicion
          ? new Date(nuevaFactura.FechaEmicion)
              .toISOString()
              .split("T")[0]
          : null
      }
    });

  } catch (error) {

    await queryRunner.rollbackTransaction();

    console.error("Error al crear factura:", error);

    return res.status(500).json({
      message: (error as Error).message
    });

  } finally {

    await queryRunner.release();

  }
};
export const insertarEnlaceFactura = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { factura } = req.body;
 
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

