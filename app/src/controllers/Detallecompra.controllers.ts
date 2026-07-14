import { Request, Response } from "express";
import { generarIdSecuencial } from "../utils/idGenerator";
import { HttpError } from "../utils/error.handler";
import { Detallecompra } from "../entities/DetalleCompra";
import { verifyProductoMedida } from "./ProductoMedida.controllers";
import { verifyCompra } from "./Compra.controllers";
import { verifyInsumoMedida } from "./Insumomedida.controllers";
import { parseFechaLocal } from "../utils/Fecha";
import { QueryRunner } from "typeorm";
import { Compra } from "../entities/Compra";


export const createDetalleCompra = async (
   queryRunner: QueryRunner,
  compra: Compra,
  Cantidad: number,
  IdMedida: string,
  Precio: number,
  Fecha: string
) => {

  const nuevoId = await generarIdSecuencial('DTC');

  const detalle = new Detallecompra();
  detalle.IdDetalleCompra = nuevoId;
  detalle.Cantidad = Cantidad;
  const insumoMedida = await verifyInsumoMedida({ PaqueteId: IdMedida });

  if (!insumoMedida) {
    throw new Error("InsumoMedida no encontrada");
  }
  detalle.Insumomedida = insumoMedida;
  detalle.Insumo = insumoMedida.Insumo;
  detalle.Compra = compra;
  detalle.Precio = Precio;
  detalle.PrecioTotal = Cantidad * Precio;
  detalle.FechaVencimineto =parseFechaLocal(Fecha);

    await queryRunner.manager.save(detalle);
  
};


export const verifyDetalleCompra = async ({ PaqueteId }: { PaqueteId: string }) => {
  const existPaquete = await Detallecompra.findOne({
    where: { IdDetalleCompra: PaqueteId },
    relations: ["Insumomedida", "Insumomedida.Producto"]
  });

  if (!existPaquete) {
    throw new HttpError(404, `El detalle de la compra con ID ${PaqueteId} no existe.`);
  }

  return existPaquete;
};

