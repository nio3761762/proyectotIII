import { Request, Response } from "express";
import { AppDataSource } from "../../db";

export const getReporteGastosGenerales = async (req: Request, res: Response) => {
  try {
    const { fechadesde, fechahasta } = req.query;
    if (!fechadesde || !fechahasta) {
      return res.status(400).json({ message: "Fechas obligatorias." });
    }

    const result = await AppDataSource.query(
      `
      SELECT
        gg.idgastogeneral,
        gg.nombre,
        gg.fecha,
        gg.costo,
        gg.estado
      FROM gasto_general gg
      WHERE gg.estado = 1
        AND gg.fecha BETWEEN $1 AND $2
      ORDER BY gg.fecha DESC, gg.nombre ASC
      `,
      [fechadesde, fechahasta]
    );

    const totalGastos = result.reduce((sum:any, r:any) => sum + Number(r.costo || 0), 0);

    return res.json({
      metadatos: { fechadesde, fechahasta },
      totalGastos,
      cantidad: result.length,
      gastos: result,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};
