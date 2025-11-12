import { Request, Response } from "express";
import { Persona } from "../entities/Persona";
import { createDireccion, updateDireccion } from "./Direccion.controllers";
import { verifyEstado } from "./Estado.controllers";
import { verifyGenero } from "./Genero.controllers";
import { verifySalario } from "./Salario.controllers";
import { createEmail, updateEmail } from "./Email.controllers";
import { verifyTipodocumento } from "./IdTipodocumento.controllers";
import { createCelular, updateCelular } from "./Celular.controllers";
import { createImagen, updateImagen } from "./Foto.controllers";
import { HttpError } from "../utils/error.handler";
import { Celular } from "../entities/Celular";
import { generarIdSecuencial } from "../utils/idGenerator";
import { createDocumento, updateDocumento } from "./Documento.controllers";
import { IsNull } from "typeorm";



export const AnanirPersona = async ({ 
      Nombre,
      ApellidoPaterno,
      ApellidoMaterno,
      FechaDeNacimiento,
      IdGenero,
      email,
       }
      : {  Nombre: string,
      ApellidoPaterno:string,
      ApellidoMaterno:string,
      FechaDeNacimiento:string,
      IdGenero:number,
      email:string,
     }) => {

 

    // Obtener último ID

    const nuevoId = await generarIdSecuencial('PER');
       
    // Crear nueva persona
    const nueva = new Persona();
    nueva.IdPersona = nuevoId;
    if(Nombre) nueva.Nombre = Nombre;
    if(ApellidoPaterno)nueva.ApellidoPaterno = ApellidoPaterno;
    if(ApellidoMaterno)nueva.ApellidoMaterno = ApellidoMaterno;
    if(FechaDeNacimiento) nueva.FechaDeNacimiento = new Date(FechaDeNacimiento);
    nueva.Estado = await verifyEstado({ EstadoId: 1 });
    nueva.FechaRegistro = new Date();
    nueva.Genero = await verifyGenero({GeneroId:IdGenero});
   
    // if(Salario)
    // nueva.Salario=await verifySalario({SalarioId:Salario});
     await nueva.save();
     if(email)
      await createEmail({email:email,idpersona:nuevoId});

    return nueva;
 
};


export const createPersona = async ({ 
      Nombre,
      ApellidoPaterno,
      ApellidoMaterno,
      FechaDeNacimiento,
      IdGenero,
      email,
      BarrioId,
      Direccion,
      Referencia,
       Url
       }
      : {  Nombre: string,
      ApellidoPaterno:string,
      ApellidoMaterno:string,
      FechaDeNacimiento:string,
      IdGenero:number,
      email:string,
      BarrioId:string,
      Direccion:string,
      Referencia:string,
      Url:string
     }) => {

 

    // Obtener último ID

    const nuevoId = await generarIdSecuencial('PER');
       
    // Crear nueva persona
    const nueva = new Persona();
    nueva.IdPersona = nuevoId;
    if(Nombre) nueva.Nombre = Nombre;
    if(ApellidoPaterno)nueva.ApellidoPaterno = ApellidoPaterno;
    if(ApellidoMaterno)nueva.ApellidoMaterno = ApellidoMaterno;
    if(FechaDeNacimiento) nueva.FechaDeNacimiento = new Date(FechaDeNacimiento);
    nueva.Estado = await verifyEstado({ EstadoId: 1 });
    nueva.FechaRegistro = new Date();
   if (BarrioId || Direccion || Referencia) {
  nueva.Direccion = await createDireccion({
    BarrioId: BarrioId ?? null,
    Direccions: Direccion ?? '',
    Referencia: Referencia ?? '',
    Ubicacion: ''
  });
}   nueva.Genero = await verifyGenero({GeneroId:IdGenero});
    if(Url) nueva.Imagen = await createImagen({Foto:Url});
   
    // if(Salario)
    // nueva.Salario=await verifySalario({SalarioId:Salario});
     await nueva.save();
      await createEmail({email:email,idpersona:nuevoId});

    return nueva;
 
};

export const verifyPersona = async ({ PersonaId }: { PersonaId: string }) => {

    const existPersona = await Persona.findOne({ where: { IdPersona: PersonaId }, relations:['Email'] });
       
   if (!existPersona) {
    throw new HttpError(404,`La persona con ID ${PersonaId} no existe.`);

  }
  
    return existPersona;
};

 export const SubirPhoto= async (req: Request, res: Response)  => {
    try {
     const { id } = req.params;
  const { Foto } = req.body;
      const persona = await Persona.findOneBy({ IdPersona : id });
      if(!persona)
          return res.status(404).json({ message: "La Persona no cuenta con un imagen" });
        
       
      persona.Imagen=await createImagen({Foto});

     await persona.save();

      return res.status(200).json({message:"Se actualizo la imagen del Persona exitosamente"});
    } catch (error) {
      console.error("Error al obtener los menús del rol:", error);
      return res.status(500).json({ mensaje: "Error del servidor" });
    }
  };

