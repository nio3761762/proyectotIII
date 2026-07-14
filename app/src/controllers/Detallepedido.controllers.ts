import { Request, Response } from "express";
import { Detalleventa } from "../entities/DetalleVenta";
import { verifyPromocion } from "./Promocion.controllers";
import { verifyProducto } from "./Producto.controllers";
import { verifyVenta } from "./Venta.controllers";
import { Sucursal } from "../entities/Sucursal";
import { generarIdSecuencial } from "../utils/idGenerator";
import { HttpError } from "../utils/error.handler";
import { Detallepedido } from "../entities/DetallePedido";
import { verifyPedido } from "./Pedido.controllers";
import { Pedido } from "../entities/Pedido";
import { Promocion } from "../entities/Promocion";
import { Productomedida } from "../entities/ProductoMedida";
import { QueryRunner } from "typeorm";

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



export const createDetallePedido = async (queryRunner: QueryRunner, promocion: Promocion | null, Cantidad: number, presentacion : Productomedida | null, pedido: Pedido, Precio: number) => {
    
    const nuevoId = await generarIdSecuencial('DP'); 
    const nuevoDetalleventa = new Detallepedido()
    nuevoDetalleventa.IdDetallePedido = nuevoId;
    nuevoDetalleventa.Cantidad = Cantidad;
    if (promocion) nuevoDetalleventa.Promocion = promocion;
    if (presentacion) {
        nuevoDetalleventa.Productomedida = presentacion
        nuevoDetalleventa.Producto = presentacion.Producto;
    }
    nuevoDetalleventa.Subtotal = Number(Precio) * Number(Cantidad)
    nuevoDetalleventa.Pedido = pedido
    nuevoDetalleventa.Precio = Precio;

    
    await queryRunner.manager.save(nuevoDetalleventa);
};


export const updateDetallePedido = async ({ Iddetalle, IdPromocion, IdProducto, Cantidad, IdPaquete, IdVenta, Precio, Modo  }:
    { Iddetalle: string, IdPromocion: string, IdProducto: string, Cantidad: number, IdPaquete: string, IdVenta: string, Precio: number, Modo:number }) => {

    if (!Iddetalle) {
      //  return createDetallePedido({ IdPromocion, IdProducto, Cantidad, IdPaquete, IdVenta, Precio,Modo });
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
   

    await detalleVentaToUpdate.save();

    

    return detalleVentaToUpdate;
};


