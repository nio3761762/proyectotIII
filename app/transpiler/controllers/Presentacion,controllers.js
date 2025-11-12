"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePresentacion = exports.getpresentacion = exports.getPresentacion = exports.getPresentacionEstaoo = exports.verifyPresentacion = exports.updatePresentacion = exports.AddPresentacion = void 0;
const error_handler_1 = require("../utils/error.handler");
const idGenerator_1 = require("../utils/idGenerator");
const Presentacion_1 = require("../entities/Presentacion");
const Estado_controllers_1 = require("./Estado.controllers");
const AddPresentacion = async (req, res) => {
    try {
        const { Nombre } = req.body;
        const nuevo = new Presentacion_1.Presentacion();
        const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('PREN');
        nuevo.IdPresentacion = nuevoId;
        nuevo.Nombre = Nombre;
        nuevo.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: 1 });
        nuevo.FechaRegistro = new Date();
        await nuevo.save();
        return res.json({ message: "Se registro la presentacion" });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.AddPresentacion = AddPresentacion;
const updatePresentacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { Nombre } = req.body;
        const existe = await Presentacion_1.Presentacion.findOne({
            where: { IdPresentacion: id },
        });
        if (!existe)
            return res.status(404).json({ message: "La presentacion no se encuentra registrada" });
        existe.Nombre = Nombre;
        existe.FechaActualizacion = new Date();
        await existe.save();
        return res.json({ message: "Se actualizo la presentacion" });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.updatePresentacion = updatePresentacion;
const verifyPresentacion = async ({ PresentacionId }) => {
    const exist = await Presentacion_1.Presentacion.findOne({ where: { IdPresentacion: PresentacionId } });
    if (!exist) {
        throw new error_handler_1.HttpError(404, `La presentacion con ID ${PresentacionId} no existe.`);
    }
    return exist;
};
exports.verifyPresentacion = verifyPresentacion;
const getPresentacionEstaoo = async (req, res) => {
    try {
        const presentacion = await Presentacion_1.Presentacion.find({
            where: { Estado: { IdEstado: 1 } },
        });
        const resultado = presentacion.map(p => ({
            ...p,
            Estado: p.Estado?.IdEstado
        }));
        return res.json(resultado);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getPresentacionEstaoo = getPresentacionEstaoo;
const getPresentacion = async (req, res) => {
    try {
        const presentacion = await Presentacion_1.Presentacion.find({
            relations: ['Estado']
        });
        const resultado = presentacion.map(p => ({
            ...p,
            Estado: p.Estado?.IdEstado
        }));
        return res.json(resultado);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getPresentacion = getPresentacion;
const getpresentacion = async (req, res) => {
    try {
        const { id } = req.body;
        const presentacion = await Presentacion_1.Presentacion.findOne({
            where: { IdPresentacion: id },
            relations: ['Estado']
        });
        if (!presentacion) {
            return res.status(404).json({ message: "presentacion no encontrado" });
        }
        return res.json(presentacion);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getpresentacion = getpresentacion;
const deletePresentacion = async (req, res) => {
    try {
        const { id } = req.params;
        const presentacion = await Presentacion_1.Presentacion.findOne({
            where: { IdPresentacion: id },
            relations: ['Estado']
        });
        if (!presentacion) {
            return res.status(404).json({ message: "presentacion no encontrado" });
        }
        const esActivo = presentacion.Estado?.IdEstado === 1;
        const nuevoEstadoId = esActivo ? 2 : 1;
        const mensajeAccion = esActivo ? 'eliminaron' : 'habilitaron';
        const nuevoEstado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: nuevoEstadoId });
        if (!nuevoEstado) {
            return res.status(500).json({ message: "No se pudo obtener el estado requerido." });
        }
        presentacion.Estado = nuevoEstado;
        await presentacion.save();
        return res.json({ message: `Se ${mensajeAccion} los datos de la presentacion correctamente` });
    }
    catch (error) {
        console.error("Error al cambiar el estado del usuario:", error);
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.deletePresentacion = deletePresentacion;
