import { Productomedida } from "../entities/ProductoMedida";
import { generarIdSecuencial } from "../utils/idGenerator";
import { verifyUnidadMedida } from "./Medida.controllers";
import { createPrecio, updatePrecio } from "./Precio.controllers";
import { verifyProducto } from "./Producto.controllers";
import { HttpError } from "../utils/error.handler";
import { Request, Response } from "express";



export const createProductoMedida = async ({
  IdProducto,
  IdUnidadMedida,
  Cantidad,
  Precio,
  PrecioMayor
}: {
  IdProducto: string;
  IdUnidadMedida: number;
  Cantidad: number;
  Precio: number;
  PrecioMayor: number;
}) => {
  const nuevoId = await generarIdSecuencial('PM');

  const nuevoPaquete = new Productomedida();
  nuevoPaquete.IdProductoMedida = nuevoId;
  if (Cantidad) nuevoPaquete.Cantidad = Cantidad || 0;
  nuevoPaquete.Producto = await verifyProducto({ ProductoId: IdProducto });
  nuevoPaquete.PrecioVenta = Precio;
  nuevoPaquete.PrecioMayor = PrecioMayor;
  nuevoPaquete.Unidadmedida = await verifyUnidadMedida({ UnidadMedidaId: IdUnidadMedida });
  nuevoPaquete.FechaRegistro = new Date();
  nuevoPaquete.Unidadmedida = await verifyUnidadMedida({ UnidadMedidaId: IdUnidadMedida });
  await nuevoPaquete.save();

  return nuevoPaquete;
};

export const verifyProductoMedida = async ({ PaqueteId }: { PaqueteId: string }) => {
  const existPaquete = await Productomedida.findOne({ where: { IdProductoMedida: PaqueteId } });

  if (!existPaquete) {
    throw new HttpError(404, `El Productomedida con ID ${PaqueteId} no existe.`);
  }

  return existPaquete;
};


export const updateProductoMedida = async ({
  IdProductomedida,
  IdProducto,
  IdUnidadMedida,
  Cantidad,
  Precio,
  PrecioMayor
}: {
  IdProductomedida: string
  IdProducto: string;
  IdUnidadMedida: number;
  Cantidad: number;
  Precio: number;
  PrecioMayor: number;
}) => {

  if (IdProductomedida) {
    const nuevoPaquete = await verifyProductoMedida({ PaqueteId: IdProductomedida });
    if (Cantidad) nuevoPaquete.Cantidad = Cantidad || 0;
    nuevoPaquete.Producto = await verifyProducto({ ProductoId: IdProducto });
    nuevoPaquete.PrecioVenta = Precio;
    nuevoPaquete.PrecioMayor = PrecioMayor;
    nuevoPaquete.Unidadmedida = await verifyUnidadMedida({ UnidadMedidaId: IdUnidadMedida });
    nuevoPaquete.FechaRegistro = new Date();
    nuevoPaquete.Unidadmedida = await verifyUnidadMedida({ UnidadMedidaId: IdUnidadMedida });
    await nuevoPaquete.save();

    return nuevoPaquete;
  }

  return createProductoMedida({ IdProducto: IdProducto, IdUnidadMedida: IdUnidadMedida, Cantidad: Cantidad, Precio: Precio, PrecioMayor: PrecioMayor })
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const allProductoSucursal = await Productomedida.find({
      where: {
        Producto: { Tipoproducto: { IdTipoProducto: 'ITP-1' } }
      },
      relations: [
        'Producto',
        'Unidadmedida',
      ],
    });

    if (!allProductoSucursal.length) {
      return res.status(404).json({ message: "No se encontraron productos con cantidades en ninguna sucursal." });
    }

    // Transformar datos para dejar solo los IDs pedidos
    const result = allProductoSucursal.map(ps => {
      return {
        ...ps,
        Medida: ps.Unidadmedida?.IdUnidadMedida ?? null,
        Nombre: ps.Unidadmedida?.Nombre ?? null,
        Abreviatura: ps.Unidadmedida?.Abreviatura ?? null,  // 👈 solo IdSucursal
        IdProducto: ps.Producto.Nombre,
        NombreProducto: ps.Producto.Nombre
      }
    }) || []


    return res.json(result);

  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
    return res.status(500).json({ message: "Ocurrió un error desconocido." });
  }
};


export const getProductoInMedida = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const allProductoSucursal = await Productomedida.find({
      where: {
        Producto: { IdProducto: id }
      },
      relations: [
        'Unidadmedida',
        'Unidadmedida.Categoria'
      ],
    });

    if (!allProductoSucursal.length) {
      return res.status(404).json({ message: "No se encontraron productos con cantidades en ninguna sucursal." });
    }

    return res.json(allProductoSucursal);

  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
    return res.status(500).json({ message: "Ocurrió un error desconocido." });
  }
};