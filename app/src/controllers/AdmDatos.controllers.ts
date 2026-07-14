import { Request, Response } from "express";
import { Administrardatos } from "../entities/AdmDatos";
import { verifyPersona } from "./Persona.controllers";
import { AppDataSource } from "../db";


// Obtener todos
export const getDatos = async ( req: Request, res: Response) => {
    try {
      const result = await AppDataSource.query(`
      SELECT 
          ad.*,
          row_to_json(p) AS persona
      FROM administrardatos ad
      LEFT JOIN persona p 
          ON p.idpersona = ad.idpropietario;
    `);

    //  siempre devuelve array
    return res.json(result.length > 0 ? result : []);
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
        if(updateDatos.Email)  datos.Email = updateDatos.Email;
        if(updateDatos.Url) datos.Foto = updateDatos.Url
        if( updateDatos.Celular) datos.Celular = updateDatos.Celular;
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

        const datos = await Administrardatos.findOne({ where: { IdDatos: parseInt(id) }});

        if (!datos) {
            return res.status(404).json({ message: "Dato no encontrado" });
        }
          if (Foto) datos.Foto=Foto;
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