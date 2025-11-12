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
import { Detallepedido } from "../entities/DetallePedido";
import { verifyPedido } from "./Pedido.Controllers";

export const deleteDetallepedidoAndRestoreStock = async ({ Iddetalle, IdSucursal }: { Iddetalle: string, IdSucursal: string }) => {
    const detalleToDelete = await Detallepedido.findOne({
        where: { IdDetallePedido: Iddetalle },
        relations: ["Producto", "Paquete", "Promocion"]
    });

    if (!detalleToDelete) {
        throw new HttpError(404, `El detalle de venta con ID ${Iddetalle} no existe.`);
    }

    await detalleToDelete.remove(); 
};



export const createDetallePedido = async ({ IdPromocion, IdProducto, Cantidad, IdPaquete, IdVenta, Precio, Modo  }: { IdPromocion: string, IdProducto: string, Cantidad: number, IdPaquete: string, IdVenta: string, Precio: number, Modo:number }) => {

     const nuevoId = await generarIdSecuencial('DP'); 

    const nuevoDetalleventa = new Detallepedido()

    nuevoDetalleventa.IdDetallePedido = nuevoId;
    nuevoDetalleventa.Cantidad = Cantidad;
    if (IdPaquete) nuevoDetalleventa.Paquete = await verifyPaquete({ PaqueteId: IdPaquete });
    if (IdPromocion) nuevoDetalleventa.Promocion = await verifyPromocion({ PromocionId: IdPromocion });
    if (IdProducto) nuevoDetalleventa.Producto = await verifyProducto({ ProductoId: IdProducto });
    nuevoDetalleventa.Pedido = await verifyPedido({ tipo: IdVenta })
    nuevoDetalleventa.Precio = Precio;
    nuevoDetalleventa.Modo = Modo;

    await nuevoDetalleventa.save();
        
    return nuevoDetalleventa;
};


export const updateDetallePedido = async ({ Iddetalle, IdPromocion, IdProducto, Cantidad, IdPaquete, IdVenta, Precio, Modo  }:
    { Iddetalle: string, IdPromocion: string, IdProducto: string, Cantidad: number, IdPaquete: string, IdVenta: string, Precio: number, Modo:number }) => {

    if (!Iddetalle) {
        return createDetallePedido({ IdPromocion, IdProducto, Cantidad, IdPaquete, IdVenta, Precio,Modo });
    }

    const detalleVentaToUpdate = await Detallepedido.findOne({
        where: { IdDetallePedido: Iddetalle },
        relations: ["Producto", "Paquete", "Promocion"] // Cargar relaciones para obtener los IDs antiguos.
    });

    if (!detalleVentaToUpdate) {
        throw new HttpError(404, `El detalle de venta con ID ${Iddetalle} no existe.`);
    }

    
    detalleVentaToUpdate.Cantidad = Cantidad;
    detalleVentaToUpdate.Precio = Precio;
    detalleVentaToUpdate.Modo = Modo;

    await detalleVentaToUpdate.save();

    

    return detalleVentaToUpdate;
};


