import { AppDataSource } from "../db";
import { Request, Response } from "express";
import { Sabor } from "../entities/Sabor";
import { generarIdSecuencial } from "../utils/idGenerator";

export const getSabor = async (req: Request, res: Response) => {
  try {
    const { search, estado, page = 1, limit = 8 } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const nombreParam =
      typeof search === "string" && search.trim() !== ""
        ? search.trim()
        : null;

    const estadoParam =
      estado !== undefined && estado !== "" ? Number(estado) : null;

    const result = await AppDataSource.query(
      `
      SELECT
        s.idsabor,
        s.nombre,
        s.estado,
        COUNT(*) OVER() AS total
      FROM sabor s
      WHERE
          ($1::text IS NULL OR s.nombre ILIKE '%' || $1::text || '%')
      AND ($2::int IS NULL OR s.estado = $2)
      ORDER BY s.idsabor
      LIMIT $3 OFFSET $4;
      `,
      [nombreParam, estadoParam, Number(limit), offset]
    );

    if (result.length === 0) {
      return res.json({
        total: 0,
        page: Number(page),
        limit: Number(limit),
        data: [],
      });
    }

    return res.json({
      total: result[0].total,
      page: Number(page),
      limit: Number(limit),
      data: result,
    });
  } catch (error) {
    console.error("Error real:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getSaboresActivos = async (req: Request, res: Response) => {
  try {
    const result = await AppDataSource.query(
      `SELECT s.idsabor, s.nombre
       FROM sabor s
       WHERE s.estado = 1
       ORDER BY s.nombre`
    );
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

    const sabor = new Sabor();
    sabor.Idsabor = await generarIdSecuencial("SAB");
    sabor.Nombre = nombre;
    sabor.Estado = 1;
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

    if (!nombre) {
      return res.status(400).json({ message: "El nombre es requerido" });
    }

    const sabor = await Sabor.findOne({ where: { Idsabor: id } });

    if (!sabor) {
      return res.status(404).json({ message: "El sabor no existe" });
    }

    sabor.Nombre = nombre;
    await sabor.save();

    return res.json({ message: "Sabor actualizado correctamente", sabor });
  } catch (error) {
    console.error("Error real:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const DeleteSabor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await AppDataSource.query(
      `UPDATE sabor
       SET estado = CASE WHEN estado = 1 THEN 0 ELSE 1 END
       WHERE idsabor = $1
       RETURNING estado AS estado`,
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({ message: "Sabor no encontrado" });
    }

    const nuevoEstado = Number(result[0][0].estado);
    const mensajeAccion = nuevoEstado === 1 ? "habilitaron" : "eliminaron";

    return res.json({
      message: `Se ${mensajeAccion} el sabor correctamente`,
    });
  } catch (error) {
    console.error("Error real:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};