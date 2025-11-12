import { Request, Response } from "express";
import { Direccion } from "../entities/DIreccion";
import { Barrio } from "../entities/Barrio";
import { generarIdSecuencial } from "../utils/idGenerator";
import { verifyBarrio } from "./Barrio.controllers";
// export const createDireccion = async (req: Request, res: Response) => {
//   try {
//     const { IdPersona, IdBarrio, Direccions } = req.body;

//     const ultima = await Direccion.createQueryBuilder("direccion")
//       .select("MAX(direccion.IdDireccion)", "ultimoId")
//       .getRawOne();

//     const nuevoId = `DIR-${(parseInt(ultima?.ultimoId?.replace("DIR-", "") || "0") + 1)}`;

//     const direccion = new Direccion();
//     direccion.IdDireccion = nuevoId;
//     direccion.IdPersona = IdPersona || null;
//     direccion.IdBarrio = IdBarrio;
//     direccion.Direccions = Direccions;

//     await direccion.save();
//     return res.status(201).json(direccion);
//   } catch (error) {
//     if (error instanceof Error) {
//       return res.status(500).json({ message: error.message });
//     }
//   }
// };

// export const getDirecciones = async (req: Request, res: Response) => {
//   try {
//     const direcciones = await Direccion.find({ relations: ["Barrio", "Persona", "sucursal"] });
//     return res.json(direcciones);
//   } catch (error) {
//     if (error instanceof Error) {
//       return res.status(500).json({ message: error.message });
//     }
//   }
// };

// export const updateDireccion = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { IdPersona, IdBarrio, Direccions } = req.body;

//     const direccion = await Direccion.findOne({ where: { IdDireccion: id } });

//     if (!direccion) {
//       return res.status(404).json({ message: "Dirección no encontrada" });
//     }

//     direccion.IdPersona = IdPersona !== undefined ? IdPersona : direccion.IdPersona;
//     direccion.IdBarrio = IdBarrio !== undefined ? IdBarrio : direccion.IdBarrio;
//     direccion.Direccions = Direccions !== undefined ? Direccions : direccion.Direccions;

//     await direccion.save();
//     return res.json(direccion);
//   } catch (error) {
//     if (error instanceof Error) {
//       return res.status(500).json({ message: error.message });
//     }
//   }
// };

// export const getDireccionById = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

//     const direccion = await Direccion.findOne({
//       where: { IdDireccion: id },
//       relations: ["Barrio", "Persona", "sucursal"],
//     });

//     if (!direccion) {
//       return res.status(404).json({ message: "Dirección no encontrada" });
//     }

//     return res.json(direccion);
//   } catch (error) {
//     if (error instanceof Error) {
//       return res.status(500).json({ message: error.message });
//     }
//   }
// };

export const createDireccion = async ({ BarrioId, Direccions, Referencia, Ubicacion }: { BarrioId: string, Direccions: string, Referencia: string, Ubicacion:string }) => {
    const nuevoId = await generarIdSecuencial('DIR'); 
  const direccion = new Direccion();
  
    direccion.IdDireccion = nuevoId; 
    if(BarrioId) direccion.Barrio = await verifyBarrio({BarrioId:BarrioId});
    if(Direccions) direccion.Direccion = Direccions;
    if(Referencia) direccion.Referencia=Referencia;
    if(Ubicacion) direccion.Ubicacion = Ubicacion;
    await direccion.save();

    return direccion;
};



export const updateDireccion = async ({ IdDireccion, BarrioId, Direccions, Referencia, Ubicacion }: { IdDireccion: string,BarrioId: string, Direccions: string, Referencia: string, Ubicacion:string }) => {
  // Buscar dirección existente
    

if(IdDireccion){
   const existBarrio = await Barrio.findOne({ where: { IdBarrio: BarrioId } });
  
     if (!existBarrio) {
       throw new Error(  "No existe el barrio solicitado");
    }
  const direccion = await Direccion.findOne({ where: { IdDireccion } });

  if (!direccion) {
    throw new Error(`La dirección con ID ${IdDireccion} no existe.`);
  }

    direccion.IdDireccion = IdDireccion;
    direccion.Barrio = existBarrio;
    if(Direccions )direccion.Direccion =Direccions;
    if(Referencia) direccion.Referencia=Referencia;
     if(Ubicacion) direccion.Ubicacion = Ubicacion;

    await direccion.save();

    return direccion;
} 
return createDireccion({ BarrioId, Direccions, Referencia, Ubicacion })

  
};

export const verifyDireccion = async ({ IdDireccion }: { IdDireccion: string }) => {
    const existDireccion = await Direccion.findOne({ where: { IdDireccion: IdDireccion } });
   if (!existDireccion) {
    throw new Error(`El Barrio con ID ${existDireccion} no existe.`);
  }
    return existDireccion;
};

export const obtenerDIreccion = async (req: Request, res: Response) => {
try{
  const {id} = req.params
  const direccion = await Direccion.findOne({
    where:{IdDireccion:id},
    relations:["Barrio","Barrio.Distrito","Barrio.Distrito.Ciudad","Barrio.Distrito.Ciudad.Departamento","Barrio.Distrito.Ciudad.Departamento.Pais"]
  })

 return res.json(direccion);
}catch(error){
 if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
}

}
