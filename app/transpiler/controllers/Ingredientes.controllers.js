"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliminarIngredienteReceta = exports.actualizarIngredienteReceta = exports.registrarProduccionDeProducto = exports.ObtenerIngredientes = exports.getProductoIngrediente = exports.updateIngrediente = exports.createIngrediente = exports.verifyReceta = exports.verifyIngrediente = void 0;
const Ingrediente_1 = require("../entities/Ingrediente");
const db_1 = require("../db");
const error_handler_1 = require("../utils/error.handler");
const idGenerator_1 = require("../utils/idGenerator");
const Medida_controllers_1 = require("./Medida.controllers");
const Producto_controllers_1 = require("./Producto.controllers");
const Insumo_controllers_1 = require("./Insumo.controllers");
const Receta_1 = require("../entities/Receta");
const verifyIngrediente = async ({ IngredienteId }) => {
    const existUnidadMedida = await Ingrediente_1.Ingrediente.findOne({
        where: { IdIngrediente: IngredienteId }
    });
    if (!existUnidadMedida) {
        throw new error_handler_1.HttpError(404, `El ingrediente con ID ${IngredienteId} no existe.`);
    }
    return existUnidadMedida;
};
exports.verifyIngrediente = verifyIngrediente;
const verifyReceta = async (RecetaId) => {
    const existProducto = await Receta_1.Receta.findOne({ where: { IdReceta: RecetaId } });
    if (!existProducto) {
        throw new error_handler_1.HttpError(404, `La receta con ID ${RecetaId} no existe.`);
    }
    return existProducto;
};
exports.verifyReceta = verifyReceta;
const createIngrediente = async (Peso, ingredienteId, receta, UnidadmedidaId) => {
    const ingrediente = new Ingrediente_1.Ingrediente();
    ingrediente.Insumo = await (0, Insumo_controllers_1.verifyInsumo)({ ProductoId: ingredienteId });
    ingrediente.Receta = receta;
    ingrediente.Peso = Peso;
    ingrediente.Unidadmedida = await (0, Medida_controllers_1.verifyUnidadMedida)({ UnidadMedidaId: UnidadmedidaId });
    ingrediente.Pesoconvertido = Peso * ingrediente.Unidadmedida.Cantidad;
    ingrediente.IdIngrediente = await (0, idGenerator_1.generarIdSecuencial)('INGR');
    await ingrediente.save();
    return ingrediente;
};
exports.createIngrediente = createIngrediente;
const updateIngrediente = async (IdINgredientes, Peso, ingredienteId, receta, UnidadmedidaId) => {
    if (!IdINgredientes) {
        return (0, exports.createIngrediente)(Peso, ingredienteId, receta, UnidadmedidaId);
    }
    const ingrediente = await (0, exports.verifyIngrediente)({ IngredienteId: IdINgredientes });
    ingrediente.Insumo = await (0, Insumo_controllers_1.verifyInsumo)({ ProductoId: ingredienteId });
    ingrediente.Peso = Peso;
    ingrediente.Unidadmedida = await (0, Medida_controllers_1.verifyUnidadMedida)({ UnidadMedidaId: UnidadmedidaId });
    ingrediente.Pesoconvertido = Peso * ingrediente.Unidadmedida.Cantidad;
    await ingrediente.save();
    return ingrediente;
};
exports.updateIngrediente = updateIngrediente;
const getProductoIngrediente = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.AppDataSource.query(`
      SELECT 
        p.idproducto,
        p.nombre,

        COALESCE(
          json_agg(
            json_build_object(
              'idReceta', r.idreceta,
              'rendimiento', r.rendimiento,
              'tiempoHorneadoMin', r.tiempohorneado,
              'cantidadPorLata', r.cantidadporlata,

              'ingredientes', (
                SELECT COALESCE(
                  json_agg(
                    json_build_object(
                      'idIngrediente', i.idingrediente,
                      'cantidad', i.peso,

                      'insumo', json_build_object(
                        'idInsumo', ins.idinsumo,
                        'nombre', ins.nombre,
                        'imagen', ins.imagen
                      ),

                      'unidadMedida', json_build_object(
                        'idUnidadMedida', um.idunidadmedida,
                        'nombre', um.nombre,
                        'cantidad', um.cantidad,
                        'abreviatura', um.abreviatura,

                        'categoria', json_build_object(
                          'idCategoria', c.idcategoriamedida,
                          'nombre', c.nombre
                        )
                      )
                    )
                  ),
                  '[]'
                )
                FROM ingrediente i
                LEFT JOIN insumo ins ON ins.idinsumo = i.idinsumo
                LEFT JOIN unidadmedida um ON um.idunidadmedida = i.idunidadmedida
                LEFT JOIN categoriamedida c ON c.idcategoriamedida = um.idcategoriamedida
                WHERE i.idreceta = r.idreceta
              )
            )
          ) FILTER (WHERE r.idreceta IS NOT NULL),
          '[]'
        ) AS receta

      FROM producto p
      LEFT JOIN receta r ON r.idproducto = p.idproducto

      WHERE p.idproducto = $1

      GROUP BY p.idproducto, p.nombre
    `, [id]);
        if (result.length === 0) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        return res.json(result[0]);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getProductoIngrediente = getProductoIngrediente;
