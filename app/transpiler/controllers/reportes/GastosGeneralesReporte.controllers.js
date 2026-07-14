"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReporteGastosGenerales = void 0;
const db_1 = require("../../db");
const getReporteGastosGenerales = async (req, res) => {
    try {
        const { fechadesde, fechahasta } = req.query;
        if (!fechadesde || !fechahasta) {
            return res.status(400).json({ message: "Fechas obligatorias." });
        }
        const result = await db_1.AppDataSource.query(`
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
      `, [fechadesde, fechahasta]);
        const totalGastos = result.reduce((sum, r) => sum + Number(r.costo || 0), 0);
        return res.json({
            metadatos: { fechadesde, fechahasta },
            totalGastos,
            cantidad: result.length,
            gastos: result,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getReporteGastosGenerales = getReporteGastosGenerales;
