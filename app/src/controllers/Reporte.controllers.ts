import { Request, Response } from "express";

// Este archivo se mantiene temporalmente mientras se termina la migración
// y para evitar errores de compilación en otras partes del sistema.

export const getReporteProductos = async (req: Request, res: Response) => {
   return res.json({ message: "Utilice los nuevos endpoints especializados." });
};

export const getReporteProduccionInsumosReal = async (req: Request, res: Response) => {
    // Implementar si es necesario
};
