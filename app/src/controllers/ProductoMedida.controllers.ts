import { Request, Response } from "express";
import { Productomedida } from "../entities/ProductoMedida";
import { generarIdSecuencial } from "../utils/idGenerator";
import { verifyProducto } from "./Producto.controllers";
import { HttpError } from "../utils/error.handler";
import { verifyPresentacion } from "./Presentacion,controllers";
import { AppDataSource } from "../db";
import { getFechaHoraBolivia } from "../utils/Fecha";
import { Productomedidaprecio } from "../entities/Productomedidaprecio";
const { fecha, hora} = getFechaHoraBolivia()

export const createProductoMedida = async (IdProducto: string, Idpresentacion: string,  Cantidad: number, Precio: number, PrecioMayor: number, Url:string, comision:number
) => {
  const nuevoId = await generarIdSecuencial('PM');

  const nuevoPaquete = new Productomedida();
  nuevoPaquete.IdProductoMedida = nuevoId;
  nuevoPaquete.Cantidad = Cantidad || 0;
  nuevoPaquete.Producto = await verifyProducto({ ProductoId: IdProducto });
  nuevoPaquete.PrecioVenta = Precio;
  nuevoPaquete.PrecioMayor = PrecioMayor;
  nuevoPaquete.Presentacion = await verifyPresentacion({ PresentacionId : Idpresentacion });
  nuevoPaquete.FechaRegistro = fecha;
  nuevoPaquete.Comision = comision
  if(Url)nuevoPaquete.Imagen = Url
  await nuevoPaquete.save();

};
export const createProductoMedidaPrecio = async (IdProductoPrecio: string,  Cantidad: number, Precio: number,
) => {
  const nuevoId = await generarIdSecuencial('PMP');

  const nuevoPaquete = new Productomedidaprecio();
  nuevoPaquete.IdProductoMedidaPrecio = nuevoId;
  nuevoPaquete.CantidadMinima = Cantidad || 0;
  nuevoPaquete.ProductoMedida = await verifyProductoMedida({ PaqueteId: IdProductoPrecio });
  nuevoPaquete.Precio = Precio || 0;
 

  await nuevoPaquete.save();

};

export const verifyProductoMedida = async ({ PaqueteId }: { PaqueteId: string }) => {
  const existPaquete = await Productomedida.findOne({
    where: { IdProductoMedida: PaqueteId },
    relations: ["Producto"]
  });

  if (!existPaquete) {
    throw new HttpError(404, `El Productomedida con ID ${PaqueteId} no existe.`);
  }

  return existPaquete;
}; 
export const verifyProductoMedidaPrecio = async ( PaqueteId: string) => {
  const existPaquete = await Productomedidaprecio.findOne({
    where: { IdProductoMedidaPrecio: PaqueteId },
    relations: ["ProductoMedida"]
  });

  if (!existPaquete) {
    throw new HttpError(404, `El Productomedidaprecio con ID ${PaqueteId} no existe.`);
  }

  return existPaquete;
}; 

export const updateProductoMedidaPrecio = async (IdProductomedidaPrecio: string | null,IdProductoPrecio: string,  Cantidad: number, Precio: number,Estado:number
) => {
   if(!IdProductomedidaPrecio && Estado == 0 )
    return;

if(IdProductomedidaPrecio){
  const nuevoPaquete = await verifyProductoMedidaPrecio(IdProductomedidaPrecio);
  nuevoPaquete.CantidadMinima = Cantidad || 0;
  nuevoPaquete.ProductoMedida = await verifyProductoMedida({ PaqueteId: IdProductoPrecio });
  nuevoPaquete.Precio = Precio || 0;
  nuevoPaquete.Estado = Estado

 return await nuevoPaquete.save();
}else 
  return await createProductoMedidaPrecio(IdProductoPrecio,Cantidad,Precio)
};

