"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubCategorias = exports.deleteSubCategoria = exports.updateSubCategoria = exports.createSubCategoria = exports.UpdateSubCategoria = exports.CreateSubCategoria = exports.updateCategoria = exports.createCategoria = exports.deleteCategoria = exports.verifySubCategoria = exports.verifyCategoria = exports.getSubCategoria = exports.getCategoria = exports.getCategorias = void 0;
const Categoria_1 = require("../entities/Categoria");
const Estado_controllers_1 = require("./Estado.controllers");
const Estado_1 = require("../entities/Estado");
const Foto_controllers_1 = require("./Foto.controllers");
const SubCategoria_1 = require("../entities/SubCategoria");
const error_handler_1 = require("../utils/error.handler");
const idGenerator_1 = require("../utils/idGenerator");
const getCategorias = async (req, res) => {
    try {
        const categorias = await Categoria_1.Categoria.find({ relations: ['Estado', 'Imagen', 'Subcategoria', 'Subcategoria.Estado', 'Subcategoria.Categoria'] });
        return res.json(categorias);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getCategorias = getCategorias;
const getCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const categorias = await SubCategoria_1.Subcategoria.find({
            where: { Categoria: { IdCategoria: id },
                Estado: { IdEstado: 1 } }
        });
        return res.json(categorias);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getCategoria = getCategoria;
const getSubCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const categorias = await Categoria_1.Categoria.findOne({
            where: { Subcategoria: { IdSubCategoria: id },
                Estado: { IdEstado: 1 } },
        });
        return res.json(categorias);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getSubCategoria = getSubCategoria;
const verifyCategoria = async ({ CategoriaId }) => {
    const existCategoria = await Categoria_1.Categoria.findOne({ where: { IdCategoria: CategoriaId } });
    if (!existCategoria) {
        throw new error_handler_1.HttpError(404, `La categoria con ID ${CategoriaId} no existe.`);
    }
    return existCategoria;
};
exports.verifyCategoria = verifyCategoria;
const verifySubCategoria = async ({ CategoriaId }) => {
    const existCategoria = await SubCategoria_1.Subcategoria.findOne({ where: { IdSubCategoria: CategoriaId } });
    if (!existCategoria) {
        throw new error_handler_1.HttpError(404, `La Sub categoria con ID ${CategoriaId} no existe.`);
    }
    return existCategoria;
};
exports.verifySubCategoria = verifySubCategoria;
const deleteCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const categoria = await Categoria_1.Categoria.findOne({
            where: { IdCategoria: id },
            relations: ['Estado']
        });
        if (!categoria) {
            return res.status(404).json({ message: "Categoria no encontrado" });
        }
        const esActivo = categoria.Estado?.IdEstado === 1;
        const nuevoEstadoId = esActivo ? 2 : 1;
        const mensajeAccion = esActivo ? 'eliminaron' : 'habilitaron';
        const nuevoEstado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: nuevoEstadoId });
        if (!nuevoEstado) {
            return res.status(500).json({ message: "No se pudo obtener el estado requerido." });
        }
        categoria.Estado = nuevoEstado;
        await categoria.save();
        return res.json({ message: `Se ${mensajeAccion} los datos de la Categoria correctamente` });
    }
    catch (error) {
        console.error("Error al cambiar el estado del Categoria:", error);
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.deleteCategoria = deleteCategoria;
const createCategoria = async (req, res) => {
    try {
        const { RegistroCategoria } = req.body;
        const estado = await Estado_1.Estado.findOneBy({ IdEstado: 1 });
        if (!estado)
            return res.status(404).json({ message: "Estado no encontrado" });
        const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('CAT');
        const categoria = new Categoria_1.Categoria();
        categoria.IdCategoria = nuevoId;
        categoria.Nombre = RegistroCategoria.Nombre;
        categoria.FechaRegistro = new Date();
        categoria.Estado = estado;
        if (RegistroCategoria.Url) {
            const imagen = await (0, Foto_controllers_1.createImagen)({ Foto: RegistroCategoria.Url });
            categoria.Imagen = imagen;
        }
        await categoria.save();
        if (RegistroCategoria.Subcategoria.length > 0) {
            for (const sub of RegistroCategoria.Subcategoria) {
                const nombreValido = sub.Nombre && sub.Nombre.trim() !== '';
                if (!nombreValido) {
                    continue; // Salta a la siguiente
                }
                else
                    await (0, exports.CreateSubCategoria)({
                        Nombre: sub.Nombre,
                        IdEstado: sub.IdEstado,
                        CategoriaId: nuevoId
                    });
            }
        }
        return res.json({ message: "La Categoria se registró correctamente" });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.createCategoria = createCategoria;
const updateCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const { RegistroCategoria } = req.body;
        const categoria = await Categoria_1.Categoria.findOne({
            where: { IdCategoria: id },
            relations: ['Estado']
        });
        if (!categoria) {
            return res.status(404).json({ message: "Categoria no encontrado" });
        }
        if (RegistroCategoria.Nombre)
            categoria.Nombre = RegistroCategoria.Nombre;
        if (RegistroCategoria.IdImagen) {
            const imagen = await (0, Foto_controllers_1.updateImagen)({ ImagenId: RegistroCategoria.IdImagen, Foto: RegistroCategoria.Url });
            categoria.Imagen = imagen;
        }
        else {
            if (RegistroCategoria.Url) {
                const imagen = await (0, Foto_controllers_1.createImagen)({ Foto: RegistroCategoria.Url });
                categoria.Imagen = imagen;
            }
        }
        categoria.FechaActualizacion = new Date();
        await categoria.save();
        if (RegistroCategoria.Subcategoria.length > 0)
            for (const sub of RegistroCategoria.Subcategoria)
                await (0, exports.UpdateSubCategoria)({ SubCategoriaId: sub.IdSubCategoria, Nombre: sub.Nombre, IdEstado: sub.IdEstado, CategoriaId: categoria.IdCategoria });
        return res.json({ message: "La Categoria se actualizo correctamente" });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.updateCategoria = updateCategoria;
const CreateSubCategoria = async ({ Nombre, IdEstado, CategoriaId }) => {
    const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('SCT');
    const subcategoria = new SubCategoria_1.Subcategoria();
    subcategoria.IdSubCategoria = nuevoId;
    subcategoria.Categoria = await (0, exports.verifyCategoria)({ CategoriaId: CategoriaId });
    subcategoria.Nombre = Nombre;
    subcategoria.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: IdEstado });
    await subcategoria.save();
    return subcategoria;
};
exports.CreateSubCategoria = CreateSubCategoria;
const UpdateSubCategoria = async ({ SubCategoriaId, Nombre, IdEstado, CategoriaId }) => {
    const nombreValido = Nombre && Nombre.trim() !== '';
    if (SubCategoriaId) {
        const subcategoria = await (0, exports.verifySubCategoria)({ CategoriaId: SubCategoriaId });
        if (nombreValido) {
            subcategoria.Nombre = Nombre;
        }
        subcategoria.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: IdEstado });
        await subcategoria.save();
        return subcategoria;
    }
    if (nombreValido) {
        return await (0, exports.CreateSubCategoria)({
            Nombre,
            CategoriaId,
            IdEstado
        });
    }
    else {
        return null;
    }
};
exports.UpdateSubCategoria = UpdateSubCategoria;
const createSubCategoria = async (req, res) => {
    try {
        const { RegistroSubCategoria } = req.body;
        const estado = await Estado_1.Estado.findOneBy({ IdEstado: 1 });
        if (!estado)
            return res.status(404).json({ message: "Estado no encontrado" });
        const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('SCT');
        const subcategoria = new SubCategoria_1.Subcategoria();
        subcategoria.IdSubCategoria = nuevoId;
        subcategoria.Nombre = RegistroSubCategoria.Nombre;
        subcategoria.Estado = estado;
        if (RegistroSubCategoria.IdCategoria) {
            const categoria = await (0, exports.verifyCategoria)({ CategoriaId: RegistroSubCategoria.IdCategoria });
            subcategoria.Categoria = categoria;
        }
        await subcategoria.save();
        return res.json({ message: "La Sub Categoria se registró correctamente" });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.createSubCategoria = createSubCategoria;
const updateSubCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const { RegistroSubCategoria } = req.body;
        const subcategoria = await SubCategoria_1.Subcategoria.findOne({
            where: { IdSubCategoria: id },
            relations: ['Estado']
        });
        if (!subcategoria) {
            return res.status(404).json({ message: "Sub Categoria no encontrado" });
        }
        if (RegistroSubCategoria.Nombre)
            subcategoria.Nombre = RegistroSubCategoria.Nombre;
        await subcategoria.save();
        return res.json({ message: "La Sub Categoria se actualizó correctamente" });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.updateSubCategoria = updateSubCategoria;
const deleteSubCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const subcategoria = await SubCategoria_1.Subcategoria.findOne({
            where: { IdSubCategoria: id },
            relations: ['Estado']
        });
        if (!subcategoria) {
            return res.status(404).json({ message: "Sub Categoria no encontrado" });
        }
        const esActivo = subcategoria.Estado?.IdEstado === 1;
        const nuevoEstadoId = esActivo ? 2 : 1;
        const mensajeAccion = esActivo ? 'eliminaron' : 'habilitaron';
        const nuevoEstado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: nuevoEstadoId });
        if (!nuevoEstado) {
            return res.status(500).json({ message: "No se pudo obtener el estado requerido." });
        }
        subcategoria.Estado = nuevoEstado;
        await subcategoria.save();
        return res.json({ message: `Se ${mensajeAccion} los datos de la sub Categoria correctamente` });
    }
    catch (error) {
        console.error("Error al cambiar el estado del Categoria:", error);
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.deleteSubCategoria = deleteSubCategoria;
const getSubCategorias = async (req, res) => {
    try {
        const subcategorias = await SubCategoria_1.Subcategoria.find({ relations: ['Estado', 'Categoria'] });
        if (!subcategorias) {
            return res.status(404).json({ message: "Sub Categorias no encontradas" });
        }
        return res.json(subcategorias);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getSubCategorias = getSubCategorias;
