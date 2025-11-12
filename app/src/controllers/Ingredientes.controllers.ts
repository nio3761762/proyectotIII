import { Ingrediente } from "../entities/Ingrediente";
import { AppDataSource } from "../db";
import { Producto } from "../entities/Producto";
import { HttpError } from "../utils/error.handler";
import { generarIdSecuencial } from "../utils/idGenerator";
import { verifyUnidadMedida } from "./Medida.controllers";
import { verifyProducto } from "./Producto.controllers";
import { Request, Response } from "express";

export const verifyIngrediente = async ({ IngredienteId }: { IngredienteId: string }) => {

    const existUnidadMedida = await Ingrediente.findOne({
        where: { IdIngrediente: IngredienteId }
    });

    if (!existUnidadMedida) {
        throw new HttpError(404, `El ingrediente con ID ${IngredienteId} no existe.`);
    }

    return existUnidadMedida;
};

export const createIngrediente = async ({ Peso, ingredienteId, id, UnidadmedidaId }: { Peso: number, ingredienteId: string, id: string, UnidadmedidaId: number }) => {
  
    const ingrediente = new Ingrediente();

    ingrediente.Ingredientes = await verifyProducto({ ProductoId: ingredienteId });
    ingrediente.Producto = await verifyProducto({ ProductoId: id });
    ingrediente.Peso = Peso;
    ingrediente.Unidadmedida = await verifyUnidadMedida({ UnidadMedidaId: UnidadmedidaId });
    ingrediente.IdIngrediente = await generarIdSecuencial('INGR');

    await ingrediente.save();
    return ingrediente;
};

export const updateIngrediente = async ({ IdINgredientes, Peso, ingredienteId, id, UnidadmedidaId }: { IdINgredientes: string, Peso: number, ingredienteId: string, id: string, UnidadmedidaId: number }) => {

    if (!IdINgredientes) {
        console.log("Registrando ingrediente")
        return createIngrediente({ Peso, ingredienteId, id, UnidadmedidaId })
    }
    const ingrediente = await verifyIngrediente({ IngredienteId: IdINgredientes });
    ingrediente.Ingredientes = await verifyProducto({ ProductoId: ingredienteId });
    ingrediente.Producto = await verifyProducto({ ProductoId: id });
    ingrediente.Peso = Peso;
    ingrediente.Unidadmedida = await verifyUnidadMedida({ UnidadMedidaId: UnidadmedidaId });
    await ingrediente.save();
    return ingrediente;
};


export const getProductoIngrediente = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const producto = await Ingrediente.find({
            where: { Producto: { IdProducto: id } },
            relations: ['Ingredientes', 'Unidadmedida', 'Unidadmedida.Categoria']
        });

        if (!producto) return res.status(404).json({ message: "Producto no encontrado" });

        const ingrediente = producto.map(p => ({
            IdIngrediente: p?.IdIngrediente,     // cuidado con la mayúscula, debe coincidir con tu modelo
            Peso: p?.Peso,
            IdInsumo: p?.Ingredientes?.IdProducto,
            IdUnidadMedida: p?.Unidadmedida?.IdUnidadMedida,
            IdCategoriaMedida: p?.Unidadmedida?.Categoria?.IdCategoriaMedida
        }));
        return res.json(ingrediente);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const ObtenerIngredientes = async ({ IngredienteId }: { IngredienteId: string }) => {

    const existUnidadMedida = await Ingrediente.find({
        where: { Producto:{IdProducto: IngredienteId} }
    });


    return existUnidadMedida || [];
};

