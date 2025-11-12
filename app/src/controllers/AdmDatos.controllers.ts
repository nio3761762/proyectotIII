import { Request, Response } from "express";
import { Administrardatos } from "../entities/AdmDatos";
import { Imagen } from "../entities/Imagen";
import { updateImagen } from "./Foto.controllers";
import { updateEmail } from "./Email.controllers";
import { verifyPersona } from "./Persona.controllers";


// Obtener todos
export const getDatos = async ( req: Request, res: Response) => {
    try {
        const datos = await Administrardatos.find({  relations: ['Imagen','Email','Persona'],});
        return res.json(datos);
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener los datos", error });
    }
};


// Actualizar
export const updateDatos = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { updateDatos } = req.body;
 
        const datos = await Administrardatos.findOne({ where: { IdDatos: parseInt(id) } });

        if (!datos) {
            return res.status(404).json({ message: "Dato no encontrado" });
        }

        if(updateDatos.Nombre) datos.Nombre = updateDatos.Nombre;
        if(updateDatos.IdPersona) datos.Persona =await verifyPersona({PersonaId:updateDatos.IdPersona});
        if(updateDatos.IdEmail)  datos.Email = await updateEmail({EmailId:updateDatos.IdEmail,email: updateDatos.Email});
        datos.Celular = updateDatos.Celular;
        await datos.save();

        return res.json({message:"Se actualizaron los datos de la Panaderia correctamente"});
    } catch (error) {
        return res.status(500).json({ message: "Error al actualizar el dato", error });
    }
};


export const updateDatosPhoto = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {  
            Foto,
        } = req.body;

        const datos = await Administrardatos.findOne({ where: { IdDatos: parseInt(id) },relations: ["Imagen"] });

        if (!datos) {
            return res.status(404).json({ message: "Dato no encontrado" });
        }
          let UpdateImagen;
  try {
      UpdateImagen= await updateImagen({  ImagenId:datos.Imagen.IdImagen,Foto  });
          } catch (error) {
              if (error instanceof Error)
              return res.status(400).json({ message: error.message });
          }
      
          if (!UpdateImagen) {
  return res.status(500).json({ message: "No se pudo actiualizar la Imagen" });
}
        
        datos.Imagen=UpdateImagen;
        await datos.save();
   

        return res.json({message:"Se actualizo la Imagen correctamente"});
    } catch (error) {
        return res.status(500).json({ message: "Error al actualizar el dato", error });
    }
};

export const verifyDatos = async ({DatoId }: { DatoId:number}) => {

    const existDato = await Administrardatos.findOne({ where: { IdDatos: DatoId } });
    
    
   if (!existDato) {
    throw new Error(`El Dato con ID ${existDato} no existe.`);
  }


    return existDato;
};