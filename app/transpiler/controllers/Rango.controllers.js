"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRango = exports.createRango = exports.verifyRango = void 0;
const Rango_1 = require("../entities/Rango");
const Promocion_controllers_1 = require("./Promocion.controllers");
const error_handler_1 = require("../utils/error.handler");
const verifyRango = async ({ Rangoid }) => {
    const existrango = await Rango_1.Rango.findOne({ where: { IdRango: Rangoid } });
    if (!existrango) {
        throw new error_handler_1.HttpError(404, `El rango con ID ${Rangoid} no existe.`);
    }
    return existrango;
};
exports.verifyRango = verifyRango;
const createRango = async ({ IdPromocion, HoraInicio, HoraFin, FechaInicio, FechaFin }) => {
    const result = await Rango_1.Rango.createQueryBuilder("Rango")
        .select("MAX(CAST(SUBSTRING(Rango.IdRango, 4) AS INTEGER))", "ultimoNumero")
        .where("Rango.IdRango LIKE 'RG-%'")
        .getRawOne();
    const nuevoNumero = (result?.ultimoNumero || 0) + 1;
    const nuevoId = `RG-${nuevoNumero}`;
    const nuevoRango = new Rango_1.Rango();
    nuevoRango.IdRango = nuevoId;
    nuevoRango.FechaInicio = FechaInicio;
    nuevoRango.FechaFin = FechaFin;
    nuevoRango.HoraInicio = HoraInicio;
    nuevoRango.HoraFin = HoraFin;
    nuevoRango.Promocion = await (0, Promocion_controllers_1.verifyPromocion)({ PromocionId: IdPromocion });
    await nuevoRango.save();
    return nuevoRango;
};
exports.createRango = createRango;
const updateRango = async ({ RangoId, HoraInicio, HoraFin, FechaInicio, FechaFin }) => {
    const existrango = await Rango_1.Rango.findOne({ where: { IdRango: RangoId } });
    if (!existrango) {
        throw new Error("No existe registro el tiempo de duracion");
    }
    if (FechaInicio)
        existrango.FechaInicio = FechaInicio;
    if (FechaFin)
        existrango.FechaFin = FechaFin;
    if (HoraInicio)
        existrango.HoraInicio = HoraInicio;
    if (HoraFin)
        existrango.HoraFin = HoraFin;
    await existrango.save();
    return existrango;
};
exports.updateRango = updateRango;
