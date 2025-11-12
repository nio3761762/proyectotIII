"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyGenero = void 0;
const Genero_1 = require("../entities/Genero");
const verifyGenero = async ({ GeneroId }) => {
    const existGenero = await Genero_1.Genero.findOne({ where: { IdGenero: GeneroId } });
    if (!existGenero) {
        throw new Error(`El genero con ID ${existGenero} no existe.`);
    }
    return existGenero;
};
exports.verifyGenero = verifyGenero;
