"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmpleadosSinSucursal = exports.asignarEmpleadosSucursal = void 0;
const EmpleadoSucursal_1 = require("../entities/EmpleadoSucursal");
const Empleado_1 = require("../entities/Empleado");
const Sucursal_controllers_1 = require("./Sucursal.controllers");
const db_1 = require("../db");
const idGenerator_1 = require("../utils/idGenerator");
const asignarEmpleadosSucursal = async (req, res) => {
    try {
        const { IdEmpleados, IdSucursal } = req.body;
        if (!Array.isArray(IdEmpleados)) {
            return res.status(400).json({ message: "IdEmpleados debe ser un array." });
        }
        const sucursal = await (0, Sucursal_controllers_1.verifySucursal)({ SucursalId: IdSucursal });
        if (!sucursal) {
            return res.status(404).json({ message: "Sucursal no encontrada" });
        }
        const asignacionesActuales = await EmpleadoSucursal_1.EmpleadoSucursal.find({
            where: { Sucursal: { IdSucursal: IdSucursal } },
            relations: ["Empleado"],
        });
        if (IdEmpleados.length > 0) {
            const seleccionados = new Set(IdEmpleados.map((e) => e.id));
            for (const asignado of asignacionesActuales) {
                const empId = asignado.Empleado.IdEmpleado;
                if (seleccionados.has(empId)) {
                    if (asignado.Estado !== 1) {
                        asignado.Estado = 1;
                        await asignado.save();
                    }
                    seleccionados.delete(empId);
                }
                else {
                    if (asignado.Estado !== 0) {
                        asignado.Estado = 0;
                        asignado.FechaFin = new Date();
                        await asignado.save();
                    }
                }
            }
            for (const nuevoId of seleccionados) {
                const activa = await EmpleadoSucursal_1.EmpleadoSucursal.findOne({
                    where: { Empleado: { IdEmpleado: nuevoId }, Estado: 1 },
                    relations: ["Sucursal"],
                });
                if (activa && activa.Sucursal.IdSucursal !== IdSucursal) {
                    activa.Estado = 0;
                    activa.FechaFin = new Date();
                    await activa.save();
                }
                const nueva = new EmpleadoSucursal_1.EmpleadoSucursal();
                nueva.IdEmpleadoSucursal = await (0, idGenerator_1.generarIdSecuencial)('SCEMP');
                nueva.Sucursal = await (0, Sucursal_controllers_1.verifySucursal)({ SucursalId: IdSucursal });
                const empleado = await Empleado_1.Empleado.findOneBy({ IdEmpleado: nuevoId });
                if (!empleado) {
                    return res.status(404).json({ message: `Empleado ${nuevoId} no encontrado` });
                }
                nueva.Empleado = empleado;
                nueva.FechaInicio = new Date();
                nueva.Estado = 1;
                await nueva.save();
            }
        }
        else {
            for (const asignado of asignacionesActuales) {
                if (asignado.Estado !== 0) {
                    asignado.Estado = 0;
                    asignado.FechaFin = new Date();
                    await asignado.save();
                }
            }
        }
        return res.json({ message: "Empleados asignados a la sucursal correctamente" });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.asignarEmpleadosSucursal = asignarEmpleadosSucursal;
const getEmpleadosSinSucursal = async (req, res) => {
    try {
        const result = await db_1.AppDataSource.query(`
      SELECT
        e.idempleado,
        row_to_json(p) AS persona,
        (
          SELECT json_build_object(
            'idcargo', c.idcargo,
            'nombre', c.nombre
          )
          FROM empleado_cargo ec
          JOIN cargo c ON c.idcargo = ec.idcargo
          WHERE ec.idempleado = e.idempleado
          AND ec.fechafin IS NULL
          LIMIT 1
        ) AS cargo
      FROM empleado e
      JOIN persona p ON p.idpersona = e.idpersona
      WHERE e.estado = 1
      AND NOT EXISTS (
        SELECT 1
        FROM empleado_sucursal es
        WHERE es.idempleado = e.idempleado
        AND es.estado = 1
        AND es.fechafin IS NULL
      );
    `);
        return res.json(result.length > 0 ? result : []);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getEmpleadosSinSucursal = getEmpleadosSinSucursal;
