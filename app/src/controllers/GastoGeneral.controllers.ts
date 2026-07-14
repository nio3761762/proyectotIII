import { Request, Response } from "express";
import { AppDataSource } from "../db";
import { GastoGeneral } from "../entities/GastoGeneral";
import { HttpError } from "../utils/error.handler";
import { generarIdSecuencial } from "../utils/idGenerator";
import { getFechaHoraBolivia } from "../utils/Fecha";

const { fecha: fechaActual } = getFechaHoraBolivia();

export const registrarGastoGeneral = async (req: Request, res: Response) => {
  try {
    const { nombre, fecha, costo } = req.body;

    if (!nombre || costo === undefined) {
      throw new HttpError(400, "Nombre y costo son requeridos.");
    }

    const nuevoId = await generarIdSecuencial("GG");
    const gasto = new GastoGeneral();
    gasto.IdGastoGeneral = nuevoId;
    gasto.Nombre = nombre;
    gasto.Fecha = fecha || fechaActual;
    gasto.Costo = costo;

    await gasto.save();

    return res.json({ message: "Gasto general registrado exitosamente.", data: gasto });
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const getGastosGenerales = async (req: Request, res: Response) => {
  try {
    const { search, fechadesde, fechahasta, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const searchParam = typeof search === "string" && search.trim() !== "" ? search.trim() : null;

    const result = await AppDataSource.query(
      `
      SELECT
        gg.idgastogeneral,
        gg.nombre,
        gg.fecha,
        gg.costo,
        gg.estado,
        COUNT(*) OVER() AS total
      FROM gasto_general gg
      WHERE
        gg.estado = 1
        AND ($1::text IS NULL OR gg.nombre ILIKE '%' || $1::text || '%')
        AND ($2::date IS NULL OR gg.fecha >= $2::date)
        AND ($3::date IS NULL OR gg.fecha <= $3::date)
      ORDER BY gg.fecha DESC, gg.nombre ASC
      LIMIT $4 OFFSET $5
      `,
      [searchParam, fechadesde || null, fechahasta || null, Number(limit), offset]
    );

    if (result.length === 0) {
      return res.json({ total: 0, page: Number(page), limit: Number(limit), data: [] });
    }

    return res.json({
      total: result[0].total,
      page: Number(page),
      limit: Number(limit),
      data: result,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const getGastoGeneral = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const gasto = await GastoGeneral.findOne({ where: { IdGastoGeneral: id } });

    if (!gasto) {
      return res.status(404).json({ message: "Gasto general no encontrado." });
    }

    return res.json(gasto);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const updateGastoGeneral = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre, fecha, costo } = req.body;

    const gasto = await GastoGeneral.findOne({ where: { IdGastoGeneral: id } });
    if (!gasto) {
      return res.status(404).json({ message: "Gasto general no encontrado." });
    }

    if (nombre) gasto.Nombre = nombre;
    if (fecha) gasto.Fecha = fecha;
    if (costo !== undefined) gasto.Costo = costo;

    await gasto.save();
    return res.json({ message: "Gasto general actualizado exitosamente.", data: gasto });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const anularGastoGeneral = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await AppDataSource.query(
      `UPDATE gasto_general SET estado = CASE WHEN estado = 1 THEN 0 ELSE 1 END WHERE idgastogeneral = $1 RETURNING estado`,
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({ message: "Gasto general no encontrado." });
    }

    const nuevoEstado = Number(result[0].estado);
    const mensaje = nuevoEstado === 1 ? "habilitado" : "anulado";

    return res.json({ message: `Gasto general ${mensaje} correctamente.` });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};
