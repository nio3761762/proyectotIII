"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePresentacion = exports.getbypresentacion = exports.getPresentacion = exports.getPresentaciones = exports.verifyPresentacion = exports.updatePresentacion = exports.AddPresentacion = void 0;
const error_handler_1 = require("../utils/error.handler");
const idGenerator_1 = require("../utils/idGenerator");
const Presentacion_1 = require("../entities/Presentacion");
const db_1 = require("../db");
const AddPresentacion = async (req, res) => {
    try {
        const { Nombre, Abreviatura } = req.body;
        const nuevo = new Presentacion_1.Presentacion();
        const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('PREN');
        nuevo.IdPresentacion = nuevoId;
        nuevo.Nombre = Nombre;
        nuevo.Abreviatura = Abreviatura;
        nuevo.FechaRegistro = new Date();
        await nuevo.save();
        return res.json({ message: "Se registro la presentacion" });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.AddPresentacion = AddPresentacion;
const updatePresentacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { Nombre, Abreviatura } = req.body;
        const existe = await Presentacion_1.Presentacion.findOne({
            where: { IdPresentacion: id },
        });
        if (!existe)
            return res.status(404).json({ message: "La presentacion no se encuentra registrada" });
        existe.Nombre = Nombre;
        existe.FechaActualizacion = new Date();
        existe.Abreviatura = Abreviatura;
        await existe.save();
        return res.json({ message: "Se actualizo la presentacion" });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.updatePresentacion = updatePresentacion;
const verifyPresentacion = async ({ PresentacionId }) => {
    const exist = await Presentacion_1.Presentacion.findOne({ where: { IdPresentacion: PresentacionId } });
    if (!exist) {
        throw new error_handler_1.HttpError(404, `La presentacion con ID ${PresentacionId} no existe.`);
    }
    return exist;
};
exports.verifyPresentacion = verifyPresentacion;
const getPresentaciones = async (req, res) => {
    try {
        const result = await db_1.AppDataSource.query(`SELECT p.idpresentacion , p.nombre
        FROM presentacion p
        WHERE p.estado = 1 `);
        return res.json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getPresentaciones = getPresentaciones;
const getPresentacion = async (req, res) => {
    try {
        const { search, estado, page = 1, limit = 8 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        //  limpiar parámetros
        const nombreParam = typeof search === "string" && search.trim() !== ""
            ? search.trim()
            : null;
        const estadoParam = estado !== undefined && estado !== ""
            ? Number(estado)
            : null;
        const result = await db_1.AppDataSource.query(`
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
      `, [
            nombreParam,
            estadoParam,
            Number(limit),
            offset
        ]);
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
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getPresentacion = getPresentacion;
const getbypresentacion = async (req, res) => {
    try {
        const { id } = req.body;
        const presentacion = await Presentacion_1.Presentacion.findOne({
            where: { IdPresentacion: id }
        });
        if (!presentacion) {
            return res.status(404).json({ message: "presentacion no encontrado" });
        }
        return res.json(presentacion);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getbypresentacion = getbypresentacion;
const deletePresentacion = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.AppDataSource.query(`UPDATE presentacion 
   SET estado = CASE WHEN estado = 1 THEN 0 ELSE 1 END
   WHERE IdPresentacion = $1
   RETURNING estado AS estado`, [id]);
        // ✅ aquí está el cambio
        if (result.length === 0) {
            return res.status(404).json({ message: "Presentacion no encontrado" });
        }
        const nuevoEstado = Number(result[0][0].estado);
        const mensajeAccion = nuevoEstado === 1 ? "habilitaron" : "eliminaron";
        return res.json({
            message: `Se ${mensajeAccion} los datos de la presentacion correctamente`,
        });
    }
    catch (error) {
        console.error("Error al cambiar el estado del usuario:", error);
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.deletePresentacion = deletePresentacion;
