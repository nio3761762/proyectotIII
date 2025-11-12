"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUnidadMedida = exports.updateUnidadMedida = exports.getUnidadMedida = exports.getUnidadMedidas = exports.deleteUnidadMedida = exports.createUnidadMedida = exports.updateMediada = exports.createMediada = void 0;
const Estado_1 = require("../entities/Estado");
const UnidadMedida_1 = require("../entities/UnidadMedida");
const Estado_controllers_1 = require("./Estado.controllers");
const error_handler_1 = require("../utils/error.handler");
const CategoriaMedida_controllers_1 = require("./CategoriaMedida.controllers");
const createMediada = async ({ Nombre, Cantidad, Abreviatura, estado, IdCategoria }) => {
    const result = await UnidadMedida_1.Unidadmedida.createQueryBuilder("Unidadmedida")
        .select("MAX(Unidadmedida.IdUnidadMedida)", "maxId")
        .getRawOne();
    const nuevoId = (result.maxId || 0) + 1;
    const unidadmedida = new UnidadMedida_1.Unidadmedida();
    unidadmedida.IdUnidadMedida = nuevoId;
    unidadmedida.Nombre = Nombre;
    unidadmedida.Cantidad = Cantidad;
    unidadmedida.Abreviatura = Abreviatura;
    unidadmedida.FechaRegistro = new Date();
    unidadmedida.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: estado });
    unidadmedida.Categoria = await (0, CategoriaMedida_controllers_1.verifyCategoriaMedida)({ UnidadMedidaId: IdCategoria });
    await unidadmedida.save();
    return unidadmedida;
};
exports.createMediada = createMediada;
const updateMediada = async ({ Idmedida, Nombre, Cantidad, Abreviatura, estado, IdCategoria }) => {
    if (!Idmedida) {
        return (0, exports.createMediada)({ Nombre: Nombre, Cantidad: Cantidad, Abreviatura: Abreviatura, estado: estado, IdCategoria: IdCategoria });
    }
    const unidadmedida = await (0, exports.verifyUnidadMedida)({ UnidadMedidaId: Idmedida });
    unidadmedida.Nombre = Nombre;
    unidadmedida.Cantidad = Cantidad;
    unidadmedida.Abreviatura = Abreviatura;
    unidadmedida.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: estado });
    await unidadmedida.save();
    return unidadmedida;
};
exports.updateMediada = updateMediada;
const createUnidadMedida = async (req, res) => {
    try {
        const { RegistroUnidadmedida } = req.body;
        const estado = await Estado_1.Estado.findOneBy({ IdEstado: 1 });
        if (!estado)
            return res.status(404).json({ message: "Estado no encontrado" });
        const result = await UnidadMedida_1.Unidadmedida.createQueryBuilder("Unidadmedida")
            .select("MAX(Unidadmedida.IdUnidadMedida)", "maxId")
            .getRawOne();
        const nuevoId = (result.maxId || 0) + 1;
        const unidadmedida = new UnidadMedida_1.Unidadmedida();
        unidadmedida.IdUnidadMedida = nuevoId;
        unidadmedida.Nombre = RegistroUnidadmedida.Nombre;
        unidadmedida.Cantidad = RegistroUnidadmedida.Cantidad;
        unidadmedida.Abreviatura = RegistroUnidadmedida.Abreviatura;
        unidadmedida.FechaRegistro = new Date();
        unidadmedida.Estado = estado;
        await unidadmedida.save();
        return res.json({ message: `La Medida ${RegistroUnidadmedida.Nombre} no existe.` });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.createUnidadMedida = createUnidadMedida;
const deleteUnidadMedida = async (req, res) => {
    try {
        const { id } = req.params;
        const unidadmedida = await UnidadMedida_1.Unidadmedida.findOne({
            where: { IdUnidadMedida: Number(id) },
            relations: ['Estado']
        });
        if (!unidadmedida) {
            return res.status(404).json({ message: "Unidad de medida no encontrado" });
        }
        const esActivo = unidadmedida.Estado?.IdEstado === 1;
        const nuevoEstadoId = esActivo ? 2 : 1;
        const mensajeAccion = esActivo ? 'eliminaron' : 'habilitaron';
        const nuevoEstado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: nuevoEstadoId });
        if (!nuevoEstado) {
            return res.status(500).json({ message: "No se pudo obtener el estado requerido." });
        }
        unidadmedida.Estado = nuevoEstado;
        await unidadmedida.save();
        return res.json({ message: `Se ${mensajeAccion} los datos de la  Unidad de medida correctamente` });
    }
    catch (error) {
        console.error("Error al cambiar el estado del Unidadmedida:", error);
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.deleteUnidadMedida = deleteUnidadMedida;
const getUnidadMedidas = async (req, res) => {
    try {
        const Unidadmedidas = await UnidadMedida_1.Unidadmedida.find({
            relations: ['Estado']
        });
        return res.json(Unidadmedidas);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getUnidadMedidas = getUnidadMedidas;
const getUnidadMedida = async (req, res) => {
    try {
        const { id } = req.params;
        const unidadmedida = await UnidadMedida_1.Unidadmedida.findOne({
            where: { IdUnidadMedida: Number(id) },
            relations: ['Estado']
        });
        if (!unidadmedida)
            return res.status(404).json({ message: "Unidad de medida no encontrado" });
        return res.json(unidadmedida);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getUnidadMedida = getUnidadMedida;
const updateUnidadMedida = async (req, res) => {
    try {
        const { id } = req.params;
        const { RegistroUnidadmedida } = req.body;
        const unidadmedida = await UnidadMedida_1.Unidadmedida.findOneBy({ IdUnidadMedida: Number(id) });
        if (!unidadmedida)
            return res.status(404).json({ message: "Unidadmedida no encontrado" });
        if (RegistroUnidadmedida.Nombre)
            unidadmedida.Nombre = RegistroUnidadmedida.Nombre;
        if (RegistroUnidadmedida.Cantidad)
            unidadmedida.Cantidad = RegistroUnidadmedida.Cantidad;
        if (RegistroUnidadmedida.Abreviatura)
            unidadmedida.Abreviatura = RegistroUnidadmedida.Abreviatura;
        await unidadmedida.save();
        return res.json({ message: `La Medida ${RegistroUnidadmedida.Nombre} se actualizo correctamente.` });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.updateUnidadMedida = updateUnidadMedida;
const verifyUnidadMedida = async ({ UnidadMedidaId }) => {
    const existUnidadMedida = await UnidadMedida_1.Unidadmedida.findOne({ where: { IdUnidadMedida: UnidadMedidaId } });
    if (!existUnidadMedida) {
        throw new error_handler_1.HttpError(404, `El UnidadMedida con ID ${UnidadMedidaId} no existe.`);
    }
    return existUnidadMedida;
};
exports.verifyUnidadMedida = verifyUnidadMedida;
