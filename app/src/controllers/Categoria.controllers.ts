import { Request, Response } from "express";
import { Categoria } from "../entities/Categoria";
import { verifyEstado } from "./Estado.controllers";
import { Estado } from "../entities/Estado";
import { createImagen, updateImagen } from "./Foto.controllers";
import { Subcategoria } from "../entities/SubCategoria";
import { HttpError } from "../utils/error.handler";
import { generarIdSecuencial } from "../utils/idGenerator";


export const getCategorias = async (req: Request, res: Response) => {
    try {

        const categorias = await Categoria.find({ relations: ['Estado', 'Imagen', 'Subcategoria', 'Subcategoria.Estado', 'Subcategoria.Categoria'] });
        return res.json(categorias)
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message })
        }
    }
}


export const getCategoria = async (req: Request, res: Response) => {
    try {
         const { id } = req.params;

        const categorias = await Subcategoria.find({ 
            where:{Categoria:{IdCategoria:id},
                Estado:{IdEstado:1}}
    });
        return res.json(categorias)
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message })
        }
    }
}

export const getSubCategoria = async (req: Request, res: Response) => {
    try {
         const { id } = req.params;

        const categorias = await Categoria.findOne({ 
            where:{Subcategoria:{IdSubCategoria:id},
                Estado:{IdEstado:1}},});
        return res.json(categorias)
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message })
        }
    }
}

export const verifyCategoria = async ({ CategoriaId }: { CategoriaId: string }) => {
    const existCategoria = await Categoria.findOne({ where: { IdCategoria: CategoriaId } });
    if (!existCategoria) {
        throw new HttpError(404, `La categoria con ID ${CategoriaId} no existe.`);
    }
    return existCategoria;
};

export const verifySubCategoria = async ({ CategoriaId }: { CategoriaId: string }) => {
    const existCategoria = await Subcategoria.findOne({ where: { IdSubCategoria: CategoriaId } });
    if (!existCategoria) {
        throw new HttpError(404, `La Sub categoria con ID ${CategoriaId} no existe.`);
    }
    return existCategoria;
};



export const deleteCategoria = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const categoria = await Categoria.findOne({
            where: { IdCategoria: id },
            relations: ['Estado']
        });

        if (!categoria) {
            return res.status(404).json({ message: "Categoria no encontrado" });
        }

        const esActivo = categoria.Estado?.IdEstado === 1;
        const nuevoEstadoId = esActivo ? 2 : 1;
        const mensajeAccion = esActivo ? 'eliminaron' : 'habilitaron';

        const nuevoEstado = await verifyEstado({ EstadoId: nuevoEstadoId });

        if (!nuevoEstado) {
            return res.status(500).json({ message: "No se pudo obtener el estado requerido." });
        }

        categoria.Estado = nuevoEstado;
        await categoria.save();

        return res.json({ message: `Se ${mensajeAccion} los datos de la Categoria correctamente` });

    } catch (error) {
        console.error("Error al cambiar el estado del Categoria:", error);
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};


