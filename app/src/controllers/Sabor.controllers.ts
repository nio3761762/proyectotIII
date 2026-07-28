import { AppDataSource } from "../db";
import { Request, Response } from "express";
import { Sabor } from "../entities/Sabor";
import { generarIdSecuencial } from "../utils/idGenerator";


export const getSabor = async (req: Request, res: Response) => {
  try {

 const result = await AppDataSource.query(`
   SELECT
     s.idsabor,
     s.nombre
   FROM sabor s 
   `);

    return res.json(result);

  } catch (error) {
    console.error("Error real:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const CreateSabor = async (req: Request, res: Response) => {
  try {
  const { nombre } = req.body;

  if (!nombre) {
    return res.status(400).json({ message: "El nombre es requerido" });
  }

 const sabor =  new Sabor();
 sabor.Idsabor = await generarIdSecuencial('SAB');
 sabor.Nombre = nombre;
 await sabor.save();

    return res.json({ message: "Sabor creado correctamente", sabor });

  } catch (error) {
    console.error("Error real:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};


export const UpdateSabor = async (req: Request, res: Response) => {
  try {
   const { id } = req.params; 
  const { nombre } = req.body;


const sabor = await Sabor.findOne({ where: { Idsabor: id } });
  if (!nombre && !sabor) {
    return res.status(400).json({ message: "El nombre es requerido" });
  }

  if ( !sabor) {
    return res.status(400).json({ message: "El sabor no existe" });
  }

 sabor.Nombre = nombre;
  await sabor.save();

    return res.json({ message: "Sabor actualizado correctamente", sabor });

  } catch (error) {
    console.error("Error real:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
