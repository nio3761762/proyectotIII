import { Request, Response } from "express";
import { Detalleventa } from "../entities/DetalleVenta";
import { generarIdSecuencial } from "../utils/idGenerator";
import { Venta } from "../entities/Venta";
import { DecrementProducto, DecrementPromocion } from "./Inventario.controllers";
import { Promocion } from "../entities/Promocion";
import { Productomedida } from "../entities/ProductoMedida";
import { QueryRunner } from "typeorm";


export const createDetalleventa = async (queryRunner: QueryRunner, venta: Venta, presentacion: Productomedida | null, promocion: Promocion | null, Cantidad: number,  Precio: number, IdSucursal:string, tipo: string = "SALIDA_VENTA", precioMayor?: number ) => {

     const nuevoId = await generarIdSecuencial('DV'); 

    const nuevoDetalleventa = new Detalleventa()
   
    nuevoDetalleventa.IdDetalleVenta = nuevoId;
    nuevoDetalleventa.Cantidad = Cantidad;

    if (promocion) nuevoDetalleventa.Promocion = promocion
   if(presentacion){
    nuevoDetalleventa.Producto = presentacion.Producto;
    nuevoDetalleventa.Productomedida = presentacion
   }
    nuevoDetalleventa.Venta = venta
    nuevoDetalleventa.Precio = Precio;
    if (precioMayor !== undefined) nuevoDetalleventa.PrecioMayor = precioMayor;

    await queryRunner.manager.save(nuevoDetalleventa);
     
    if (presentacion  && IdSucursal)
    await DecrementProducto(queryRunner,presentacion,IdSucursal,Cantidad, venta.IdVenta, tipo);
    if(promocion && IdSucursal)
    await DecrementPromocion(queryRunner,IdSucursal, Cantidad,promocion, venta.IdVenta, tipo)   
    return nuevoDetalleventa;
};








export const getDetalleVentas = async ( req:Request, res:Response) =>{
    try {
       const { id } = req.params;
        const Detalleventas = await Detalleventa.findOne({
            where:{Venta:{IdVenta:id}},
             relations: 
          [
            "Producto",
            "Promocion",
            "Paquete",
            ]});
        return res.json(Detalleventas)    
    } catch (error) {
        if(error instanceof Error){
            return res.status(500).json({message: error.message})
        }
    }
}

