import { Request, Response } from "express"
import { Imagen } from "../entities/Imagen"
import { HttpError } from "../utils/error.handler";
import { generarIdSecuencial } from "../utils/idGenerator";

export const createImagen = async ({  Foto }: {  Foto: string }) => {
  

   const nuevoId = await generarIdSecuencial('IMG');

    const imagen= new Imagen();
    imagen.IdImagen=nuevoId;
    if(Foto) imagen.Url=Foto;
    await imagen.save();

    return imagen;
};

export const updateImagen = async ({ ImagenId, Foto }: { ImagenId: string; Foto: string; }) => {

    const existImagen = await verifyImagen({ ImagenId: ImagenId  });
    
    if(Foto) existImagen.Url=Foto;
    
    await existImagen.save();

    return existImagen;
};

export const verifyImagen = async ({ ImagenId }: { ImagenId: string }) => {
    const existImagen = await Imagen.findOne({ where: { IdImagen: ImagenId } });
    if (!existImagen) {
    throw new HttpError(404, `La Imagen con ID ${ImagenId} no existe.`);
    }
    return existImagen;
};
