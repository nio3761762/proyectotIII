import { Request, Response } from "express";
import { HttpError } from "../utils/error.handler";
import { generarIdSecuencial } from "../utils/idGenerator";
import { Presentacion } from "../entities/Presentacion";
import { AppDataSource } from "../db";

export const AddPresentacion = async (req: Request, res: Response) => {
    try {
        const {Nombre,Abreviatura} = req.body;
        
        const nuevo = new Presentacion();
        
        const nuevoId = await generarIdSecuencial('PREN');
        nuevo.IdPresentacion = nuevoId;
        nuevo.Nombre =Nombre;
        nuevo.Abreviatura = Abreviatura
        nuevo.FechaRegistro = new Date();
        
        await nuevo.save();
 
        return res.json({message:"Se registro la presentacion"});
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};


export const updatePresentacion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {Nombre,Abreviatura} = req.body;
        
         const existe = await Presentacion.findOne({
          
          where:{ IdPresentacion:id},
          });

        if(!existe)
            return res.status(404).json({ message: "La presentacion no se encuentra registrada" });
        
        existe.Nombre = Nombre;
        existe.FechaActualizacion = new Date();
        existe.Abreviatura = Abreviatura
        
        await existe.save();

        return res.json({message:"Se actualizo la presentacion"});
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const verifyPresentacion = async ({ PresentacionId }: { PresentacionId: string }) => {

    const exist = await Presentacion.findOne({ where: { IdPresentacion: PresentacionId } });
    
    
   if (!exist) {
    throw new HttpError(404,`La presentacion con ID ${PresentacionId} no existe.`);
  }
  
    return exist;
};


export const getPresentaciones = async (req: Request, res: Response) => {
    try {

       const result = await AppDataSource.query(
        `SELECT p.idpresentacion , p.nombre
        FROM presentacion p
        WHERE p.estado = 1 `);

        return res.json(result);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};


export const getPresentacion = async (req: Request, res: Response) => {
    try {
      
 const { search, estado, page = 1, limit = 8 } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    //  limpiar parámetros
    const nombreParam =
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
          p.idpresentacion,
          p.nombre,
          p.estado,
          p.abreviatura,
          COUNT(*) OVER() AS total
      FROM presentacion p
      WHERE 
          ($1::text IS NULL OR p.nombre ILIKE '%' || $1::text || '%')
      AND ($2::int IS NULL OR p.estado = $2)
      ORDER BY p.idpresentacion
      LIMIT $3 OFFSET $4;
      `,
      [
        nombreParam,
        estadoParam,
        Number(limit),
        offset
      ]
    );

    // si no hay resultados → array vacío
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
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const getbypresentacion = async ( req:Request, res:Response) =>{
    try {
       const {id}  = req.body;
        const presentacion = await Presentacion.findOne({ 
               where:{IdPresentacion:id}})
    if (!presentacion) {
      return res.status(404).json({ message: "presentacion no encontrado" });
    }
      return res.json(presentacion)    
    } catch (error) {
        if(error instanceof Error){
            return res.status(500).json({message: error.message})
        }
    }
}

export const deletePresentacion= async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
 const result = await AppDataSource.query(
  `UPDATE presentacion 
   SET estado = CASE WHEN estado = 1 THEN 0 ELSE 1 END
   WHERE IdPresentacion = $1
   RETURNING estado AS estado`,
  [id]
);

    // ✅ aquí está el cambio
    if (result.length === 0) {
      return res.status(404).json({ message: "Presentacion no encontrado" });
    }
const nuevoEstado = Number(result[0][0].estado);
    const mensajeAccion = nuevoEstado === 1 ? "habilitaron" : "eliminaron";

    return res.json({
      message: `Se ${mensajeAccion} los datos de la presentacion correctamente`,
    });

  } catch (error) {
    console.error("Error al cambiar el estado del usuario:", error);
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};