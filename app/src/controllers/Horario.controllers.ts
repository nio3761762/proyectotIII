import { Request, Response } from "express";
import { Horario } from "../entities/Horario";
import { generarIdSecuencial } from "../utils/idGenerator";
import { verifySucursal } from "./Sucursal.controllers";


export const createHorario = async ({
  HoraEntrada,
  HoraSalida,
  Dia,
  IdSucursal,
  tipo
}: {
  HoraEntrada: string,
  HoraSalida: string,
  Dia: string,
  IdSucursal: string
  tipo:string
}) => {

  const nuevoId = await generarIdSecuencial('HOR'); 

  const horario = new Horario();
  horario.IdHorario = nuevoId;

  if (HoraEntrada) horario.HoraEntrada = HoraEntrada;
  if (HoraSalida) horario.HoraSalida = HoraSalida;
  if (Dia) horario.Dia = Dia; // ✅ consistente
  if (tipo) horario.Tipo = tipo
  if (IdSucursal) horario.Sucursal = await  verifySucursal({SucursalId :IdSucursal });
    
  await horario.save();

  return horario;
};

export const updateHorario = async ({ HorarioId, HoraEntrada, HoraSalida, Dia,Tipo,
  IdSucursal }: { HorarioId: string, HoraEntrada: string, HoraSalida: string, Dia: string, IdSucursal: string, Tipo:string }) => {
if(HorarioId){
  const horario = await Horario.findOne({ where: { IdHorario: HorarioId } });


  if (!horario) {
    throw new Error(`El esrtado con ID ${horario} no existe.`);
  }

  if (HoraEntrada) horario.HoraEntrada = HoraEntrada;
  if (HoraSalida) horario.HoraSalida = HoraSalida;
  await horario.save();

  return horario;
}
  else
    return await createHorario( {HoraEntrada:HoraEntrada, HoraSalida: HoraSalida, Dia:Dia , IdSucursal: IdSucursal, tipo:Tipo})
};