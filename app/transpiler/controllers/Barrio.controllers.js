"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBarrio = exports.getDistrito = exports.getCiudad = exports.getDepartamento = exports.verifyBarrio = exports.getBarrios = void 0;
const Barrio_1 = require("../entities/Barrio");
const Ciudad_1 = require("../entities/Ciudad");
const Distritos_1 = require("../entities/Distritos");
const db_1 = require("../db");
const getBarrios = async (req, res) => {
    try {
        const result = await db_1.AppDataSource.query(`
      SELECT COALESCE(
       json_agg(  
      json_build_object(
          'idbarrio', b.IdBarrio,
          'nombre', b.Nombre
    )
          ), 
           '[]'::json
      ) AS barrios
      FROM Barrio b;
    `);
        return res.json(result[0].barrios);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getBarrios = getBarrios;
const verifyBarrio = async ({ BarrioId }) => {
    const existBarrio = await Barrio_1.Barrio.findOne({ where: { IdBarrio: BarrioId } });
    if (!existBarrio) {
        throw new Error(`El Barrio con ID ${existBarrio} no existe.`);
    }
    return existBarrio;
};
exports.verifyBarrio = verifyBarrio;
const getDepartamento = async (req, res) => {
    try {
        const result = await db_1.AppDataSource.query(`
      SELECT COALESCE(
       json_agg(  
      json_build_object(
          'IdDepto', b.iddepto,
          'Nombre', b.Nombre
    )
          ), 
           '[]'::json
      ) AS barrios
      FROM Departamento b;
    `);
        return res.json(result[0].barrios);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getDepartamento = getDepartamento;
const getCiudad = async (req, res) => {
    try {
        const { id } = req.params;
        const barrios = await Ciudad_1.Ciudad.find({
            where: { Departamento: { IdDepto: id } }
        });
        return res.json(barrios);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getCiudad = getCiudad;
const getDistrito = async (req, res) => {
    try {
        const { id } = req.params;
        const barrios = await Distritos_1.Distritos.find({
            where: { Ciudad: { IdCiudad: id } }
        });
        return res.json(barrios);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getDistrito = getDistrito;
const getBarrio = async (req, res) => {
    try {
        const { id } = req.params;
        const barrios = await Barrio_1.Barrio.find({
            where: { Distrito: { IdDistrito: id } }
        });
        return res.json(barrios);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getBarrio = getBarrio;
