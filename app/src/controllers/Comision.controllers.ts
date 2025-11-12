import { Comision } from "../entities/Comision";
import { generarIdSecuencial } from "../utils/idGenerator";
import { Request, Response } from "express";
import { verifyProducto } from "./Producto.controllers";
import { verifyEstado } from "./Estado.controllers";
import { Producto } from "../entities/Producto";
import { Productomedida } from "../entities/ProductoMedida";

export const createComision = async (req: Request, res: Response) => {
    try {
        const { Registrar } = req.body;

           const ultimaComision = await Comision.findOne({
      where: {},
      order: { IdComision: "DESC" },
    });

  const nuevoId = ultimaComision ? ultimaComision.IdComision + 1 : 1;
        const nuevaPromocion = new Comision();
        nuevaPromocion.IdComision = nuevoId;
        nuevaPromocion.Producto = await verifyProducto({ProductoId:Registrar.IdProducto});
        
        const precio = await Productomedida.findOne({
             where :{Producto:{IdProducto:Registrar.IdProducto}}
        })
          if (!precio) {
      return res.status(404).json({ message: "Producto no encontrada" });
    }
        nuevaPromocion.Cantidad =  Registrar.Cantidad;
        nuevaPromocion.Porcentaje = Registrar.Porcentaje;
        // nuevaPromocion.Porcentaje = (Registrar.Cantidad*precio?.PrecioVenta)*(Registrar.Porcentaje/100);
        nuevaPromocion.Estado = await verifyEstado({EstadoId:1});
       
        await nuevaPromocion.save();

       
        return res.status(201).json({ message: "La comision se registró correctamente" });

    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const updateComision = async (req: Request, res: Response) => {
    try {
        const { Registrar } = req.body;

       
    

        
          const { id } = req.params;

    const nuevaPromocion = await Comision.findOne({
      where: { IdComision: Number(id) },
    });       

      if (!nuevaPromocion) {
      return res.status(404).json({ message: "Comision no encontrada" });
    }
     
        nuevaPromocion.Producto = await verifyProducto({ProductoId:Registrar.IdProducto});
        nuevaPromocion.Cantidad = await Registrar.Cantidad;
        nuevaPromocion.Porcentaje = await Registrar.Porcentaje;
     
       
        await nuevaPromocion.save();

       
        return res.status(201).json({ message: "Se actualizo correctamente" });

    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const deleteComision = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const usuario = await Comision.findOne({
      where: { IdComision: Number(id) },
      relations: ['Estado']
    });

    if (!usuario) {
      return res.status(404).json({ message: "Comision no encontrada" });
    }
    
    const esActivo = usuario.Estado?.IdEstado === 1;
    const nuevoEstadoId = esActivo ? 2 : 1; 
    const mensajeAccion = esActivo ? 'eliminaron' : 'habilitaron';

    const nuevoEstado = await verifyEstado({ EstadoId: nuevoEstadoId });

    if (!nuevoEstado) {
      return res.status(500).json({ message: "No se pudo obtener el estado requerido." });
    }

    usuario.Estado = nuevoEstado;
    await usuario.save();

    return res.json({ message: `Se ${mensajeAccion} los datos de la comison correctamente` });

  } catch (error) {
    console.error("Error al cambiar el estado del usuario:", error);
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const getComision = async ( req:Request, res:Response) =>{
    try {
      
        const comision = await Comision.find(
            { relations: 
          [
            "Estado","Producto"
          ]});
            
 const result = comision.map(ps => {
      return {
        IdComision:ps.IdComision,
        Cantidad:ps.Cantidad,
        Porcentaje:ps.Porcentaje,
        IdProducto:ps.Producto.IdProducto ?? null,  
        Nombre:ps.Producto.Nombre,
        Estado: ps.Estado?.IdEstado ?? null, 
      }  }) || [];

        return res.json(result)    
    } catch (error) {
        if(error instanceof Error){
            return res.status(500).json({message: error.message})
        }
    }
}