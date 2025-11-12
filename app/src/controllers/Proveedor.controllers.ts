import { Request, Response } from "express"
import { Proveedor } from "../entities/Proveedor"
import { verifyEstado } from "./Estado.controllers";

import { createPersona, updatePersona } from "./Persona.controllers";
import { generarIdSecuencial } from '../utils/idGenerator'; // Importar la función
import { createCelular, updateCelular } from "./Celular.controllers";
import { createDocumento, updateDocumento } from "./Documento.controllers";
import { Celular } from "../entities/Celular";
import { verifyTipoproveedor } from "./TipoProveedor.controllers";
import { HttpError } from "../utils/error.handler";


export const createProveedor = async (req:Request, res:Response) =>{

try {   
        const {Persona} = req.body;
       
    const nuevoId = await generarIdSecuencial('PROV'); // Generar el ID secuencial
      console.log(Persona)

         const proveedor = new Proveedor();     
        proveedor.IdProveedor = nuevoId;
        proveedor.Persona = await createPersona({ 
            Nombre:Persona.Nombre, 
            ApellidoPaterno:Persona.ApellidoPaterno, 
            ApellidoMaterno:Persona.ApellidoMaterno, 
            FechaDeNacimiento:Persona.FechaDeNacimiento, 
            IdGenero:Persona.IdGenero, 
            email:Persona.Email, 
           // Salario, 
            BarrioId:Persona.IdBarrio, 
            Direccion:Persona.Direccion, 
            Referencia:Persona.Referencia,
            Url:Persona.Url,
          })
         proveedor.Estado= await verifyEstado({EstadoId:1});
         if(Persona.RazonSocial)proveedor.RazonSocial = Persona.RazonSocial;
         proveedor.Tipoproveedor = await verifyTipoproveedor({TipoproveedorId:Persona.IdTipoProveedor}) 
     await proveedor.save()
      
     const persona = await Proveedor.findOne({
                  where:  { IdProveedor: nuevoId } ,
                 relations: ['Persona'], 
             });
              if(!persona){
              return res.status(404).json('Usuario no encontrado')
          }
    if(Persona.Celulares.length>0)
    for(const celules of Persona.Celulares)
    await createCelular({Numero:celules.Numero, PersonaId: persona.Persona.IdPersona}) 

       if(Persona.Documento.length>0)
      for(const documento of Persona.Documento)
        await createDocumento({IdTipoDocumento:documento.IdTipodocumento,IdComplemento:documento.Complemento,Documentos:documento.Documento,PersonaId: persona.Persona.IdPersona})    
  
        return res.json({message : "El Proveedor se registro correctamente"})

} catch (error) {
    if(error instanceof Error){
      console.error("Error al crear Proveedor:", error);
            return res.status(500).json({message: error.message})
        }
    }
}

export const getProveedores = async ( req:Request, res:Response) =>{
    try {
      
        const Proveedors = await Proveedor.find({ relations: ["Estado","Persona","Tipoproveedor",
          "Persona.Email","Persona.Estado","Persona.Genero",
          "Persona.Imagen","Persona.Celulares","Persona.Documento",
          "Persona.Documento.Tipodocumento","Persona.Documento.Complemento",
          "Persona.Direccion.Barrio",
          ]});
        return res.json(Proveedors)    
    } catch (error) {
        if(error instanceof Error){
            return res.status(500).json({message: error.message})
        }
    }
}

