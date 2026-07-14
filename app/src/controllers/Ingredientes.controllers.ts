import { Ingrediente } from "../entities/Ingrediente";
import { AppDataSource } from "../db";
import { Producto } from "../entities/Producto";
import { HttpError } from "../utils/error.handler";
import { generarIdSecuencial } from "../utils/idGenerator";
import { verifyUnidadMedida } from "./Medida.controllers";
import { verifyProducto } from "./Producto.controllers";
import { Request, Response } from "express";
import { verifyInsumo } from "./Insumo.controllers";
import { Receta } from "../entities/Receta";

export const verifyIngrediente = async ({ IngredienteId }: { IngredienteId: string }) => {

    const existUnidadMedida = await Ingrediente.findOne({
        where: { IdIngrediente: IngredienteId }
    });

    if (!existUnidadMedida) {
        throw new HttpError(404, `El ingrediente con ID ${IngredienteId} no existe.`);
    }

    return existUnidadMedida;
};
export const verifyReceta = async (RecetaId: string ) => {

  const existProducto = await Receta.findOne({ where: { IdReceta: RecetaId } });


  if (!existProducto) {
    throw new HttpError(404, `La receta con ID ${RecetaId} no existe.`);
  }

  return existProducto;
};

export const createIngrediente = async (  Peso: number, ingredienteId: string,receta:Receta, UnidadmedidaId: number ) => {
  
    const ingrediente = new Ingrediente();

    ingrediente.Insumo = await verifyInsumo({ ProductoId: ingredienteId });
    ingrediente.Receta = receta;
    ingrediente.Peso = Peso;
    ingrediente.Unidadmedida = await verifyUnidadMedida({UnidadMedidaId: UnidadmedidaId });
    ingrediente.Pesoconvertido = Peso * ingrediente.Unidadmedida.Cantidad;
    ingrediente.IdIngrediente = await generarIdSecuencial('INGR');

    await ingrediente.save();
    return ingrediente;
};

export const updateIngrediente = async (  IdINgredientes: string, Peso: number, ingredienteId: string, receta:Receta, UnidadmedidaId: number ) => {

    if (!IdINgredientes) {
        return createIngrediente( Peso, ingredienteId, receta, UnidadmedidaId )
    }
    const ingrediente = await verifyIngrediente({ IngredienteId: IdINgredientes });
    ingrediente.Insumo = await verifyInsumo({ ProductoId: ingredienteId });
    ingrediente.Peso = Peso;
    ingrediente.Unidadmedida = await verifyUnidadMedida({ UnidadMedidaId: UnidadmedidaId });
    ingrediente.Pesoconvertido = Peso * ingrediente.Unidadmedida.Cantidad;
    await ingrediente.save();
    return ingrediente;
};


export const getProductoIngrediente = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await AppDataSource.query(`
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

  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const ObtenerIngredientes = async ({ IngredienteId }: { IngredienteId: string }) => {

    const existUnidadMedida = await Ingrediente.find({
        where: { Receta:{IdReceta: IngredienteId} }
    });


    return existUnidadMedida || [];
};

export const registrarProduccionDeProducto = async (req: Request, res: Response) => {
   try {
    const { ingredientes,Recetas } = req.body;
       const receta = new Receta();
       
       receta.CantidadPorLata= Recetas.cantidad // cuantos productos por lata entra
       receta.Producto = await verifyProducto({ProductoId:Recetas.IdProducto})
       receta.Rendimiento = Recetas.Rendimiento // CUÁNTOS PRODUCTOS PRODUCE
       receta.TiempoHorneadoMin = Recetas.Tiempo
       receta.IdReceta = await generarIdSecuencial('REC');
   
        await receta.save()
       
        for (const ingret of ingredientes){
        await createIngrediente(ingret.Peso,ingret.Insumo,receta,ingret.UnidadMedida)
       }
        return res.status(200).json({ message: "Producción registrada, recetas actualizadas y stock ajustado correctamente." });

    } catch (error) {
        
        
        if (error instanceof HttpError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({ message: "Error interno del servidor al procesar la producción." });

    } 
};

export const actualizarIngredienteReceta = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; 
    const { ingredientes, Recetas } = req.body;
    
    const receta = await Receta.findOne({
      where: { IdReceta: id },
      relations: ['Ingredientes']
    });

    if (!receta)
      return res.status(400).json({ message: "Receta no encontrado" });

       if(Recetas.cantidad >0 )receta.CantidadPorLata= Recetas.cantidad // cuantos productos por lata entra
       if(Recetas.Rendimiento> 0)receta.Rendimiento = Recetas.Rendimiento // CUÁNTOS PRODUCTOS PRODUCE
       if(Recetas.Tiempo > 0)receta.TiempoHorneadoMin = Recetas.Tiempo
    
       await receta.save();

    // 🔥 crear o actualizar
    for (const ingret of ingredientes || []) {
      await updateIngrediente(
        ingret.IdIngrediente, ingret.Peso, ingret.Insumo,receta, ingret.UnidadMedida);
    }

    return res.status(200).json({
      message: "Receta de producto actualizada correctamente."
    });

  } catch (error) {
     console.error("ERROR REAL:", error);
    return res.status(500).json({
      message: "Error interno del servidor al actualizar la receta del producto."
     , error: error instanceof Error ? {
      message: error.message,
      stack: error.stack
    } : error});
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

   
