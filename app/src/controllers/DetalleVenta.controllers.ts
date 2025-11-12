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


export const createDetalleventa = async ({ IdPromocion, IdProducto, Cantidad, IdPaquete, IdVenta, Precio, IdSucursal, Modo }: { IdPromocion: string, IdProducto: string, Cantidad: number, IdPaquete: string, IdVenta: string, Precio: number, IdSucursal:string, Modo:number }) => {

     const nuevoId = await generarIdSecuencial('DV'); 

    const nuevoDetalleventa = new Detalleventa()

    nuevoDetalleventa.IdDetalleVenta = nuevoId;
    nuevoDetalleventa.Cantidad = Cantidad;
    if (IdPaquete) nuevoDetalleventa.Paquete = await verifyPaquete({ PaqueteId: IdPaquete });
    if (IdPromocion) nuevoDetalleventa.Promocion = await verifyPromocion({ PromocionId: IdPromocion });
    if (IdProducto) nuevoDetalleventa.Producto = await verifyProducto({ ProductoId: IdProducto });
    nuevoDetalleventa.Venta = await verifyVenta({ VentaId: IdVenta })
    nuevoDetalleventa.Precio = Precio;
    nuevoDetalleventa.Modo = Modo;
    await nuevoDetalleventa.save();
     
    if (IdProducto && IdSucursal)
    await DecrementProducto({ProductoId:IdProducto,SucursalId:IdSucursal,Cantidad:Cantidad});
    if (IdPaquete && IdSucursal)
    await DecrementPaquete({SucursalId:IdSucursal, Cantidad:Cantidad,PaqueteId:IdPaquete});   
    if(IdPromocion && IdSucursal)
    await DecrementPromocion({ SucursalId:IdSucursal, Cantidad:Cantidad,PromocionId:IdPromocion})   
    return nuevoDetalleventa;
};

export const updateDetalleventa = async ({ Iddetalle, IdPromocion, IdProducto, Cantidad, IdPaquete, IdVenta, Precio, IdSucursal, Modo }:
    { Iddetalle: string, IdPromocion: string, IdProducto: string, Cantidad: number, IdPaquete: string, IdVenta: string, Precio: number, IdSucursal: string, Modo:number }) => {

    if (!Iddetalle) {
        return createDetalleventa({ IdPromocion, IdProducto, Cantidad, IdPaquete, IdVenta, Precio, IdSucursal,Modo });
    }

    const detalleVentaToUpdate = await Detalleventa.findOne({
        where: { IdDetalleVenta: Iddetalle },
        relations: ["Producto", "Paquete", "Promocion"] // Cargar relaciones para obtener los IDs antiguos.
    });

    if (!detalleVentaToUpdate) {
        throw new HttpError(404, `El detalle de venta con ID ${Iddetalle} no existe.`);
    }

    const oldCantidad = detalleVentaToUpdate.Cantidad;

    if (detalleVentaToUpdate.Producto) {
        await IncrementProducto({ SucursalId: IdSucursal, ProductoId: detalleVentaToUpdate.Producto.IdProducto, Cantidad: oldCantidad });
    }
     if (detalleVentaToUpdate.Paquete) {
    await IncrementPaquete({ SucursalId:IdSucursal, Cantidad:oldCantidad, PaqueteId:detalleVentaToUpdate.Paquete.IdPaquete })
    }
    if (detalleVentaToUpdate.Promocion) {
    await IncrementPromocion({ SucursalId: IdSucursal, PromocionId: detalleVentaToUpdate.Promocion.IdPromocion, Cantidad: oldCantidad });
    }
    detalleVentaToUpdate.Cantidad = Cantidad;
    detalleVentaToUpdate.Precio = Precio;
    detalleVentaToUpdate.Modo = Modo;

    await detalleVentaToUpdate.save();

    
    if (IdProducto) {
        await DecrementProducto({ ProductoId: IdProducto, SucursalId: IdSucursal, Cantidad: Cantidad });
    }
    if (IdPaquete) {
        await DecrementPaquete({ SucursalId: IdSucursal, Cantidad: Cantidad, PaqueteId: IdPaquete });
    }
    if (IdPromocion) {
        await DecrementPromocion({ SucursalId: IdSucursal, Cantidad: Cantidad, PromocionId: IdPromocion });
    }

    return detalleVentaToUpdate;
};


export const deleteDetalleventaAndRestoreStock = async ({ Iddetalle, IdSucursal }: { Iddetalle: string, IdSucursal: string }) => {
    const detalleToDelete = await Detalleventa.findOne({
        where: { IdDetalleVenta: Iddetalle },
        relations: ["Producto", "Paquete", "Promocion"]
    });

    if (!detalleToDelete) {
        throw new HttpError(404, `El detalle de venta con ID ${Iddetalle} no existe.`);
    }

    const cantidad = detalleToDelete.Cantidad;

    if (detalleToDelete.Producto) {
        await IncrementProducto({
            SucursalId: IdSucursal,
            ProductoId: detalleToDelete.Producto.IdProducto,
            Cantidad: cantidad
        });
    } else if (detalleToDelete.Paquete) {
        await IncrementPaquete({
            SucursalId: IdSucursal,
            PaqueteId: detalleToDelete.Paquete.IdPaquete,
            Cantidad: cantidad
        });
    } else if (detalleToDelete.Promocion) {
        await IncrementPromocion({
            SucursalId: IdSucursal,
            PromocionId: detalleToDelete.Promocion.IdPromocion,
            Cantidad: cantidad
        });
    }

    await detalleToDelete.remove(); // This will delete the entity from the database
};

export const createDetalleventaPedido = async ({ IdPromocion, IdProducto, Cantidad, IdPaquete, IdVenta, Precio, Modo  }: { IdPromocion: string, IdProducto: string, Cantidad: number, IdPaquete: string, IdVenta: string, Precio: number, Modo:number }) => {

     const nuevoId = await generarIdSecuencial('DV'); 

    const nuevoDetalleventa = new Detalleventa()

    nuevoDetalleventa.IdDetalleVenta = nuevoId;
    nuevoDetalleventa.Cantidad = Cantidad;
    if (IdPaquete) nuevoDetalleventa.Paquete = await verifyPaquete({ PaqueteId: IdPaquete });
    if (IdPromocion) nuevoDetalleventa.Promocion = await verifyPromocion({ PromocionId: IdPromocion });
    if (IdProducto) nuevoDetalleventa.Producto = await verifyProducto({ ProductoId: IdProducto });
    nuevoDetalleventa.Venta = await verifyVenta({ VentaId: IdVenta })
    nuevoDetalleventa.Precio = Precio;
    nuevoDetalleventa.Modo = Modo;

    await nuevoDetalleventa.save();
        
    return nuevoDetalleventa;
};


export const updateDetalleventaPedido = async ({ Iddetalle, IdPromocion, IdProducto, Cantidad, IdPaquete, IdVenta, Precio, Modo  }:
    { Iddetalle: string, IdPromocion: string, IdProducto: string, Cantidad: number, IdPaquete: string, IdVenta: string, Precio: number, Modo:number }) => {

    if (!Iddetalle) {
        return createDetalleventaPedido({ IdPromocion, IdProducto, Cantidad, IdPaquete, IdVenta, Precio,Modo });
    }

    const detalleVentaToUpdate = await Detalleventa.findOne({
        where: { IdDetalleVenta: Iddetalle },
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

