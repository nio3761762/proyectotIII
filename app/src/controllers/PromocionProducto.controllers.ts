import { Request, Response } from "express";
import { Promocionproducto } from "../entities/PromocionProducto";
import { verifyPromocion } from "./Promocion.controllers";
import { verifyProducto } from "./Producto.controllers";
import { HttpError } from "../utils/error.handler";
import { verifyEstado } from "./Estado.controllers";
import { generarIdSecuencial } from "../utils/idGenerator";
import { verifyPaquete } from "./Presentacionproducto.controllers";

export const createPromocionProducto = async ({ IdPromocion, IdProducto, Cantidad, Descuento, IdEstado, IdPaquete }: { IdPromocion: string, IdProducto: string, Cantidad: number, Descuento: number, IdEstado: number, IdPaquete: string }) => {

    const nuevoId = await generarIdSecuencial('PP');

    const nuevoPromocionproducto = new Promocionproducto()
    nuevoPromocionproducto.IdPromocionProducto = nuevoId;
    if (Cantidad) nuevoPromocionproducto.Cantidad = Cantidad;
    if (Descuento >= 0) nuevoPromocionproducto.Descuento = Descuento;
    if (IdProducto) nuevoPromocionproducto.Producto = await verifyProducto({ ProductoId: IdProducto });
    if (IdPromocion) nuevoPromocionproducto.Promocion = await verifyPromocion({ PromocionId: IdPromocion });
    if (IdPaquete) nuevoPromocionproducto.Paquete = await verifyPaquete({ PaqueteId: IdPaquete })
    nuevoPromocionproducto.Estado = await verifyEstado({ EstadoId: IdEstado });

    await nuevoPromocionproducto.save();


    return nuevoPromocionproducto;
};


export const updatePromocionProducto = async ({ Idpp, IdProducto, IdPromocion, Cantidad, Descuento, IdEstado,IdPaquete }: { Idpp: string, IdProducto: string, IdPromocion: string, Cantidad: number, Descuento: number, IdEstado: number, IdPaquete: string }) => {

    if (Idpp) {

        const nuevoPromocionproducto = await verifyPromocionProducto({ PromocionId: Idpp })

        nuevoPromocionproducto.Cantidad = Cantidad;
        nuevoPromocionproducto.Descuento = Descuento;
        nuevoPromocionproducto.Promocion = await verifyPromocion({ PromocionId: IdPromocion });
        nuevoPromocionproducto.Estado = await verifyEstado({ EstadoId: IdEstado });
        if (IdProducto) nuevoPromocionproducto.Producto = await verifyProducto({ ProductoId: IdProducto });
        if (IdPaquete) nuevoPromocionproducto.Paquete = await verifyPaquete({ PaqueteId: IdPaquete })
        await nuevoPromocionproducto.save();

        return nuevoPromocionproducto;
    } else

        return createPromocionProducto({ IdProducto: IdProducto, Cantidad: Cantidad, Descuento: Descuento, IdPromocion: IdPromocion, IdEstado: IdEstado, IdPaquete: IdPaquete })

};


export const verifyPromocionProducto = async ({ PromocionId }: { PromocionId: string }) => {

    const existPromocion = await Promocionproducto.findOne({ where: { IdPromocionProducto: PromocionId } });


    if (!existPromocion) {
        throw new HttpError(404, `La promocion con ID ${PromocionId} no existe.`);
    }

    return existPromocion;
};


