import { Request, Response } from "express";
import { HttpError } from "../utils/error.handler";
import { generarIdSecuencial } from "../utils/idGenerator";
import { Categoriamedida } from "../entities/CategoriaMedida";
import { createMediada, updateMediada } from "./Medida.controllers";
import { AppDataSource } from "../db";


export const createCategoriaMedida = async (req: Request, res: Response) => {
  try {
    const { Registro } = req.body;


   const nuevoId = await generarIdSecuencial('CTM'); 
  
    const unidadmedida = new Categoriamedida();

    unidadmedida.IdCategoriaMedida = nuevoId;
    unidadmedida.Nombre=Registro.Nombre;
    unidadmedida.FechaRegistro=new Date();
   
    await unidadmedida.save();
    
    if(Registro.Unidadmedida.length > 0)
    for(const medida of Registro.Unidadmedida)
        await createMediada({ Nombre:medida.Nombre, Cantidad:medida.Cantidad, Abreviatura:medida.Abreviatura, estado:medida.IdEstado,IdCategoria:nuevoId})

    return res.json({ message: `Registro exitoso.`});
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const deleteCategoriaMedida = async (req: Request, res: Response) => {
  try {
     const { id } = req.params;
      
        const result = await AppDataSource.query(
        `UPDATE categoriamedida 
         SET estado = CASE WHEN estado = 1 THEN 0 ELSE 1 END
         WHERE IdCategoriamedida = $1
         RETURNING estado AS estado`,
        [id]
      );
      
          // ✅ aquí está el cambio
          if (result.length === 0) {
            return res.status(404).json({ message: "Categoria no encontrado" });
          }
      const nuevoEstado = Number(result[0][0].estado);
          const mensajeAccion = nuevoEstado === 1 ? "habilitaron" : "eliminaron";
      
          return res.json({
            message: `Se ${mensajeAccion} los datos de la categoria correctamente`,
          });

  } catch (error) {
    console.error("Error al cambiar el estado del Unidadmedida:", error);
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const getMedidas = async (req: Request, res: Response) => {
  try {
    const { search, estado, page = 1, limit = 8 } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const searchParam =
      typeof search === "string" && search.trim() !== ""
        ? search.trim()
        : null;

    const estadoParam =
      estado !== undefined && estado !== ""
        ? Number(estado)
        : null;

    const result = await AppDataSource.query(
      `
      SELECT 
        cm.idcategoriamedida,
        cm.nombre,
        cm.fecharegistro,
        cm.fechaactualizacion,
        cm.estado,
        COUNT(*) OVER() AS total,

        --  unidades relacionadas
        COALESCE(
          json_agg(
            json_build_object(
              'IdUnidadMedida', um.idunidadmedida,
              'Nombre', um.nombre,
              'Abreviatura', um.abreviatura,
              'Cantidad', um.cantidad,
              'FechaRegistro', um.fecharegistro,
              'Estado', um.estado
            )
          ) FILTER (WHERE um.idunidadmedida IS NOT NULL),
          '[]'
        ) AS "Unidadmedida"

      FROM categoriamedida cm

      LEFT JOIN unidadmedida um 
        ON um.idcategoriamedida = cm.idcategoriamedida

      WHERE 
        ($1::text IS NULL OR cm.nombre ILIKE '%' || $1::text || '%')
      AND ($2::int IS NULL OR cm.estado = $2)

      GROUP BY cm.idcategoriamedida

      ORDER BY cm.idcategoriamedida
      LIMIT $3 OFFSET $4;
      `,
      [
        searchParam,
        estadoParam,
        Number(limit),
        offset
      ]
    );

    // 🔥 si no hay datos → array vacío
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

export const getCategoriaMedidas = async (req: Request, res: Response) => {
  try {
    
const result = await AppDataSource.query(
       `SELECT 
           cm.idcategoriamedida,
           cm.nombre 
       FROM categoriamedida cm 
       WHERE cm.estado = 1`
     );
         return res.json({ result });

  
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};


export const ObtenrCategoriaMedida = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const unidadmedida = await Categoriamedida.findOne({
        where:{  Unidadmedida:{IdUnidadMedida: Number(id)} },
    });

    if (!unidadmedida) 
        return res.status(404).json({ message: "Unidad de medida no encontrado" });

    return res.json(unidadmedida);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const ObtenerMedidas = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

   const result = await AppDataSource.query(
       `SELECT 
           cm.idunidadmedida,
           cm.nombre,
           cm.abreviatura,
           cm.nombre 
       FROM unidadmedida cm 
       WHERE cm.estado = 1 AND cm.idcategoriamedida = $1`,[id]
     );
         return res.json({ result });

  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const updateCateriaMedida = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { Registro } = req.body;
  
 
    
   const unidadmedida = await Categoriamedida.findOne(
    { where: { IdCategoriaMedida: id } });


    if (!unidadmedida) return res.status(404).json({ message: "Unidadmedida no encontrado" });
    
   if(Registro.Nombre) unidadmedida.Nombre=Registro.Nombre;
        unidadmedida.FechaActualizacion=new Date();



    await unidadmedida.save();

   if(Registro.Unidadmedida.length > 0)
    for(const medida of Registro.Unidadmedida)
        await updateMediada({Idmedida:medida.IdUnidadMedida, Nombre:medida.Nombre, Cantidad:medida.Cantidad, Abreviatura:medida.Abreviatura, estado:medida.IdEstado,IdCategoria:unidadmedida.IdCategoriaMedida})


    return res.json({ message: `Se actualizo correctamente.` });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const verifyCategoriaMedida = async ({ UnidadMedidaId }: { UnidadMedidaId: string }) => {

  const existUnidadMedida = await Categoriamedida.findOne({ 
    where: { IdCategoriaMedida: UnidadMedidaId } });

  if (!existUnidadMedida) {
    throw new HttpError(404, `L categoria de medida con ID ${UnidadMedidaId} no existe.`);
  }

  return existUnidadMedida;
};