"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReporte = exports.updateReporte = exports.getReporteById = exports.getReportes = exports.createReporte = void 0;
const Reporte_1 = require("../entities/Reporte");
const Users_1 = require("../entities/Users");
// Crear un nuevo reporte
const createReporte = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Usuario_Id, FechaCreacion, FiltrosAplicados, UbicacionArchivo, Tipo, Estado, } = req.body;
        // Verificar que el usuario existe
        const usuario = yield Users_1.Usuario.findOne({ where: { Usuario: Usuario_Id } });
        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        // Crear un nuevo reporte
        const reporte = new Reporte_1.Reportes();
        reporte.Usuario_Id = Usuario_Id;
        reporte.FechaCreacion = FechaCreacion;
        reporte.FiltrosAplicados = FiltrosAplicados;
        reporte.UbicacionArchivo = UbicacionArchivo;
        reporte.Tipo = Tipo;
        reporte.Estado = Estado;
        // Guardar en la base de datos
        yield reporte.save();
        return res.status(201).json(reporte);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
});
exports.createReporte = createReporte;
// Obtener todos los reportes
const getReportes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reportes = yield Reporte_1.Reportes.find({
            relations: ["usuario"],
        });
        return res.status(200).json(reportes);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
});
exports.getReportes = getReportes;
// Obtener un reporte por ID
const getReporteById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Id_Reporte } = req.params;
        const reporte = yield Reporte_1.Reportes.findOne({
            where: { Id_Reporte: parseInt(Id_Reporte) },
            relations: ["usuario"],
        });
        if (!reporte) {
            return res.status(404).json({ message: "Reporte no encontrado" });
        }
        return res.status(200).json(reporte);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
});
exports.getReporteById = getReporteById;
// Actualizar un reporte
const updateReporte = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Id_Reporte } = req.params;
        const { FiltrosAplicados, UbicacionArchivo, Tipo, Estado } = req.body;
        const reporte = yield Reporte_1.Reportes.findOne({ where: { Id_Reporte: parseInt(Id_Reporte) } });
        if (!reporte) {
            return res.status(404).json({ message: "Reporte no encontrado" });
        }
        reporte.FiltrosAplicados = FiltrosAplicados;
        reporte.UbicacionArchivo = UbicacionArchivo;
        reporte.Tipo = Tipo;
        reporte.Estado = Estado;
        // Guardar los cambios en la base de datos
        yield reporte.save();
        return res.status(200).json(reporte);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
});
exports.updateReporte = updateReporte;
// Eliminar un reporte
const deleteReporte = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Id_Reporte } = req.params;
        const reporte = yield Reporte_1.Reportes.findOne({ where: { Id_Reporte: parseInt(Id_Reporte) } });
        if (!reporte) {
            return res.status(404).json({ message: "Reporte no encontrado" });
        }
        yield reporte.remove();
        return res.status(200).json({ message: "Reporte eliminado con éxito" });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
});
exports.deleteReporte = deleteReporte;
