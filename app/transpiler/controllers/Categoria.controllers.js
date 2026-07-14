"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubCategorias = exports.deleteSubCategoria = exports.updateSubCategoria = exports.createSubCategoria = exports.UpdateSubCategoria = exports.CreateSubCategoria = exports.updateCategoria = exports.createCategoria = exports.deleteCategoria = exports.verifySubCategoria = exports.verifyCategoria = exports.getSubCategoria = exports.getCategoria = exports.ListCategoria = exports.getCategorias = void 0;
const Categoria_1 = require("../entities/Categoria");
const SubCategoria_1 = require("../entities/SubCategoria");
const error_handler_1 = require("../utils/error.handler");
const idGenerator_1 = require("../utils/idGenerator");
const db_1 = require("../db");
const getCategorias = async (req, res) => {
    try {
        const { search, estado, page = 1, limit = 8 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        //  limpiar parámetros
        const nombreParam = typeof search === "string" && search.trim() !== ""
            ? search.trim()
            : null;
        const estadoParam = estado !== undefined && estado !== ""
            ? Number(estado)
            : null;
        const result = await db_1.AppDataSource.query(`
      SELECT 
          c.idcategoria,
          c.nombre,
          c.estado,
          c.imagen,
          COUNT(*) OVER() AS total,
          json_agg(
              json_build_object(
                  'idsubcategoria', sc.idsubcategoria,
                  'nombre', sc.nombre,
                  'estado', sc.estado
              )
          ) FILTER (WHERE sc.idsubcategoria IS NOT NULL) AS subcategorias
      FROM categoria c
      LEFT JOIN subcategoria sc 
          ON sc.idcategoria = c.idcategoria
      WHERE 
          ($1::text IS NULL OR c.nombre ILIKE '%' || $1::text || '%')
      AND ($2::int IS NULL OR c.estado = $2)
      GROUP BY c.idcategoria
      ORDER BY c.idcategoria
      LIMIT $3 OFFSET $4;
      `, [
            nombreParam,
            estadoParam,
            Number(limit),
            offset
        ]);
        //  si no hay resultados → array vacío
        if (result.length === 0) {
            return res.json({
                total: 0,
                page: Number(page),
                limit: Number(limit),
                data: []
            });
        }
        return res.json({
            total: result[0].total,
            page: Number(page),
            limit: Number(limit),
            data: result
        });
    }
    catch (error) {
        console.error("Error real:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};
exports.getCategorias = getCategorias;
const ListCategoria = async (req, res) => {
    try {
        const result = await db_1.AppDataSource.query(`SELECT 
          c.idcategoria,
          c.nombre,
          c.imagen
     FROM categoria c
     WHERE c.estado = 1`);
        return res.json({
            result
        });
    }
    catch (error) {
        console.error("Error real:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};
exports.ListCategoria = ListCategoria;
const getCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.AppDataSource.query(`SELECT 
          sc.idsubcategoria,
          sc.nombre
     FROM subcategoria sc 
     WHERE  sc.estado = 1 AND sc.idcategoria = $1`, [id]);
        return res.json({
            idcategoria: id,
            result
        });
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
                Estado: 1 },
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
        const result = await db_1.AppDataSource.query(`UPDATE categoria 
          SET estado = CASE WHEN estado = 1 THEN 0 ELSE 1 END
          WHERE IdCategoria = $1
          RETURNING estado AS estado`, [id]);
        // ✅ aquí está el cambio
        if (result.length === 0) {
            return res.status(404).json({ message: "Categoria no encontrado" });
        }
        const nuevoEstado = Number(result[0][0].estado);
        const mensajeAccion = nuevoEstado === 1 ? "habilitaron" : "eliminaron";
        return res.json({
            message: `Se ${mensajeAccion} los datos de la Categoria correctamente`,
        });
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
        const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('CAT');
        const categoria = new Categoria_1.Categoria();
        categoria.IdCategoria = nuevoId;
        categoria.Nombre = RegistroCategoria.Nombre;
        categoria.FechaRegistro = new Date();
        if (RegistroCategoria.Url)
            categoria.Imagen = RegistroCategoria.Url;
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
        });
        if (!categoria) {
            return res.status(404).json({ message: "Categoria no encontrado" });
        }
        if (RegistroCategoria.Nombre)
            categoria.Nombre = RegistroCategoria.Nombre;
        if (RegistroCategoria.Url)
            categoria.Imagen = RegistroCategoria.Url;
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
        subcategoria.Estado = IdEstado;
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
        const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('SCT');
        const subcategoria = new SubCategoria_1.Subcategoria();
        subcategoria.IdSubCategoria = nuevoId;
        subcategoria.Nombre = RegistroSubCategoria.Nombre;
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
        const result = await db_1.AppDataSource.query(`UPDATE subcategoria 
   SET estado = CASE WHEN estado = 1 THEN 0 ELSE 1 END
   WHERE IdSubcategoria = $1
   RETURNING estado AS estado`, [id]);
        // ✅ aquí está el cambio
        if (result.length === 0) {
            return res.status(404).json({ message: "Subcategoria no encontrado" });
        }
        const nuevoEstado = Number(result[0][0].estado);
        const mensajeAccion = nuevoEstado === 1 ? "habilitaron" : "eliminaron";
        return res.json({
            message: `Se ${mensajeAccion} los datos de la subcategoria correctamente`,
        });
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
        const subcategorias = await SubCategoria_1.Subcategoria.find({ relations: ['Categoria'] });
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
