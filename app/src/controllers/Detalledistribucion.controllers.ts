import { Request, Response } from "express";
import { verifyProducto } from "./Producto.controllers";
import { getPaquete, verifyPaquete } from "./Presentacionproducto.controllers";
import { generarIdSecuencial } from "../utils/idGenerator";
import { HttpError } from "../utils/error.handler";
import { Detalledistribucion } from "../entities/Detalledistribucion";
import { verifyDistribucion } from "./Distribucion.controllers";

export const deleteDetalledistribucionAndRestoreStock = async ({ Iddetalle }: { Iddetalle: string }) => {
    const detalleToDelete = await Detalledistribucion.findOne({
        where: { IdDetalleDistribucion: Iddetalle },
        relations: ["Producto", "Paquete"]
    });

    if (!detalleToDelete) {
        throw new HttpError(404, `El detalle de venta con ID ${Iddetalle} no existe.`);
    }

    await detalleToDelete.remove();
};

export const createDetalledistribucion = async ({ IdProducto, Cantidad, IdPaquete, IdVenta, Precio, Modo }: { IdProducto: string, Cantidad: number, IdPaquete: string, IdVenta: string, Precio: number, Modo: number }) => {

    const nuevoId = await generarIdSecuencial('DD');

    const nuevoDetalleventa = new Detalledistribucion()

    nuevoDetalleventa.IdDetalleDistribucion = nuevoId;
    nuevoDetalleventa.Cantidad = Cantidad;
    if (IdPaquete) nuevoDetalleventa.Paquete = await verifyPaquete({ PaqueteId: IdPaquete });
    if (IdProducto) nuevoDetalleventa.Producto = await verifyProducto({ ProductoId: IdProducto });
    nuevoDetalleventa.Precio = Precio;
    nuevoDetalleventa.Distribucion = await verifyDistribucion({ distribucio: IdVenta })
    nuevoDetalleventa.Cantidaddevuelta = 0;
    nuevoDetalleventa.Modo = Modo;
    await nuevoDetalleventa.save();

    return nuevoDetalleventa;
};


export const updateDetalledistribucion = async ({ Iddetalle, IdProducto, Cantidad, IdPaquete, IdVenta, Precio, Modo }:
    { Iddetalle: string, IdProducto: string, Cantidad: number, IdPaquete: string, IdVenta: string, Precio: number, Modo: number }) => {

    if (!Iddetalle) {
        return createDetalledistribucion({ IdProducto, Cantidad, IdPaquete, IdVenta, Precio, Modo });
    }

    const detalleVentaToUpdate = await Detalledistribucion.findOne({
        where: { IdDetalleDistribucion: Iddetalle },
        relations: ["Producto", "Paquete"] // Cargar relaciones para obtener los IDs antiguos.
    });

    if (!detalleVentaToUpdate) {
        throw new HttpError(404, `El detalle de la distribucion con ID ${Iddetalle} no existe.`);
    }

    detalleVentaToUpdate.Cantidad = Cantidad;
    detalleVentaToUpdate.Precio = Precio;
    detalleVentaToUpdate.Modo = Modo || 0;

    await detalleVentaToUpdate.save();



    return detalleVentaToUpdate;
};



export const devolucionCantidad = async ({ Iddetalle, Cantidad }:
    { Iddetalle: string, Cantidad: number }) => {

    const detalleVentaToUpdate = await Detalledistribucion.findOne({
        where:
        {
            IdDetalleDistribucion: Iddetalle
        },
    });

    if (!detalleVentaToUpdate) {
        throw new HttpError(404, `El detalle de la distribucion con ID ${Iddetalle} no existe.`);
    }

    detalleVentaToUpdate.Cantidaddevuelta = Cantidad;

    await detalleVentaToUpdate.save();

    return detalleVentaToUpdate;
};
