"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEstado = void 0;
const Estado_1 = require("../entities/Estado");
const verifyEstado = async ({ EstadoId }) => {
    const existEstado = await Estado_1.Estado.findOne({ where: { IdEstado: EstadoId } });
    if (!existEstado) {
        throw new Error(`El estado con ID ${existEstado} no existe.`);
    }
    return existEstado;
};
exports.verifyEstado = verifyEstado;