export const registrarProduccionDeProducto = async (req: Request, res: Response) => {
    const { id, cantidadProducida, ingredientes } = req.body;

    if (!id || !cantidadProducida || !ingredientes || !Array.isArray(ingredientes) || ingredientes.length === 0) {
        return res.status(400).json({ message: "Faltan datos: id, cantidadProducida y un array de ingredientes son requeridos." });
    }

    if (isNaN(cantidadProducida) || cantidadProducida <= 0) {
        return res.status(400).json({ message: "cantidadProducida debe ser un número positivo." });
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const recetasActualizadas = [];

        for (const item of ingredientes) {
            const { totalPeso, ingredienteId, UnidadmedidaId } = item;

            if (!totalPeso || !ingredienteId || !UnidadmedidaId) {
                throw new HttpError(400, `Datos incompletos para un ingrediente: totalPeso, ingredienteId, UnidadmedidaId son requeridos.`);
            }

            if (isNaN(totalPeso) || totalPeso <= 0) {
                throw new HttpError(400, `totalPeso para el ingrediente ${ingredienteId} debe ser un número positivo.`);
            }

            const pesoPorUnidad = totalPeso / cantidadProducida;

            // 1. Definir/Actualizar la receta (peso por unidad)
            const nuevoIngredienteReceta = await createIngrediente({ Peso: pesoPorUnidad, ingredienteId, id, UnidadmedidaId });
            recetasActualizadas.push(nuevoIngredienteReceta);

            // 2. Descontar stock del insumo
            const insumo = await queryRunner.manager.findOne(Producto, {
                where: { IdProducto: ingredienteId }
            });

            if (!insumo || insumo.Cantidad < totalPeso) {
                throw new HttpError(400, `Stock insuficiente para el insumo ${insumo?.Nombre || ingredienteId}. Se necesitan ${totalPeso} y hay ${insumo?.Cantidad || 0}.`);
            }

            insumo.Cantidad -= totalPeso;
            await queryRunner.manager.save(insumo);
        }

        // 3. Incrementar stock del producto final (una vez, después de procesar todos los insumos)
        const productoFinal = await queryRunner.manager.findOne(Producto, {
            where: { IdProducto: id }
        });

        if (!productoFinal) {
            throw new HttpError(404, `El producto final con ID ${id} no fue encontrado.`);
        }

        productoFinal.Cantidad += cantidadProducida;
        await queryRunner.manager.save(productoFinal);

        await queryRunner.commitTransaction();

        return res.status(200).json({ message: "Producción registrada, recetas actualizadas y stock ajustado correctamente.", recetas: recetasActualizadas });

    } catch (error) {
        await queryRunner.rollbackTransaction();
        
        if (error instanceof HttpError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor al procesar la producción." });

    } finally {
        await queryRunner.release();
    }
};

export const actualizarIngredienteReceta = async (req: Request, res: Response) => {
    const {id }= req.params; // El ID del producto final cuya receta se va a actualizar
    const { cantidadProducida, ingredientes } = req.body;
         console.log(id,cantidadProducida, ingredientes)
    if (!id || !cantidadProducida || !ingredientes || !Array.isArray(ingredientes)) {
        return res.status(400).json({ message: "Faltan datos: id (en params), cantidadProducida y un array de ingredientes son requeridos." });
    }

    if (isNaN(cantidadProducida) || cantidadProducida <= 0) {
        return res.status(400).json({ message: "cantidadProducida debe ser un número positivo." });
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const recetasActualizadasOcreadas = [];
        const idsIngredientesRecibidos = new Set();

        // Obtener todas las recetas existentes para este producto final
        const recetasExistentes = await queryRunner.manager.find(
            Ingrediente, { where: { Producto: { IdProducto: id } }
        });
        const mapaRecetasExistentes = new Map(recetasExistentes.map(rec => [rec.IdIngrediente, rec]));

        for (const item of ingredientes) {
            const { IdIngrediente, totalPeso, ingredienteId, UnidadmedidaId } = item;

            if (!totalPeso || !ingredienteId || !UnidadmedidaId) {
                throw new HttpError(400, `Datos incompletos para un ingrediente: totalPeso, ingredienteId, UnidadmedidaId son requeridos.`);
            }

            if (isNaN(totalPeso) || totalPeso <= 0) {
                throw new HttpError(400, `totalPeso para el ingrediente ${ingredienteId} debe ser un número positivo.`);
            }

            const pesoPorUnidad = totalPeso;

            if (IdIngrediente && mapaRecetasExistentes.has(IdIngrediente)) {
                // Actualizar ingrediente existente en la receta
                const ingredienteActualizado = await updateIngrediente({
                    IdINgredientes: IdIngrediente,
                    Peso: pesoPorUnidad,
                    ingredienteId,
                    id,
                    UnidadmedidaId
                });
                recetasActualizadasOcreadas.push(ingredienteActualizado);
                idsIngredientesRecibidos.add(IdIngrediente);
            } else {
                // Crear nuevo ingrediente en la receta
                const nuevoIngrediente = await createIngrediente({
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
                await queryRunner.manager.delete(Ingrediente, { IdIngrediente: recetaExistente.IdIngrediente });
            }
        }

       
        
         const productoFinal = await queryRunner.manager.findOne(Producto, {
            where: { IdProducto: id }
        });

        if (!productoFinal) {
            throw new HttpError(404, `El producto final con ID ${id} no fue encontrado.`);
        }

        productoFinal.Cantidad = cantidadProducida;
        await queryRunner.manager.save(productoFinal);

        await queryRunner.commitTransaction();

        return res.status(200).json({ message: "Receta de producto actualizada correctamente.", recetas: recetasActualizadasOcreadas });

    } catch (error) {
        await queryRunner.rollbackTransaction();
        
        if (error instanceof HttpError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor al actualizar la receta del producto." });
    } finally {
        await queryRunner.release();
    }
};

export const eliminarIngredienteReceta = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // Id del registro de Ingrediente (la receta)

        if (!id) {
            return res.status(400).json({ message: "El ID del ingrediente de la receta es requerido." });
        }

        const result = await Ingrediente.delete({ IdIngrediente: id });

        if (result.affected === 0) {
            return res.status(404).json({ message: "Receta de ingrediente no encontrada." });
        }

        return res.status(200).json({ message: "Receta de ingrediente eliminada correctamente." });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor al eliminar la receta del ingrediente." });
    }
};

   