export const updateProveedor = async (req:Request, res:Response) => {

    try {
        const { id } = req.params;

        const {Persona} = req.body;
    
    const proveedor = await Proveedor.findOne({
             where:  { IdProveedor: id } ,
            relations: ['Persona'], 
        });
    
    if(!proveedor) return res.status(404).json({message: 'Proveedor no existe'});

        proveedor.Persona = await updatePersona({ 
            IdPersona:proveedor.Persona.IdPersona,
            Nombre:Persona.Nombre, 
            ApellidoPaterno:Persona.ApellidoPaterno, 
            ApellidoMaterno:Persona.ApellidoMaterno, 
            FechaDeNacimiento:Persona.FechaDeNacimiento, 
            IdGenero:Persona.IdGenero, 
            IdEmail:Persona.IdEmail,
            email:Persona.Email, 
           // Salario, 
            IdDireccion:Persona.IdDireccion,
            BarrioId:Persona.IdBarrio, 
            Direccion:Persona.Direccion, 
            Referencia:Persona.Referencia,
            IdImagen:Persona.IdImagen,
            Url:Persona.Url,
          });
          if(Persona.RazonSocial)proveedor.RazonSocial = Persona.RazonSocial;
          proveedor.Tipoproveedor = await verifyTipoproveedor({TipoproveedorId:Persona.IdTipoProveedor});

     await proveedor.save()
     
      
        
         if (Persona.Celulares && Persona.Celulares.length > 0) {
  const celularesActuales = await Celular.find({
    where: { Persona: { IdPersona: proveedor.Persona.IdPersona } }
  });

  const idsEnviados = Persona.Celulares
    .filter((c: { IdCelular: any; }) => c.IdCelular) // solo los que tienen ID
    .map((c: { IdCelular: any; }) => c.IdCelular);

  for (const celularExistente of celularesActuales) {
    if (!idsEnviados.includes(celularExistente.IdCelular)) {
      await celularExistente.remove(); // o .destroy() si usas Sequelize
    }
  }

  
  for (const celules of Persona.Celulares) {
    await updateCelular({
      CelularId: celules.IdCelular,
      Numero: celules.Numero,
      PersonaId: proveedor.Persona.IdPersona
    });
  }
}


       if(Persona.Documento.length>0)
      for(const documento of Persona.Documento)
        await updateDocumento({DocumentoId:documento.IdDocumento, IdTipoDocumento:documento.IdTipodocumento,IdComplemento:documento.Complemento,Documentos:documento.Documento,PersonaId:proveedor.Persona.IdPersona})    


     return res.json({message : "El Proveedor se actualizo correctamente"})
     } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({message: error.message})
        }
    }
}

export const deleteProveedor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const proveedor = await Proveedor.findOne({
      where: { IdProveedor: id },
      relations: ['Estado']
    });

    if (!proveedor) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }
    
    const esActivo = proveedor.Estado?.IdEstado === 1;
    const nuevoEstadoId = esActivo ? 2 : 1; 
    const mensajeAccion = esActivo ? 'eliminaron' : 'habilitaron';

    const nuevoEstado = await verifyEstado({ EstadoId: nuevoEstadoId });

    if (!nuevoEstado) {
      return res.status(500).json({ message: "No se pudo obtener el estado requerido." });
    }

    proveedor.Estado = nuevoEstado;
    await proveedor.save();

    return res.json({ message: `Se ${mensajeAccion} los datos del Proveedor correctamente` });

  } catch (error) {
    console.error("Error al cambiar el estado del Proveedor:", error);
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

//buscar Proveedor por id
export const getProveedor = async (req:Request, res: Response) => {
    try {
        const {id} = req.params;
        const proveedor = await Proveedor.findOne({where:{IdProveedor: id}, 
        relations: ["Estado","Persona","Tipoproveedor",
          "Persona.Email","Persona.Estado","Persona.Genero",
          "Persona.Imagen","Persona.Celulares","Persona.Documento",
          "Persona.Documento.Tipodocumento","Persona.Documento.Complemento",
          "Persona.Direccion.Barrio"],});
        
        if(proveedor){
            return res.status(404).json('Proveedor not found')
        }
        return res.json({
            //...
            proveedor
            // CorreoElectronico: decryptedEmail
        });

        //return res.json(Proveedor);
    } catch (error) {
        if(error instanceof Error){
            return res.status(500).json({ message: error.message})
        }
    }
}

export const verifyProveedor = async ({ TipoproveedorId }: { TipoproveedorId: string }) => {

    const existTipoproveedor = await Proveedor.findOne({ where: { IdProveedor: TipoproveedorId } });
    
    
   if (!existTipoproveedor) {
    throw new HttpError(404,`El Proveedor con ID ${TipoproveedorId} no existe.`);
  }
  
    return existTipoproveedor;
};