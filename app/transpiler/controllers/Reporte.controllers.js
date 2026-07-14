"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReporteProduccionInsumosReal = exports.getReporteProductos = void 0;
// Este archivo se mantiene temporalmente mientras se termina la migración
// y para evitar errores de compilación en otras partes del sistema.
const getReporteProductos = async (req, res) => {
    return res.json({ message: "Utilice los nuevos endpoints especializados." });
};
exports.getReporteProductos = getReporteProductos;
const getReporteProduccionInsumosReal = async (req, res) => {
    // Implementar si es necesario
};
exports.getReporteProduccionInsumosReal = getReporteProduccionInsumosReal;
