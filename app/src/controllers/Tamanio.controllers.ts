import { AppDataSource } from "../db";
import { Request, Response } from "express";


export const getTamanio = async (req: Request, res: Response) => {
  try {

 const result = await AppDataSource.query(`
   SELECT
     s.idtamanio,
     s.nombre
   FROM tamanio s 
   `);

    return res.json(result);

  } catch (error) {
    console.error("Error real:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

