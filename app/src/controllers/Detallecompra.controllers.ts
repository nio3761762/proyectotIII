import { Request, Response } from "express";
import { Detalleventa } from "../entities/DetalleVenta";
import { verifyPromocion } from "./Promocion.controllers";
import { verifyProducto } from "./Producto.controllers";
import { verifyPaquete } from "./Presentacionproducto.controllers";
import { verifyVenta } from "./Venta.controllers";
import { Sucursal } from "../entities/Sucursal";
import { DecrementPaquete, DecrementProducto, DecrementPromocion, IncrementPaquete, IncrementProducto, IncrementPromocion } from "./SucursalProducto.controllers";
import { generarIdSecuencial } from "../utils/idGenerator";
import { HttpError } from "../utils/error.handler";
import { Detallecompra } from "../entities/DetalleCompra";
import { verifyProductoMedida } from "./ProductoMedida.controllers";
import { verifyCompra } from "./Compra.controllers";


export const createDetalleCompra = async ({ IdCompra, Cantidad, IdMedida, Descripcion, Precio, Fecha }: { IdCompra: string, Cantidad: number, IdMedida: string, Descripcion: string, Precio: number, Fecha:string }) => {

    const nuevoId = await generarIdSecuencial('DTC');

    const nuevoDetalleventa = new Detallecompra()

    nuevoDetalleventa.IdDetalleCompra = nuevoId;
    nuevoDetalleventa.Cantidad = Cantidad;
    if (IdMedida) nuevoDetalleventa.Productomedida = await verifyProductoMedida({ PaqueteId: IdMedida });
    if (IdCompra) nuevoDetalleventa.Compra = await verifyCompra({ PaqueteId: IdCompra });
    nuevoDetalleventa.Precio = Precio;
    if (Descripcion) nuevoDetalleventa.Descripcion = Descripcion;
    nuevoDetalleventa.FechaVencimineto = new Date(Fecha);
    await nuevoDetalleventa.save();

    return nuevoDetalleventa;
};


export const updateDetalleCompra = async ({ IdDetalle, IdCompra, Cantidad, IdMedida, Descripcion, Precio, Fecha }: {  IdDetalle: string, IdCompra: string, Cantidad: number, IdMedida: string, Descripcion: string, Precio: number,Fecha:string }) => {

   if(!IdDetalle)
    return createDetalleCompra({IdCompra,Cantidad,IdMedida,Descripcion,Precio,Fecha});
    
   
    const nuevoDetalleventa = await verifyDetalleCompra({PaqueteId:IdDetalle})

    nuevoDetalleventa.Cantidad = Cantidad;
    if (IdMedida) nuevoDetalleventa.Productomedida = await verifyProductoMedida({ PaqueteId: IdMedida });
       nuevoDetalleventa.Precio = Precio;
    if (Descripcion) nuevoDetalleventa.Descripcion = Descripcion;
      nuevoDetalleventa.FechaVencimineto = new Date(Fecha); 
    await nuevoDetalleventa.save();

    return nuevoDetalleventa;
};

export const verifyDetalleCompra = async ({ PaqueteId }: { PaqueteId: string }) => {
  const existPaquete = await Detallecompra.findOne({ where: { IdDetalleCompra: PaqueteId } });

  if (!existPaquete) {
    throw new HttpError(404, `El detalle de la compra con ID ${PaqueteId} no existe.`);
  }

  return existPaquete;
};

export const deleteDetalleCompraAndRestoreStock = async ({ Iddetalle }: { Iddetalle: string }) => {
    const detalleToDelete = await Detallecompra.findOne({
        where: { IdDetalleCompra: Iddetalle }
    });

    if (!detalleToDelete) {
        throw new HttpError(404, `El detalle de venta con ID ${Iddetalle} no existe.`);
    }

    await detalleToDelete.remove(); 
};