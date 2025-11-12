import { Request, Response } from "express";
import { Estado } from "../entities/Estado";
import { Unidadmedida } from "../entities/UnidadMedida";
import { verifyEstado } from "./Estado.controllers";
import { HttpError } from "../utils/error.handler";
import { generarIdSecuencial } from "../utils/idGenerator";
import { Categoriamedida } from "../entities/CategoriaMedida";
import { createMediada, updateMediada } from "./Medida.controllers";


export const createCategoriaMedida = async (req: Request, res: Response) => {
  try {
    const { Registro } = req.body;

    const estado = await Estado.findOneBy({ IdEstado: 1 });

    if (!estado) return res.status(404).json({ message: "Estado no encontrado" });

   const nuevoId = await generarIdSecuencial('CTM'); 
  
    const unidadmedida = new Categoriamedida();

    unidadmedida.IdCategoriaMedida = nuevoId;
    unidadmedida.Nombre=Registro.Nombre;
    unidadmedida.FechaRegistro=new Date();
    unidadmedida.Estado = estado;
    
    
    await unidadmedida.save();
    
    if(Registro.Unidadmedida.length > 0)
    for(const medida of Registro.Unidadmedida)
        await createMediada({ Nombre:medida.Nombre, Cantidad:medida.Cantidad, Abreviatura:medida.Abreviatura, estado:medida.IdEstado,IdCategoria:nuevoId})

    return res.json({ message: `Registro exitoso.`});
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const deleteCategoriaMedida = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const unidadmedida = await Categoriamedida.findOne({
      where: { IdCategoriaMedida: id  },
      relations: ['Estado']
    });

    if (!unidadmedida) {
      return res.status(404).json({ message: "Unidad de medida no encontrado" });
    }
    
    const esActivo = unidadmedida.Estado?.IdEstado === 1;
    const nuevoEstadoId = esActivo ? 2 : 1; 
    const mensajeAccion = esActivo ? 'eliminaron' : 'habilitaron';

    const nuevoEstado = await verifyEstado({ EstadoId: nuevoEstadoId });

    if (!nuevoEstado) {
      return res.status(500).json({ message: "No se pudo obtener el estado requerido." });
    }

    unidadmedida.Estado = nuevoEstado;
    await unidadmedida.save();

    return res.json({ message: `Se ${mensajeAccion} los datos de la  Unidad de medida correctamente` });

  } catch (error) {
    console.error("Error al cambiar el estado del Unidadmedida:", error);
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const getMedidas = async (req: Request, res: Response) => {
  try {
    const Unidadmedidas = await Categoriamedida.find({
      relations: ['Estado','Unidadmedida','Unidadmedida.Estado']
    });


    return res.json(Unidadmedidas);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const getCategoriaMedidas = async (req: Request, res: Response) => {
  try {
    const Unidadmedidas = await Categoriamedida.find({
      where:{Estado:{IdEstado:1}}
    });


    return res.json(Unidadmedidas);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};


export const ObtenrCategoriaMedida = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const unidadmedida = await Categoriamedida.findOne({
        where:{  Unidadmedida:{IdUnidadMedida: Number(id)} },
        relations: ['Estado']
    });

    if (!unidadmedida) 
        return res.status(404).json({ message: "Unidad de medida no encontrado" });

    return res.json(unidadmedida);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const ObtenerMedidas = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const unidadmedida = await Unidadmedida.find({
        where:{ Categoria:{ IdCategoriaMedida:id} }
    });

    if (!unidadmedida) 
        return res.status(404).json({ message: "Unidad de medida no encontrado" });

    return res.json(unidadmedida);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const updateCateriaMedida = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { Registro } = req.body;
  
  console.log(Registro)
    
   const unidadmedida = await Categoriamedida.findOne(
    { where: { IdCategoriaMedida: id } });


    if (!unidadmedida) return res.status(404).json({ message: "Unidadmedida no encontrado" });
    
   if(Registro.Nombre) unidadmedida.Nombre=Registro.Nombre;
        unidadmedida.FechaActualizacion=new Date();



    await unidadmedida.save();

   if(Registro.Unidadmedida.length > 0)
    for(const medida of Registro.Unidadmedida)
        await updateMediada({Idmedida:medida.IdUnidadMedida, Nombre:medida.Nombre, Cantidad:medida.Cantidad, Abreviatura:medida.Abreviatura, estado:medida.IdEstado,IdCategoria:unidadmedida.IdCategoriaMedida})


    return res.json({ message: `Se actualizo correctamente.` });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const verifyCategoriaMedida = async ({ UnidadMedidaId }: { UnidadMedidaId: string }) => {

  const existUnidadMedida = await Categoriamedida.findOne({ 
    where: { IdCategoriaMedida: UnidadMedidaId } });

  if (!existUnidadMedida) {
    throw new HttpError(404, `L categoria de medida con ID ${UnidadMedidaId} no existe.`);
  }

  return existUnidadMedida;
};