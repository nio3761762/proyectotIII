"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.anularGastoGeneral = exports.updateGastoGeneral = exports.getGastoGeneral = exports.getGastosGenerales = exports.registrarGastoGeneral = void 0;
const db_1 = require("../db");
const GastoGeneral_1 = require("../entities/GastoGeneral");
const error_handler_1 = require("../utils/error.handler");
const idGenerator_1 = require("../utils/idGenerator");
const Fecha_1 = require("../utils/Fecha");
const { fecha: fechaActual } = (0, Fecha_1.getFechaHoraBolivia)();
const registrarGastoGeneral = async (req, res) => {
    try {
        const { nombre, fecha, costo } = req.body;
        if (!nombre || costo === undefined) {
            throw new error_handler_1.HttpError(400, "Nombre y costo son requeridos.");
        }
        const nuevoId = await (0, idGenerator_1.generarIdSecuencial)("GG");
        const gasto = new GastoGeneral_1.GastoGeneral();
        gasto.IdGastoGeneral = nuevoId;
        gasto.Nombre = nombre;
        gasto.Fecha = fecha || fechaActual;
        gasto.Costo = costo;
        await gasto.save();
        return res.json({ message: "Gasto general registrado exitosamente.", data: gasto });
    }
    catch (error) {
        if (error instanceof error_handler_1.HttpError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.registrarGastoGeneral = registrarGastoGeneral;
const getGastosGenerales = async (req, res) => {
    try {
        const { search, fechadesde, fechahasta, page = 1, limit = 10 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const searchParam = typeof search === "string" && search.trim() !== "" ? search.trim() : null;
        const result = await db_1.AppDataSource.query(`
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
      `, [searchParam, fechadesde || null, fechahasta || null, Number(limit), offset]);
        if (result.length === 0) {
            return res.json({ total: 0, page: Number(page), limit: Number(limit), data: [] });
        }
        return res.json({
            total: result[0].total,
            page: Number(page),
            limit: Number(limit),
            data: result,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getGastosGenerales = getGastosGenerales;
const getGastoGeneral = async (req, res) => {
    try {
        const { id } = req.params;
        const gasto = await GastoGeneral_1.GastoGeneral.findOne({ where: { IdGastoGeneral: id } });
        if (!gasto) {
            return res.status(404).json({ message: "Gasto general no encontrado." });
        }
        return res.json(gasto);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getGastoGeneral = getGastoGeneral;
const updateGastoGeneral = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, fecha, costo } = req.body;
        const gasto = await GastoGeneral_1.GastoGeneral.findOne({ where: { IdGastoGeneral: id } });
        if (!gasto) {
            return res.status(404).json({ message: "Gasto general no encontrado." });
        }
        if (nombre)
            gasto.Nombre = nombre;
        if (fecha)
            gasto.Fecha = fecha;
        if (costo !== undefined)
            gasto.Costo = costo;
        await gasto.save();
        return res.json({ message: "Gasto general actualizado exitosamente.", data: gasto });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.updateGastoGeneral = updateGastoGeneral;
const anularGastoGeneral = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.AppDataSource.query(`UPDATE gasto_general SET estado = CASE WHEN estado = 1 THEN 0 ELSE 1 END WHERE idgastogeneral = $1 RETURNING estado`, [id]);
        if (result.length === 0) {
            return res.status(404).json({ message: "Gasto general no encontrado." });
        }
        const nuevoEstado = Number(result[0].estado);
        const mensaje = nuevoEstado === 1 ? "habilitado" : "anulado";
        return res.json({ message: `Gasto general ${mensaje} correctamente.` });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.anularGastoGeneral = anularGastoGeneral;