export const updateProductoMedida = async ( IdProductomedida: string, IdProducto: string, Idpresentacion: string, Cantidad: number, Precio: number, PrecioMayor: number, Url: string, Estado:number,comision:number) => {

  if (IdProductomedida) {
    const nuevoPaquete = await verifyProductoMedida({ PaqueteId: IdProductomedida });
    nuevoPaquete.Cantidad = Cantidad || 0;
    nuevoPaquete.PrecioVenta = Precio;
    nuevoPaquete.PrecioMayor = PrecioMayor;
    nuevoPaquete.Presentacion = await verifyPresentacion({ PresentacionId: Idpresentacion });
     nuevoPaquete.Imagen = Url
     nuevoPaquete.Estado = Estado
     nuevoPaquete.Comision = comision
     await nuevoPaquete.save();
   
     nuevoPaquete;
  }else
  await createProductoMedida(  IdProducto, Idpresentacion, Cantidad,  Precio, PrecioMayor, Url,comision )
};

export const updateCreatePrecioProducto = async (req: Request, res: Response) => {
  try {
    const { Precio } = req.body
     
    if(Precio.length > 0)
     for (const precio of Precio){
     await updateProductoMedidaPrecio(precio.IdProductomedidaprecio,precio.Idproductomedida,precio.Cantidad,precio.precio,precio.Estado)
     }
     
    return res.json({messaje:'Se registro correctamente' });

  } catch (error) {
    console.error("Error real:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};


export const getmedidasdelProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await AppDataSource.query(
      `
      SELECT 
        pm.idproductomedida,
        pm.cantidad,
        pm.precioventa,
        pm.preciomayor,
        pm.imagen,

        -- 🔥 Producto
        json_build_object(
          'IdProducto', p.idproducto,
          'Nombre', p.nombre,
          'Descripcion', p.descripcion,
          'Imagen', p.imagen,
          'Estado', p.estado
        ) AS producto,

        -- 🔥 Presentacion
        json_build_object(
          'IdPresentacion', pr.idpresentacion,
          'Nombre', pr.nombre,
          'Estado', pr.estado,
          'Abreviatura', pr.abreviatura
        ) AS presentacion

      FROM productomedida pm

      LEFT JOIN producto p 
        ON p.idproducto = pm.idproducto

      LEFT JOIN presentacion pr 
        ON pr.idpresentacion = pm.idpresentacion

      WHERE pm.estado = 1
        AND pm.idproducto = $1

      ORDER BY pm.idproductomedida;
      `,
      [id]
    );
    return res.json(result);

  } catch (error) {
    console.error("Error real:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};


export const getProductomedidas = async (req: Request, res: Response) => {
  try {
    const result = await AppDataSource.query(
      `
      SELECT 
        pm.idproductomedida,
        pm.cantidad,
        pm.precioventa,
        pm.preciomayor,
        pm.comision,
        pm.imagen,
        --  Producto
        json_build_object(
          'IdProducto', p.idproducto,
          'Nombre', p.nombre,
          'Descripcion', p.descripcion,
          'Imagen', p.imagen,
          'Estado', p.estado
        ) AS producto,

        --  Presentacion
        json_build_object(
          'IdPresentacion', pr.idpresentacion,
          'Nombre', pr.nombre,
          'Estado', pr.estado
        ) AS presentacion

      FROM productomedida pm

      LEFT JOIN producto p 
        ON p.idproducto = pm.idproducto

      LEFT JOIN presentacion pr 
        ON pr.idpresentacion = pm.idpresentacion

      ORDER BY pm.idproductomedida;
      `
    );

    return res.json(result);

  } catch (error) {
    console.error("Error real:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};


export const getmedidasdelProductoPrecio = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await AppDataSource.query(
      ` SELECT 
        pm.idproductomedidaprecio,
        pm.cantidadminima,
        pm.precio,
        pm.estado
        FROM productomedidaprecio pm
        WHERE pm.estado = 1
        AND pm.idproductomedida= $1
      ORDER BY pm.idproductomedidaprecio;
      `,[id]
    );
    return res.json(result);

  } catch (error) {
    console.error("Error real:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};