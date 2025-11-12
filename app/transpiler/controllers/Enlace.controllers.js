"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEnlace = void 0;
const Enlace_1 = require("../entities/Enlace");
const idGenerator_1 = require("../utils/idGenerator");
const createEnlace = async ({ archivo }) => {
    const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('EN');
    const existEnlace = new Enlace_1.Enlace();
    existEnlace.IdEnlace = nuevoId;
    existEnlace.Enlace = archivo;
    await existEnlace.save();
    return existEnlace;
};
exports.createEnlace = createEnlace;
