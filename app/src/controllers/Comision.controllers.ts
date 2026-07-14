import { Comision } from "../entities/Comision";
import { generarIdSecuencial } from "../utils/idGenerator";
import { Request, Response } from "express";
import { AppDataSource } from "../db";
import { verifyProductoMedida } from "./ProductoMedida.controllers";

export const createComision = async (req: Request, res: Response) => {
    try {
        const { Registrar } = req.body;

         const nuevoId = await generarIdSecuencial('OCS'); 

        const nuevaPromocion = new Comision();
        nuevaPromocion.IdComision = nuevoId;
       // nuevaPromocion.Productomedida = await verifyProductoMedida({PaqueteId:Registrar.IdProducto});
        if( Registrar.Nombre) nuevaPromocion.Nombre = Registrar.Nombre
        nuevaPromocion.Cantidad =  Registrar.Cantidad;
        nuevaPromocion.Porcentaje = Registrar.Porcentaje;
        nuevaPromocion.Preciocomision = Registrar.Preciocomision
       
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
      where: { IdComision: id },
    });      
      if (!nuevaPromocion) {
      return res.status(404).json({ message: "Comision no encontrada" });
    }
    //    nuevaPromocion.Productomedida = await verifyProductoMedida({PaqueteId:Registrar.IdProducto});
       if( Registrar.Nombre) nuevaPromocion.Nombre = Registrar.Nombre
        nuevaPromocion.Cantidad =  Registrar.Cantidad;
        nuevaPromocion.Porcentaje =  Registrar.Porcentaje;
        nuevaPromocion.Preciocomision = Registrar.Preciocomision
       
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
   
     const result = await AppDataSource.query(
     `UPDATE comision 
      SET estado = CASE WHEN estado = 1 THEN 0 ELSE 1 END
      WHERE IdComision = $1
      RETURNING estado AS estado`,
     [id]
   );
   
       // ✅ aquí está el cambio
       if (result.length === 0) {
         return res.status(404).json({ message: "Comision no encontrado" });
       }
   const nuevoEstado = Number(result[0][0].estado);
       const mensajeAccion = nuevoEstado === 1 ? "habilitaron" : "eliminaron";
   
       return res.json({
         message: `Se ${mensajeAccion} los datos de la comision correctamente`,
       });
   
  } catch (error) {
    console.error("Error al cambiar el estado del usuario:", error);
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const getComision = async (req: Request, res: Response) => {
  try {
    const { idproducto, estado, search, page = 1, limit = 8 } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    // 🔥 limpiar params
    const idProductoParam =
      typeof idproducto === "string" && idproducto.trim() !== ""
        ? idproducto.trim()
        : null;

    const estadoParam =
      estado !== undefined && estado !== ""
        ? Number(estado)
        : null;

    const searchParam =
      typeof search === "string" && search.trim() !== ""
        ? search.trim()
        : null;

    const result = await AppDataSource.query(
      `
      SELECT 
        c.idcomision,
        c.nombre,
        c.cantidad,
        c.porcentaje,
        c.preciocomision,
        c.estado,
        COUNT(*) OVER() AS total,

        json_build_object(
          'IdProductoMedida', pm.idproductomedida,
          'Cantidad', pm.cantidad,
          'PrecioVenta', pm.precioventa,
          'PrecioMayor', pm.preciomayor,
          'Imagen', pm.imagen,
          'Producto', json_build_object(
            'IdProducto', p.idproducto,
            'Nombre', p.nombre,
            'Estado', p.estado,
            'Imagen', p.imagen
          )
        ) AS "Productomedida"

      FROM comision c

      LEFT JOIN productomedida pm 
        ON pm.idproductomedida = c.idproductomedida

      LEFT JOIN producto p 
        ON p.idproducto = pm.idproducto

      WHERE
        ($1::text IS NULL OR p.idproducto = $1)
      AND ($2::int IS NULL OR c.estado = $2)
      AND (
        $3::text IS NULL 
        OR c.nombre ILIKE '%' || $3::text || '%'
      )

      ORDER BY c.idcomision
      LIMIT $4 OFFSET $5;
      `,
      [
        idProductoParam,
        estadoParam,
        searchParam,
        Number(limit),
        offset
      ]
    );

    if (result.length === 0) {
      return res.json({
        total: 0,
        page: Number(page),
        limit: Number(limit),
        data: []
      });
    }

    return res.json({
      total: result[0].total,
      page: Number(page),
      limit: Number(limit),
      data: result
    });

  } catch (error) {
    console.error("Error real:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};