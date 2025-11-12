"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliminarIngredienteReceta = exports.actualizarIngredienteReceta = exports.registrarProduccionDeProducto = exports.ObtenerIngredientes = exports.getProductoIngrediente = exports.updateIngrediente = exports.createIngrediente = exports.verifyIngrediente = void 0;
const Ingrediente_1 = require("../entities/Ingrediente");
const db_1 = require("../db");
const Producto_1 = require("../entities/Producto");
const error_handler_1 = require("../utils/error.handler");
const idGenerator_1 = require("../utils/idGenerator");
const Medida_controllers_1 = require("./Medida.controllers");
const Producto_controllers_1 = require("./Producto.controllers");
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
const createIngrediente = async ({ Peso, ingredienteId, id, UnidadmedidaId }) => {
    const ingrediente = new Ingrediente_1.Ingrediente();
    ingrediente.Ingredientes = await (0, Producto_controllers_1.verifyProducto)({ ProductoId: ingredienteId });
    ingrediente.Producto = await (0, Producto_controllers_1.verifyProducto)({ ProductoId: id });
    ingrediente.Peso = Peso;
    ingrediente.Unidadmedida = await (0, Medida_controllers_1.verifyUnidadMedida)({ UnidadMedidaId: UnidadmedidaId });
    ingrediente.IdIngrediente = await (0, idGenerator_1.generarIdSecuencial)('INGR');
    await ingrediente.save();
    return ingrediente;
};
exports.createIngrediente = createIngrediente;
const updateIngrediente = async ({ IdINgredientes, Peso, ingredienteId, id, UnidadmedidaId }) => {
    if (!IdINgredientes) {
        console.log("Registrando ingrediente");
        return (0, exports.createIngrediente)({ Peso, ingredienteId, id, UnidadmedidaId });
    }
    const ingrediente = await (0, exports.verifyIngrediente)({ IngredienteId: IdINgredientes });
    ingrediente.Ingredientes = await (0, Producto_controllers_1.verifyProducto)({ ProductoId: ingredienteId });
    ingrediente.Producto = await (0, Producto_controllers_1.verifyProducto)({ ProductoId: id });
    ingrediente.Peso = Peso;
    ingrediente.Unidadmedida = await (0, Medida_controllers_1.verifyUnidadMedida)({ UnidadMedidaId: UnidadmedidaId });
    await ingrediente.save();
    return ingrediente;
};
exports.updateIngrediente = updateIngrediente;
const getProductoIngrediente = async (req, res) => {
    try {
        const { id } = req.params;
        const producto = await Ingrediente_1.Ingrediente.find({
            where: { Producto: { IdProducto: id } },
            relations: ['Ingredientes', 'Unidadmedida', 'Unidadmedida.Categoria']
        });
        if (!producto)
            return res.status(404).json({ message: "Producto no encontrado" });
        const ingrediente = producto.map(p => ({
            IdIngrediente: p?.IdIngrediente, // cuidado con la mayúscula, debe coincidir con tu modelo
            Peso: p?.Peso,
            IdInsumo: p?.Ingredientes?.IdProducto,
            IdUnidadMedida: p?.Unidadmedida?.IdUnidadMedida,
            IdCategoriaMedida: p?.Unidadmedida?.Categoria?.IdCategoriaMedida
        }));
        return res.json(ingrediente);
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
        where: { Producto: { IdProducto: IngredienteId } }
    });
    return existUnidadMedida || [];
};
exports.ObtenerIngredientes = ObtenerIngredientes;
const registrarProduccionDeProducto = async (req, res) => {
    const { id, cantidadProducida, ingredientes } = req.body;
    if (!id || !cantidadProducida || !ingredientes || !Array.isArray(ingredientes) || ingredientes.length === 0) {
        return res.status(400).json({ message: "Faltan datos: id, cantidadProducida y un array de ingredientes son requeridos." });
    }
    if (isNaN(cantidadProducida) || cantidadProducida <= 0) {
        return res.status(400).json({ message: "cantidadProducida debe ser un número positivo." });
    }
    const queryRunner = db_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const recetasActualizadas = [];
        for (const item of ingredientes) {
            const { totalPeso, ingredienteId, UnidadmedidaId } = item;
            if (!totalPeso || !ingredienteId || !UnidadmedidaId) {
                throw new error_handler_1.HttpError(400, `Datos incompletos para un ingrediente: totalPeso, ingredienteId, UnidadmedidaId son requeridos.`);
            }
            if (isNaN(totalPeso) || totalPeso <= 0) {
                throw new error_handler_1.HttpError(400, `totalPeso para el ingrediente ${ingredienteId} debe ser un número positivo.`);
            }
            const pesoPorUnidad = totalPeso / cantidadProducida;
            // 1. Definir/Actualizar la receta (peso por unidad)
            const nuevoIngredienteReceta = await (0, exports.createIngrediente)({ Peso: pesoPorUnidad, ingredienteId, id, UnidadmedidaId });
            recetasActualizadas.push(nuevoIngredienteReceta);
            // 2. Descontar stock del insumo
            const insumo = await queryRunner.manager.findOne(Producto_1.Producto, {
                where: { IdProducto: ingredienteId }
            });
            if (!insumo || insumo.Cantidad < totalPeso) {
                throw new error_handler_1.HttpError(400, `Stock insuficiente para el insumo ${insumo?.Nombre || ingredienteId}. Se necesitan ${totalPeso} y hay ${insumo?.Cantidad || 0}.`);
            }
            insumo.Cantidad -= totalPeso;
            await queryRunner.manager.save(insumo);
        }
        // 3. Incrementar stock del producto final (una vez, después de procesar todos los insumos)
        const productoFinal = await queryRunner.manager.findOne(Producto_1.Producto, {
            where: { IdProducto: id }
        });
        if (!productoFinal) {
            throw new error_handler_1.HttpError(404, `El producto final con ID ${id} no fue encontrado.`);
        }
        productoFinal.Cantidad += cantidadProducida;
        await queryRunner.manager.save(productoFinal);
        await queryRunner.commitTransaction();
        return res.status(200).json({ message: "Producción registrada, recetas actualizadas y stock ajustado correctamente.", recetas: recetasActualizadas });
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        if (error instanceof error_handler_1.HttpError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor al procesar la producción." });
    }
    finally {
        await queryRunner.release();
    }
};
exports.registrarProduccionDeProducto = registrarProduccionDeProducto;
const actualizarIngredienteReceta = async (req, res) => {
    const { id } = req.params; // El ID del producto final cuya receta se va a actualizar
    const { cantidadProducida, ingredientes } = req.body;
    console.log(id, cantidadProducida, ingredientes);
    if (!id || !cantidadProducida || !ingredientes || !Array.isArray(ingredientes)) {
        return res.status(400).json({ message: "Faltan datos: id (en params), cantidadProducida y un array de ingredientes son requeridos." });
    }
    if (isNaN(cantidadProducida) || cantidadProducida <= 0) {
        return res.status(400).json({ message: "cantidadProducida debe ser un número positivo." });
    }
    const queryRunner = db_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const recetasActualizadasOcreadas = [];
        const idsIngredientesRecibidos = new Set();
        // Obtener todas las recetas existentes para este producto final
        const recetasExistentes = await queryRunner.manager.find(Ingrediente_1.Ingrediente, { where: { Producto: { IdProducto: id } }
        });
        const mapaRecetasExistentes = new Map(recetasExistentes.map(rec => [rec.IdIngrediente, rec]));
        for (const item of ingredientes) {
            const { IdIngrediente, totalPeso, ingredienteId, UnidadmedidaId } = item;
            if (!totalPeso || !ingredienteId || !UnidadmedidaId) {
                throw new error_handler_1.HttpError(400, `Datos incompletos para un ingrediente: totalPeso, ingredienteId, UnidadmedidaId son requeridos.`);
            }
            if (isNaN(totalPeso) || totalPeso <= 0) {
                throw new error_handler_1.HttpError(400, `totalPeso para el ingrediente ${ingredienteId} debe ser un número positivo.`);
            }
            const pesoPorUnidad = totalPeso;
            if (IdIngrediente && mapaRecetasExistentes.has(IdIngrediente)) {
                // Actualizar ingrediente existente en la receta
                const ingredienteActualizado = await (0, exports.updateIngrediente)({
                    IdINgredientes: IdIngrediente,
                    Peso: pesoPorUnidad,
                    ingredienteId,
                    id,
                    UnidadmedidaId
                });
                recetasActualizadasOcreadas.push(ingredienteActualizado);
                idsIngredientesRecibidos.add(IdIngrediente);
            }
            else {
                // Crear nuevo ingrediente en la receta
                const nuevoIngrediente = await (0, exports.createIngrediente)({
                    Peso: pesoPorUnidad,
                    ingredienteId,
                    id,
                    UnidadmedidaId
                });
                recetasActualizadasOcreadas.push(nuevoIngrediente);
                idsIngredientesRecibidos.add(nuevoIngrediente.IdIngrediente);
            }
        }
        // Eliminar ingredientes de la receta que ya no están en la lista enviada
        for (const recetaExistente of recetasExistentes) {
            if (!idsIngredientesRecibidos.has(recetaExistente.IdIngrediente)) {
                await queryRunner.manager.delete(Ingrediente_1.Ingrediente, { IdIngrediente: recetaExistente.IdIngrediente });
            }
        }
        const productoFinal = await queryRunner.manager.findOne(Producto_1.Producto, {
            where: { IdProducto: id }
        });
        if (!productoFinal) {
            throw new error_handler_1.HttpError(404, `El producto final con ID ${id} no fue encontrado.`);
        }
        productoFinal.Cantidad = cantidadProducida;
        await queryRunner.manager.save(productoFinal);
        await queryRunner.commitTransaction();
        return res.status(200).json({ message: "Receta de producto actualizada correctamente.", recetas: recetasActualizadasOcreadas });
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        if (error instanceof error_handler_1.HttpError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor al actualizar la receta del producto." });
    }
    finally {
        await queryRunner.release();
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
