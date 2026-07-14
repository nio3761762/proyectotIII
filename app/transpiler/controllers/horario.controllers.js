"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateHorario = exports.createHorario = void 0;
const Horario_1 = require("../entities/Horario");
const idGenerator_1 = require("../utils/idGenerator");
const Sucursal_controllers_1 = require("./Sucursal.controllers");
const createHorario = async ({ HoraEntrada, HoraSalida, Dia, IdSucursal, tipo }) => {
    const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('HOR');
    const horario = new Horario_1.Horario();
    horario.IdHorario = nuevoId;
    if (HoraEntrada)
        horario.HoraEntrada = HoraEntrada;
    if (HoraSalida)
        horario.HoraSalida = HoraSalida;
    if (Dia)
        horario.Dia = Dia; // ✅ consistente
    if (tipo)
        horario.Tipo = tipo;
    if (IdSucursal)
        horario.Sucursal = await (0, Sucursal_controllers_1.verifySucursal)({ SucursalId: IdSucursal });
    await horario.save();
    return horario;
};
exports.createHorario = createHorario;
const updateHorario = async ({ HorarioId, HoraEntrada, HoraSalida, Dia, Tipo, IdSucursal }) => {
    if (HorarioId) {
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
    }
    else
        return await (0, exports.createHorario)({ HoraEntrada: HoraEntrada, HoraSalida: HoraSalida, Dia: Dia, IdSucursal: IdSucursal, tipo: Tipo });
};
exports.updateHorario = updateHorario;
