
import { Productostock } from "../entities/ProductoStock";
import { HttpError } from "../utils/error.handler";
import { verifyProducto } from "./Producto.controllers";
import { verifySucursal } from "./Sucursal.controllers";
import { generarIdSecuencial } from "../utils/idGenerator";

export const updateProductostock = async ({ sucursalId, productoId, cantidad }: { sucursalId: string, productoId: string, cantidad: number }) => {

    if (!sucursalId || !productoId || !cantidad) {
        throw new HttpError(400, "Faltan datos");
    }

    const fecha = new Date();

    let productoStock = await Productostock.findOne({
        where: {
            Sucursal: { IdSucursal: sucursalId },
            Fecha: fecha,
            Producto: { IdProducto: productoId }
        }
    });

    if (productoStock) {
        productoStock.Cantidad += cantidad; //(cantidad - productoStock.Cantidad) ;
        await productoStock.save();
    } else {
        productoStock = new Productostock();
        productoStock.IdProductoStock = await generarIdSecuencial('PST');
        productoStock.Sucursal = await verifySucursal({ SucursalId: sucursalId });
        productoStock.Producto = await verifyProducto({ ProductoId: productoId });
        productoStock.Cantidad = cantidad;
        productoStock.Fecha = fecha;
        await productoStock.save();
    }

    return productoStock;
};
