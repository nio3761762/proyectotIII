import { Request, Response } from "express";
import { AppDataSource } from "../db";
import { generarIdSecuencial } from "../utils/idGenerator";
import { EmpleadoCargo } from "../entities/EmpleadoCargo";
import { verifyEmpleado } from "./Empleado.controllers";
import { Cargo } from "../entities/Cargo";
import { HttpError } from "../utils/error.handler";

export const getCargo = async (req: Request, res: Response) => {
    try {
        const result = await AppDataSource.query(`
      SELECT 
         c.idcargo,
         c.nombre,
         c.descripcion
      FROM Cargo c;
    `);

    return res.json({result});

    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message })
        }
    }
}
export const verifyCargo = async ({ idcargo }: { idcargo: string }) => {

const existPersona = await Cargo.findOne({ where: { IdCargo: idcargo } });
       
   if (!existPersona) {
    throw new HttpError(404,`El cargo con ID ${idcargo} no existe.`);

  }
  
    return existPersona;
};

export const createEmpleadoCargo = async ({ Idempleado,  idcargo }: { Idempleado:string,  idcargo:string }) => {
 const nuevoId = await generarIdSecuencial('EMPCR');
  const persona = new EmpleadoCargo();
  persona.IdEmpleadoCargo = nuevoId   
  persona.Empleado = await verifyEmpleado(Idempleado)
  persona.Cargo = await verifyCargo({idcargo:idcargo})
  persona.FechaInicio = new Date();
  await persona.save();

   return persona;
};
export const updateEmpleadoCargo = async ({
  Idempleado,
  idcargoAnterior,
  idcargoNuevo
}: {
  Idempleado: string,
  idcargoAnterior: string,
  idcargoNuevo: string
}) => {

  // cerrar anterior
  await removeEmpleadoCargo({
    Idempleado,
    idcargo: idcargoAnterior
  });

  // crear nuevo
  return await createEmpleadoCargo({
    Idempleado,
    idcargo: idcargoNuevo
  });
};
export const removeEmpleadoCargo = async ({
  Idempleado,
  idcargo
}: {
  Idempleado: string,
  idcargo: string
}) => {

  const actual = await EmpleadoCargo
    .createQueryBuilder("ec")
    .leftJoin("ec.Empleado", "e")
    .leftJoin("ec.Cargo", "c")
    .where("e.idempleado = :idempleado", { idempleado: Idempleado })
    .andWhere("c.idcargo = :idcargo", { idcargo })
    .andWhere("ec.fechafin IS NULL")
    .getOne();

  if (!actual) return null;

  actual.FechaFin = new Date();
  actual.Estado = 0;

  await actual.save();

  return actual;
};