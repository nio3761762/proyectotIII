import { Request, Response } from "express";
import { Promocionproducto } from "../entities/PromocionProducto";
import { verifyPromocion } from "./Promocion.controllers";
import { HttpError } from "../utils/error.handler";
import { generarIdSecuencial } from "../utils/idGenerator";
import { verifyProductoMedida } from "./ProductoMedida.controllers";
import { Promocion } from "../entities/Promocion";

export const createPromocionProducto = async (
 promocion: Promocion | null, IdProducto: string, Cantidad: number, Descuento: number, Precio: number, IdEstado:number ) => {
  if( IdEstado == 0){
    return;
  }
    const nuevoId = await generarIdSecuencial('PP');
   const producto = await verifyProductoMedida({ PaqueteId: IdProducto });
    const nuevoPromocionproducto = new Promocionproducto()
    nuevoPromocionproducto.IdPromocionProducto = nuevoId;
    if (Cantidad) nuevoPromocionproducto.Cantidad = Cantidad;
    if (Descuento >= 0) nuevoPromocionproducto.Descuento = Descuento;
    if (producto) { nuevoPromocionproducto.Productomedida = producto;
    nuevoPromocionproducto.Producto = producto.Producto;}
    if (promocion) nuevoPromocionproducto.Promocion = promocion;
    if (Precio>=0) nuevoPromocionproducto.Precio = Precio 

    await nuevoPromocionproducto.save();


    return nuevoPromocionproducto;
};

export const updatePromocionProducto = async (Idpp: string, IdProducto: string, promocion: Promocion | null, Cantidad: number, Descuento: number, IdEstado: number,Precio:number) => {

    if (Idpp) {

        const nuevoPromocionproducto = await verifyPromocionProducto({ PromocionId: Idpp })
         const producto = await verifyProductoMedida({ PaqueteId: IdProducto }); 
        nuevoPromocionproducto.Cantidad = Cantidad;
        nuevoPromocionproducto.Descuento = Descuento;
         if (producto) { 
                         nuevoPromocionproducto.Productomedida = producto;
                         nuevoPromocionproducto.Producto = producto.Producto;
                        }
        nuevoPromocionproducto.Estado = IdEstado ;
         if (Precio>=0) nuevoPromocionproducto.Precio = Precio 
        await nuevoPromocionproducto.save();

        return nuevoPromocionproducto;
    } else

        return createPromocionProducto( promocion, IdProducto, Cantidad, Descuento,Precio,IdEstado)

};

export const verifyPromocionProducto = async ({ PromocionId }: { PromocionId: string }) => {

    const existPromocion = await Promocionproducto.findOne({ where: { IdPromocionProducto: PromocionId } });


    if (!existPromocion) {
        throw new HttpError(404, `La promocion con ID ${PromocionId} no existe.`);
    }

    return existPromocion;
};


