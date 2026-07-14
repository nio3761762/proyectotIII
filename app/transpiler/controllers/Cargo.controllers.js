"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeEmpleadoCargo = exports.updateEmpleadoCargo = exports.createEmpleadoCargo = exports.verifyCargo = exports.getCargo = void 0;
const db_1 = require("../db");
const idGenerator_1 = require("../utils/idGenerator");
const EmpleadoCargo_1 = require("../entities/EmpleadoCargo");
const Empleado_controllers_1 = require("./Empleado.controllers");
const Cargo_1 = require("../entities/Cargo");
const error_handler_1 = require("../utils/error.handler");
const getCargo = async (req, res) => {
    try {
        const result = await db_1.AppDataSource.query(`
      SELECT 
         c.idcargo,
         c.nombre,
         c.descripcion
      FROM Cargo c;
    `);
        return res.json({ result });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getCargo = getCargo;
const verifyCargo = async ({ idcargo }) => {
    const existPersona = await Cargo_1.Cargo.findOne({ where: { IdCargo: idcargo } });
    if (!existPersona) {
        throw new error_handler_1.HttpError(404, `El cargo con ID ${idcargo} no existe.`);
    }
    return existPersona;
};
exports.verifyCargo = verifyCargo;
const createEmpleadoCargo = async ({ Idempleado, idcargo }) => {
    const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('EMPCR');
    const persona = new EmpleadoCargo_1.EmpleadoCargo();
    persona.IdEmpleadoCargo = nuevoId;
    persona.Empleado = await (0, Empleado_controllers_1.verifyEmpleado)(Idempleado);
    persona.Cargo = await (0, exports.verifyCargo)({ idcargo: idcargo });
    persona.FechaInicio = new Date();
    await persona.save();
    return persona;
};
exports.createEmpleadoCargo = createEmpleadoCargo;
const updateEmpleadoCargo = async ({ Idempleado, idcargoAnterior, idcargoNuevo }) => {
    // cerrar anterior
    await (0, exports.removeEmpleadoCargo)({
        Idempleado,
        idcargo: idcargoAnterior
    });
    // crear nuevo
    return await (0, exports.createEmpleadoCargo)({
        Idempleado,
        idcargo: idcargoNuevo
    });
};
exports.updateEmpleadoCargo = updateEmpleadoCargo;
const removeEmpleadoCargo = async ({ Idempleado, idcargo }) => {
    const actual = await EmpleadoCargo_1.EmpleadoCargo
        .createQueryBuilder("ec")
        .leftJoin("ec.Empleado", "e")
        .leftJoin("ec.Cargo", "c")
        .where("e.idempleado = :idempleado", { idempleado: Idempleado })
        .andWhere("c.idcargo = :idcargo", { idcargo })
        .andWhere("ec.fechafin IS NULL")
        .getOne();
    if (!actual)
        return null;
    actual.FechaFin = new Date();
    actual.Estado = 0;
    await actual.save();
    return actual;
};
exports.removeEmpleadoCargo = removeEmpleadoCargo;
