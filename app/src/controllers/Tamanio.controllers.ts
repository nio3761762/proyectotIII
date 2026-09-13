import { AppDataSource } from "../db";
import { Request, Response } from "express";
import { Tamanio } from "../entities/Tamanio";
import { generarIdSecuencial } from "../utils/idGenerator";

export const getTamanio = async (req: Request, res: Response) => {
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
        t.idtamanio,
        t.nombre,
        t.estado,
        COUNT(*) OVER() AS total
      FROM tamanio t
      WHERE
          ($1::text IS NULL OR t.nombre ILIKE '%' || $1::text || '%')
      AND ($2::int IS NULL OR t.estado = $2)
      ORDER BY t.idtamanio
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

export const getTamaniosActivos = async (req: Request, res: Response) => {
  try {
    const result = await AppDataSource.query(
      `SELECT t.idtamanio, t.nombre
       FROM tamanio t
       WHERE t.estado = 1
       ORDER BY t.nombre`
    );
    return res.json(result);
  } catch (error) {
    console.error("Error real:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const CreateTamanio = async (req: Request, res: Response) => {
  try {
    const { nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({ message: "El nombre es requerido" });
    }

    const tamanio = new Tamanio();
    tamanio.Idtamanio = await generarIdSecuencial("TAM");
    tamanio.Nombre = nombre;
    tamanio.Estado = 1;
    await tamanio.save();

    return res.json({ message: "Tamaño creado correctamente", tamanio });
  } catch (error) {
    console.error("Error real:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const UpdateTamanio = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({ message: "El nombre es requerido" });
    }

    const tamanio = await Tamanio.findOne({ where: { Idtamanio: id } });

    if (!tamanio) {
      return res.status(404).json({ message: "El tamaño no existe" });
    }

    tamanio.Nombre = nombre;
    await tamanio.save();

    return res.json({ message: "Tamaño actualizado correctamente", tamanio });
  } catch (error) {
    console.error("Error real:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const DeleteTamanio = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await AppDataSource.query(
      `UPDATE tamanio
       SET estado = CASE WHEN estado = 1 THEN 0 ELSE 1 END
       WHERE idtamanio = $1
       RETURNING estado AS estado`,
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({ message: "Tamaño no encontrado" });
    }

    const nuevoEstado = Number(result[0][0].estado);
    const mensajeAccion = nuevoEstado === 1 ? "habilitaron" : "eliminaron";

    return res.json({
      message: `Se ${mensajeAccion} el tamaño correctamente`,
    });
  } catch (error) {
    console.error("Error real:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};