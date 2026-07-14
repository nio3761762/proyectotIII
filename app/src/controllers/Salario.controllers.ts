import { Request, Response } from "express";
import { Salario } from "../entities/Salario";
import { generarIdSecuencial } from "../utils/idGenerator";
import { verifyEmpleado } from "./Empleado.controllers";


export const createSalario = async ({
  salario,
  fecha,
  idempleado
}: {
  salario: number,
  fecha: string,
  idempleado: string
}) => {

  const result = await generarIdSecuencial('SAL');

  const nuevo = new Salario();
  nuevo.IdSalario = result;
  nuevo.Salario = salario;
  nuevo.FechaInicio = fecha ? new Date(fecha) : new Date();
  nuevo.Empleado = await verifyEmpleado( idempleado );

  await nuevo.save();

  return nuevo;
};
export const updateSalario = async ({
  salario,
  fecha,
  idempleado
}: {
  salario: number,
  fecha: string,
  idempleado: string
}) => {

 const salarioActual = await Salario
  .createQueryBuilder("s")
  .leftJoin("s.Empleado", "e")
  .where("e.idempleado = :idempleado", { idempleado })
  .andWhere("s.fechafin IS NULL")
  .getOne();
  
  // 🔍 validar si es el mismo salario
  if (salarioActual && Number(salarioActual.Salario) === salario) {
    return salarioActual; // no haces nada
  }

  // 🔴 cerrar salario actual
  if (salarioActual) {
    salarioActual.FechaFin = new Date();
    salarioActual.Estado = 0;
    await salarioActual.save();
  }

  // 🟢 crear nuevo salario
  return await createSalario({ salario, fecha, idempleado });
};