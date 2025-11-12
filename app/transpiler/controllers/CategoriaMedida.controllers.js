"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCategoriaMedida = exports.updateCateriaMedida = exports.ObtenerMedidas = exports.ObtenrCategoriaMedida = exports.getCategoriaMedidas = exports.getMedidas = exports.deleteCategoriaMedida = exports.createCategoriaMedida = void 0;
const Estado_1 = require("../entities/Estado");
const UnidadMedida_1 = require("../entities/UnidadMedida");
const Estado_controllers_1 = require("./Estado.controllers");
const error_handler_1 = require("../utils/error.handler");
const idGenerator_1 = require("../utils/idGenerator");
const CategoriaMedida_1 = require("../entities/CategoriaMedida");
const Medida_controllers_1 = require("./Medida.controllers");
const createCategoriaMedida = async (req, res) => {
    try {
        const { Registro } = req.body;
        const estado = await Estado_1.Estado.findOneBy({ IdEstado: 1 });
        if (!estado)
            return res.status(404).json({ message: "Estado no encontrado" });
        const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('CTM');
        const unidadmedida = new CategoriaMedida_1.Categoriamedida();
        unidadmedida.IdCategoriaMedida = nuevoId;
        unidadmedida.Nombre = Registro.Nombre;
        unidadmedida.FechaRegistro = new Date();
        unidadmedida.Estado = estado;
        await unidadmedida.save();
        if (Registro.Unidadmedida.length > 0)
            for (const medida of Registro.Unidadmedida)
                await (0, Medida_controllers_1.createMediada)({ Nombre: medida.Nombre, Cantidad: medida.Cantidad, Abreviatura: medida.Abreviatura, estado: medida.IdEstado, IdCategoria: nuevoId });
        return res.json({ message: `Registro exitoso.` });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.createCategoriaMedida = createCategoriaMedida;
const deleteCategoriaMedida = async (req, res) => {
    try {
        const { id } = req.params;
        const unidadmedida = await CategoriaMedida_1.Categoriamedida.findOne({
            where: { IdCategoriaMedida: id },
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
exports.deleteCategoriaMedida = deleteCategoriaMedida;
const getMedidas = async (req, res) => {
    try {
        const Unidadmedidas = await CategoriaMedida_1.Categoriamedida.find({
            relations: ['Estado', 'Unidadmedida', 'Unidadmedida.Estado']
        });
        return res.json(Unidadmedidas);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getMedidas = getMedidas;
const getCategoriaMedidas = async (req, res) => {
    try {
        const Unidadmedidas = await CategoriaMedida_1.Categoriamedida.find({
            where: { Estado: { IdEstado: 1 } }
        });
        return res.json(Unidadmedidas);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getCategoriaMedidas = getCategoriaMedidas;
const ObtenrCategoriaMedida = async (req, res) => {
    try {
        const { id } = req.params;
        const unidadmedida = await CategoriaMedida_1.Categoriamedida.findOne({
            where: { Unidadmedida: { IdUnidadMedida: Number(id) } },
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
exports.ObtenrCategoriaMedida = ObtenrCategoriaMedida;
const ObtenerMedidas = async (req, res) => {
    try {
        const { id } = req.params;
        const unidadmedida = await UnidadMedida_1.Unidadmedida.find({
            where: { Categoria: { IdCategoriaMedida: id } }
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
exports.ObtenerMedidas = ObtenerMedidas;
const updateCateriaMedida = async (req, res) => {
    try {
        const { id } = req.params;
        const { Registro } = req.body;
        console.log(Registro);
        const unidadmedida = await CategoriaMedida_1.Categoriamedida.findOne({ where: { IdCategoriaMedida: id } });
        if (!unidadmedida)
            return res.status(404).json({ message: "Unidadmedida no encontrado" });
        if (Registro.Nombre)
            unidadmedida.Nombre = Registro.Nombre;
        unidadmedida.FechaActualizacion = new Date();
        await unidadmedida.save();
        if (Registro.Unidadmedida.length > 0)
            for (const medida of Registro.Unidadmedida)
                await (0, Medida_controllers_1.updateMediada)({ Idmedida: medida.IdUnidadMedida, Nombre: medida.Nombre, Cantidad: medida.Cantidad, Abreviatura: medida.Abreviatura, estado: medida.IdEstado, IdCategoria: unidadmedida.IdCategoriaMedida });
        return res.json({ message: `Se actualizo correctamente.` });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.updateCateriaMedida = updateCateriaMedida;
const verifyCategoriaMedida = async ({ UnidadMedidaId }) => {
    const existUnidadMedida = await CategoriaMedida_1.Categoriamedida.findOne({
        where: { IdCategoriaMedida: UnidadMedidaId }
    });
    if (!existUnidadMedida) {
        throw new error_handler_1.HttpError(404, `L categoria de medida con ID ${UnidadMedidaId} no existe.`);
    }
    return existUnidadMedida;
};
exports.verifyCategoriaMedida = verifyCategoriaMedida;