const ObtenerIngredientes = async ({ IngredienteId }) => {
    const existUnidadMedida = await Ingrediente_1.Ingrediente.find({
        where: { Receta: { IdReceta: IngredienteId } }
    });
    return existUnidadMedida || [];
};
exports.ObtenerIngredientes = ObtenerIngredientes;
const registrarProduccionDeProducto = async (req, res) => {
    try {
        const { ingredientes, Recetas } = req.body;
        const receta = new Receta_1.Receta();
        receta.CantidadPorLata = Recetas.cantidad; // cuantos productos por lata entra
        receta.Producto = await (0, Producto_controllers_1.verifyProducto)({ ProductoId: Recetas.IdProducto });
        receta.Rendimiento = Recetas.Rendimiento; // CUÁNTOS PRODUCTOS PRODUCE
        receta.TiempoHorneadoMin = Recetas.Tiempo;
        receta.IdReceta = await (0, idGenerator_1.generarIdSecuencial)('REC');
        await receta.save();
        for (const ingret of ingredientes) {
            await (0, exports.createIngrediente)(ingret.Peso, ingret.Insumo, receta, ingret.UnidadMedida);
        }
        return res.status(200).json({ message: "Producción registrada, recetas actualizadas y stock ajustado correctamente." });
    }
    catch (error) {
        if (error instanceof error_handler_1.HttpError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({ message: "Error interno del servidor al procesar la producción." });
    }
};
exports.registrarProduccionDeProducto = registrarProduccionDeProducto;
const actualizarIngredienteReceta = async (req, res) => {
    try {
        const { id } = req.params;
        const { ingredientes, Recetas } = req.body;
        const receta = await Receta_1.Receta.findOne({
            where: { IdReceta: id },
            relations: ['Ingredientes']
        });
        if (!receta)
            return res.status(400).json({ message: "Receta no encontrado" });
        if (Recetas.cantidad > 0)
            receta.CantidadPorLata = Recetas.cantidad; // cuantos productos por lata entra
        if (Recetas.Rendimiento > 0)
            receta.Rendimiento = Recetas.Rendimiento; // CUÁNTOS PRODUCTOS PRODUCE
        if (Recetas.Tiempo > 0)
            receta.TiempoHorneadoMin = Recetas.Tiempo;
        await receta.save();
        // 🔥 crear o actualizar
        for (const ingret of ingredientes || []) {
            await (0, exports.updateIngrediente)(ingret.IdIngrediente, ingret.Peso, ingret.Insumo, receta, ingret.UnidadMedida);
        }
        return res.status(200).json({
            message: "Receta de producto actualizada correctamente."
        });
    }
    catch (error) {
        console.error("ERROR REAL:", error);
        return res.status(500).json({
            message: "Error interno del servidor al actualizar la receta del producto.",
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
    }
};
exports.actualizarIngredienteReceta = actualizarIngredienteReceta;
const eliminarIngredienteReceta = async (req, res) => {
    try {
        const { id } = req.params; // Id del registro de Ingrediente (la receta)
        if (!id) {
            return res.status(400).json({ message: "El ID del ingrediente de la receta es requerido." });
        }
        const result = await Ingrediente_1.Ingrediente.delete({ IdIngrediente: id });
        if (result.affected === 0) {
            return res.status(404).json({ message: "Receta de ingrediente no encontrada." });
        }
        return res.status(200).json({ message: "Receta de ingrediente eliminada correctamente." });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor al eliminar la receta del ingrediente." });
    }
};
exports.eliminarIngredienteReceta = eliminarIngredienteReceta;
