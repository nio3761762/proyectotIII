import { Request, Response } from "express";
import { Horario } from "../entities/Horario";
import { generarIdSecuencial } from "../utils/idGenerator";


export const createHorario = async ({ HoraEntrada, HoraSalida }: { HoraEntrada: string, HoraSalida: string }) => {

  const nuevoId = await generarIdSecuencial('HOR'); 

  const horario = new Horario();
  horario.IdHorario = nuevoId;
  if (HoraEntrada) horario.HoraEntrada = HoraEntrada;
  if (HoraSalida) horario.HoraSalida = HoraSalida;
  await horario.save();

  return horario;
};

export const updateHorario = async ({ HorarioId, HoraEntrada, HoraSalida }: { HorarioId: string, HoraEntrada: string, HoraSalida: string }) => {

  const horario = await Horario.findOne({ where: { IdHorario: HorarioId } });


  if (!horario) {
    throw new Error(`El esrtado con ID ${horario} no existe.`);
  }

  if (HoraEntrada) horario.HoraEntrada = HoraEntrada;
  if (HoraSalida) horario.HoraSalida = HoraSalida;
  await horario.save();

  return horario;
};