export const updatePersona = async ({ 
      IdPersona,
      Nombre,
      ApellidoPaterno,
      ApellidoMaterno,
      FechaDeNacimiento,
      IdGenero,
      IdEmail,
      email,
      IdDireccion,
      BarrioId,
      Direccion,
      Referencia,
      IdImagen,
       Url
       }
      : {  
        IdPersona:string,
        Nombre: string,
      ApellidoPaterno:string,
      ApellidoMaterno:string,
      FechaDeNacimiento:string,
      IdGenero:number,
      IdEmail:string,
      email:string,
      IdDireccion:string,
      BarrioId:string,
      Direccion:string,
      Referencia:string,
      IdImagen:string,
      Url:string
     }) => {

 

    
    const persona = await verifyPersona({PersonaId:IdPersona});       
    console.log("Esto es perosona y su imagen:" ,IdImagen+" - "+Url)

   if(Nombre)  persona.Nombre = Nombre;
  if(ApellidoPaterno)persona.ApellidoPaterno = ApellidoPaterno;
   if(ApellidoMaterno)  persona.ApellidoMaterno = ApellidoMaterno;
   if(FechaDeNacimiento) persona.FechaDeNacimiento = new Date(FechaDeNacimiento);
    persona.FechaActualizacion = new Date();
    if ( IdDireccion || BarrioId || Direccion || Referencia)
    persona.Direccion = await updateDireccion({ IdDireccion:IdDireccion,BarrioId:BarrioId, Direccions:Direccion, Referencia:Referencia,Ubicacion:'' });
    persona.Genero = await verifyGenero({GeneroId:IdGenero});
    if(IdImagen) {
     persona.Imagen = await updateImagen({ImagenId:IdImagen,Foto:Url});
    }else
     if(Url) persona.Imagen = await createImagen({Foto:Url});
    // if(Salario)
    // nueva.Salario=await verifySalario({SalarioId:Salario});
     await persona.save();

 await updateEmail({EmailId:IdEmail,email:email});
    return persona;
 
};

export const getPersona = async (req:Request, res: Response) => {
      try {
          const {id} = req.params;
          
       const persona = await Persona.findOne({
  where: { Usuario:{IdUsuario: id} },
  relations: [
    "Estado",
    "Email",
    "Genero",
    'Documento',
    'Documento.Tipodocumento',
    'Documento.Complemento',
    //"Salario",
    "Imagen",
    "Celulares",
    "Direccion",
    "Direccion.Barrio",
    "Usuario.Rolusuario",
    "Usuario.Rolusuario.Rol"
  ]
});

          if(persona === null){
              return res.status(404).json('Persona not found')
          }
          
          
          return res.json( persona);
  
          //return res.json(Persona);
      } catch (error) {
          if(error instanceof Error){
              return res.status(500).json({ message: error.message})
          }
      }
  };


export const CreatePersona = async (req: Request, res: Response) => { 
      try {
     const { Personas } = req.body;
    
       const nuevoId = await generarIdSecuencial('PER');
        
        const persona = new Persona();
         persona.IdPersona = nuevoId;
    persona.Nombre = Personas.Nombre;
    persona.ApellidoPaterno = Personas.ApellidoPaterno;
    persona.ApellidoMaterno = Personas.ApellidoMaterno;
    persona.FechaDeNacimiento = new Date(Personas.FechaDeNacimiento);
    persona.Estado = await verifyEstado({ EstadoId: 1 });
    persona.FechaRegistro = new Date();
    persona.Direccion = await createDireccion({ BarrioId:Personas.BarrioId, Direccions:Personas.Direccion, Referencia:Personas.Referencia, Ubicacion:'' });;
    persona.Genero = await verifyGenero({GeneroId:Personas.IdGenero});
    if(Personas.Url) persona.Imagen = await createImagen({Foto:Personas.Url});  
        
    await persona.save();
 await createEmail({email:Personas.email,idpersona:nuevoId});
       if(Personas.Celulares.length>0)
     for(const celules of Personas.Celulares)
   await createCelular({Numero:celules.Numero, PersonaId: nuevoId}) 

       if(Personas.Documento.length>0)
      for(const documento of Personas.Documento)
        await createDocumento({IdTipoDocumento:documento.IdTipodocumento,IdComplemento:documento.Complemento,Documentos:documento.Documento,PersonaId: nuevoId}) 

      return res.status(200).json({message:"Se registro al cliente exitosamente"});
    } catch (error) {
      console.error("Error al obtener los menús del rol:", error);
      return res.status(500).json({ message: "Error del servidor" });
    }
 
};  

