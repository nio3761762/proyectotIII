import { Request, Response } from "express";
import { EmpleadoSucursal } from "../entities/EmpleadoSucursal";
import { Empleado } from "../entities/Empleado";
import { verifySucursal } from "./Sucursal.controllers";
import { AppDataSource } from "../db";
import { generarIdSecuencial } from "../utils/idGenerator";

export const asignarEmpleadosSucursal = async (req: Request, res: Response) => {
  try {
    const { IdEmpleados, IdSucursal } = req.body;

    if (!Array.isArray(IdEmpleados)) {
      return res.status(400).json({ message: "IdEmpleados debe ser un array." });
    }

    const sucursal = await verifySucursal({ SucursalId: IdSucursal });
    if (!sucursal) {
      return res.status(404).json({ message: "Sucursal no encontrada" });
    }

    const asignacionesActuales = await EmpleadoSucursal.find({
      where: { Sucursal: { IdSucursal: IdSucursal } },
      relations: ["Empleado"],
    });

    if (IdEmpleados.length > 0) {
      const seleccionados = new Set(IdEmpleados.map((e: { id: string }) => e.id));

      for (const asignado of asignacionesActuales) {
        const empId = asignado.Empleado.IdEmpleado;
        if (seleccionados.has(empId)) {
          if (asignado.Estado !== 1) {
            asignado.Estado = 1;
            await asignado.save();
          }
          seleccionados.delete(empId);
        } else {
          if (asignado.Estado !== 0) {
            asignado.Estado = 0;
            asignado.FechaFin = new Date();
            await asignado.save();
          }
        }
      }

      for (const nuevoId of seleccionados) {
        const activa = await EmpleadoSucursal.findOne({
          where: { Empleado: { IdEmpleado: nuevoId }, Estado: 1 },
          relations: ["Sucursal"],
        });

        if (activa && activa.Sucursal.IdSucursal !== IdSucursal) {
          activa.Estado = 0;
          activa.FechaFin = new Date();
          await activa.save();
        }

        const nueva = new EmpleadoSucursal();
        nueva.IdEmpleadoSucursal = await generarIdSecuencial('SCEMP');
        nueva.Sucursal = await verifySucursal({ SucursalId: IdSucursal });
        const empleado = await Empleado.findOneBy({ IdEmpleado: nuevoId });
        if (!empleado) {
          return res.status(404).json({ message: `Empleado ${nuevoId} no encontrado` });
        }
        nueva.Empleado = empleado;
        nueva.FechaInicio = new Date();
        nueva.Estado = 1;
        await nueva.save();
      }
    } else {
      for (const asignado of asignacionesActuales) {
        if (asignado.Estado !== 0) {
          asignado.Estado = 0;
          asignado.FechaFin = new Date();
          await asignado.save();
        }
      }
    }

    return res.json({ message: "Empleados asignados a la sucursal correctamente" });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const getEmpleadosSinSucursal = async (req: Request, res: Response) => {
  try {
    const result = await AppDataSource.query(`
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
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};
