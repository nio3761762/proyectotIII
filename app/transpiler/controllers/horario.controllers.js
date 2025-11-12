"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateHorario = exports.createHorario = void 0;
const Horario_1 = require("../entities/Horario");
const idGenerator_1 = require("../utils/idGenerator");
const createHorario = async ({ HoraEntrada, HoraSalida }) => {
    const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('HOR');
    const horario = new Horario_1.Horario();
    horario.IdHorario = nuevoId;
    if (HoraEntrada)
        horario.HoraEntrada = HoraEntrada;
    if (HoraSalida)
        horario.HoraSalida = HoraSalida;
    await horario.save();
    return horario;
};
exports.createHorario = createHorario;
const updateHorario = async ({ HorarioId, HoraEntrada, HoraSalida }) => {
    const horario = await Horario_1.Horario.findOne({ where: { IdHorario: HorarioId } });
    if (!horario) {
        throw new Error(`El esrtado con ID ${horario} no existe.`);
    }
    if (HoraEntrada)
        horario.HoraEntrada = HoraEntrada;
    if (HoraSalida)
        horario.HoraSalida = HoraSalida;
    await horario.save();
    return horario;
};
exports.updateHorario = updateHorario;