export const deletePersona = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const persona = await Persona.findOne({
      where: { IdPersona: id },
      relations: ['Estado']
    });

    if (!persona) {
      return res.status(404).json({ message: "Persona no encontrado" });
    }
    
    const esActivo = persona.Estado?.IdEstado === 1;
    const nuevoEstadoId = esActivo ? 2 : 1; 
    const mensajeAccion = esActivo ? 'eliminaron' : 'habilitaron';

    const nuevoEstado = await verifyEstado({ EstadoId: nuevoEstadoId });

    if (!nuevoEstado) {
      return res.status(500).json({ message: "No se pudo obtener el estado requerido." });
    }

    persona.Estado = nuevoEstado;
    await persona.save();

    return res.json({ message: `Se ${mensajeAccion} los datos del Cliente correctamente` });

  } catch (error) {
    console.error("Error al cambiar el estado del Persona:", error);
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const UpdatePersona = async (req: Request, res: Response)  =>{ 
      try {
         const { id } = req.params;
     const { Personas } = req.body;
       
     console.log(Personas)

       const persona = await Persona.findOneBy({ IdPersona : id });
      if(!persona)
          return res.status(404).json({ message: "El cliente no existe" });
        
    persona.Nombre = Personas.Nombre;
    persona.ApellidoPaterno = Personas.ApellidoPaterno;
    persona.ApellidoMaterno = Personas.ApellidoMaterno;
    persona.FechaDeNacimiento = new Date(Personas.FechaDeNacimiento);
    persona.FechaActualizacion = new Date();
    persona.Direccion =  await updateDireccion({ IdDireccion:Personas.IdDireccion,BarrioId:Personas.BarrioId, Direccions:Personas.Direccion, Referencia:Personas?.Referencia,Ubicacion:Personas?.Ubicacion });
    persona.Genero = await verifyGenero({GeneroId:Personas.IdGenero});
    persona.Email=  await updateEmail({EmailId:Personas.IdEmail,email:Personas.email});
     if(Personas.IdImagen) {
     persona.Imagen = await updateImagen({ImagenId:Personas.IdImagen,Foto:Personas.Url});
    }else
     if(Personas.Url) persona.Imagen = await createImagen({Foto:Personas.Url});
     
    await persona.save();
 
       if (Personas.Celulares && Personas.Celulares.length > 0) {
        const celularesActuales = await Celular.find({
          where: { Persona: { IdPersona: id } }
        });
      
        const idsEnviados = Personas.Celulares
          .filter((c: { IdCelular: any; }) => c.IdCelular) // solo los que tienen ID
          .map((c: { IdCelular: any; }) => c.IdCelular);
      
        for (const celularExistente of celularesActuales) {
          if (!idsEnviados.includes(celularExistente.IdCelular)) {
            await celularExistente.remove(); // o .destroy() si usas Sequelize
          }
        }
      
        
        for (const celules of Personas.Celulares) {
          await updateCelular({
            CelularId: celules.IdCelular,
            Numero: celules.Numero,
            PersonaId: id
          });
        }
      }
      
      
             if(Personas.Documento  && Personas.Documento.length>0)
            for(const documento of Personas.Documento)
              await updateDocumento({DocumentoId:documento.IdDocumento, IdTipoDocumento:documento.IdTipodocumento,IdComplemento:documento.Complemento,Documentos:documento.Documento,PersonaId:id}) 

      return res.status(200).json({message:"Se actualizo al cliente exitosamente"});
    } catch (error) {
       if (error instanceof Error)
      return res.status(500).json({ message: error.message });
    }

   
}

export const getClientes = async ( req:Request, res:Response) =>{
    try {
      
        const Personas = await Persona.find({ relations: ["Estado",
          "Email",
          "Genero",
          "Imagen",
          "Celulares",
          "Documento",
          "Documento.Tipodocumento",
          "Documento.Complemento",
          "Direccion",
          "Direccion.Barrio",
          ]});
        return res.json(Personas)    
    } catch (error) {
        if(error instanceof Error){
            return res.status(500).json({message: error.message})
        }
    }
}

export const getPersonas = async (req: Request, res: Response) => {
try {
    const personas = await Persona.find({
      relations: [
        "Estado",
        "Email",
        "Genero",
        "Imagen",
        "Celulares",
        "Documento",
        "Documento.Tipodocumento",
        "Documento.Complemento",
        "Direccion",
        "Direccion.Barrio",
        "Usuario",
        "Usuario.Estado",
        "Proveedor",
        "Proveedor.Estado"
      ]
    });

     const personasFiltradas = personas.filter(persona => {
      const usuarioInactivo = persona.Usuario && persona.Usuario.Estado && persona.Usuario.Estado.Nombre === "Activo";
      const proveedorInactivo = persona.Proveedor && persona.Proveedor.Estado && persona.Proveedor.Estado.Nombre === "Activo";

      return !(usuarioInactivo || proveedorInactivo);
    });
    return res.json(personasFiltradas);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};