export const createCategoria = async (req: Request, res: Response) => {
    try {
        const { RegistroCategoria } = req.body;

        const estado = await Estado.findOneBy({ IdEstado: 1 });

        if (!estado) return res.status(404).json({ message: "Estado no encontrado" });

        const nuevoId = await generarIdSecuencial('CAT');

        const categoria = new Categoria();
        categoria.IdCategoria = nuevoId;
        categoria.Nombre = RegistroCategoria.Nombre;
        categoria.FechaRegistro = new Date();
        categoria.Estado = estado;
        if (RegistroCategoria.Url) {
            const imagen = await createImagen({ Foto: RegistroCategoria.Url });
            categoria.Imagen = imagen;
        }
        await categoria.save();


        if (RegistroCategoria.Subcategoria.length > 0) {
            for (const sub of RegistroCategoria.Subcategoria) {
                const nombreValido = sub.Nombre && sub.Nombre.trim() !== '';

                if (!nombreValido) {
                    continue; // Salta a la siguiente
                } else
                    await CreateSubCategoria({
                        Nombre: sub.Nombre,
                        IdEstado: sub.IdEstado,
                        CategoriaId: nuevoId
                    });

            }
        }

        return res.json({ message: "La Categoria se registró correctamente" });
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};


export const updateCategoria = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { RegistroCategoria } = req.body;

        const categoria = await Categoria.findOne({
            where: { IdCategoria: id },
            relations: ['Estado']
        });

        if (!categoria) {
            return res.status(404).json({ message: "Categoria no encontrado" });
        }

        if (RegistroCategoria.Nombre) categoria.Nombre = RegistroCategoria.Nombre;
        if (RegistroCategoria.IdImagen) {
            const imagen = await updateImagen({ ImagenId: RegistroCategoria.IdImagen, Foto: RegistroCategoria.Url });
            categoria.Imagen = imagen;
        } else {
            if (RegistroCategoria.Url) {
                const imagen = await createImagen({ Foto: RegistroCategoria.Url });
                categoria.Imagen = imagen;
            }
        }
        categoria.FechaActualizacion = new Date();

        await categoria.save();

        if (RegistroCategoria.Subcategoria.length > 0)
            for (const sub of RegistroCategoria.Subcategoria)
                await UpdateSubCategoria({ SubCategoriaId: sub.IdSubCategoria, Nombre: sub.Nombre, IdEstado: sub.IdEstado, CategoriaId: categoria.IdCategoria })


        return res.json({ message: "La Categoria se actualizo correctamente" });
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const CreateSubCategoria = async ({ Nombre, IdEstado, CategoriaId }: { Nombre: string, IdEstado: number, CategoriaId: string }) => {


    const nuevoId = await generarIdSecuencial('SCT');
    const subcategoria = new Subcategoria();
    subcategoria.IdSubCategoria = nuevoId;
    subcategoria.Categoria = await verifyCategoria({ CategoriaId: CategoriaId })
    subcategoria.Nombre = Nombre;
    subcategoria.Estado = await verifyEstado({ EstadoId: IdEstado });

    await subcategoria.save();


    return subcategoria;

};


export const UpdateSubCategoria = async ({
    SubCategoriaId,
    Nombre,
    IdEstado,
    CategoriaId
}: {
    SubCategoriaId: string;
    Nombre: string;
    IdEstado: number;
    CategoriaId: string;
}) => {
    const nombreValido = Nombre && Nombre.trim() !== '';

    if (SubCategoriaId) {
        const subcategoria = await verifySubCategoria({ CategoriaId: SubCategoriaId });

        if (nombreValido) {
            subcategoria.Nombre = Nombre;
        }

        subcategoria.Estado = await verifyEstado({ EstadoId: IdEstado });

        await subcategoria.save();

        return subcategoria;
    }

    if (nombreValido) {
        return await CreateSubCategoria({
            Nombre,
            CategoriaId,
            IdEstado
        });
    } else {
        return null;
    }
};


export const createSubCategoria = async (req: Request, res: Response) => {
    try {
        const { RegistroSubCategoria } = req.body;

        const estado = await Estado.findOneBy({ IdEstado: 1 });

        if (!estado) return res.status(404).json({ message: "Estado no encontrado" });
        const nuevoId = await generarIdSecuencial('SCT');
        const subcategoria = new Subcategoria();
        subcategoria.IdSubCategoria = nuevoId;
        subcategoria.Nombre = RegistroSubCategoria.Nombre;
        subcategoria.Estado = estado;
        if (RegistroSubCategoria.IdCategoria) {
            const categoria = await verifyCategoria({ CategoriaId: RegistroSubCategoria.IdCategoria });
            subcategoria.Categoria = categoria;
        }

        await subcategoria.save();

        return res.json({ message: "La Sub Categoria se registró correctamente" });
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const updateSubCategoria = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { RegistroSubCategoria } = req.body;



        const subcategoria = await Subcategoria.findOne({
            where: { IdSubCategoria: id },
            relations: ['Estado']
        });

        if (!subcategoria) {
            return res.status(404).json({ message: "Sub Categoria no encontrado" });
        }


        if (RegistroSubCategoria.Nombre) subcategoria.Nombre = RegistroSubCategoria.Nombre;

        await subcategoria.save();

        return res.json({ message: "La Sub Categoria se actualizó correctamente" });
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};


export const deleteSubCategoria = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const subcategoria = await Subcategoria.findOne({
            where: { IdSubCategoria: id },
            relations: ['Estado']
        });

        if (!subcategoria) {
            return res.status(404).json({ message: "Sub Categoria no encontrado" });
        }

        const esActivo = subcategoria.Estado?.IdEstado === 1;
        const nuevoEstadoId = esActivo ? 2 : 1;
        const mensajeAccion = esActivo ? 'eliminaron' : 'habilitaron';

        const nuevoEstado = await verifyEstado({ EstadoId: nuevoEstadoId });

        if (!nuevoEstado) {
            return res.status(500).json({ message: "No se pudo obtener el estado requerido." });
        }

        subcategoria.Estado = nuevoEstado;
        await subcategoria.save();

        return res.json({ message: `Se ${mensajeAccion} los datos de la sub Categoria correctamente` });

    } catch (error) {
        console.error("Error al cambiar el estado del Categoria:", error);
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const getSubCategorias = async (req: Request, res: Response) => {
    try {

        const subcategorias = await Subcategoria.find({ relations: ['Estado', 'Categoria'] });

        if (!subcategorias) {
            return res.status(404).json({ message: "Sub Categorias no encontradas" });
        }
        return res.json(subcategorias)
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message })
        }
    }
}