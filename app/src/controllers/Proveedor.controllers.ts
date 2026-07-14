import { Request, Response } from "express"
import { Proveedor } from "../entities/Proveedor"
import { verifyPersona } from "./Persona.controllers";
import { generarIdSecuencial } from '../utils/idGenerator'; // Importar la función
import { verifyTipoproveedor } from "./TipoProveedor.controllers";
import { HttpError } from "../utils/error.handler";
import { AppDataSource } from "../db";


export const createProveedor = async (req:Request, res:Response) =>{

try {   
        const {Personas} = req.body;
       
    const nuevoId = await generarIdSecuencial('PROV'); // Generar el ID secuencial

         const proveedor = new Proveedor();     
        proveedor.IdProveedor = nuevoId;
         proveedor.Persona = await verifyPersona({PersonaId:Personas.IdPersona})
         if(Personas.RazonSocial)proveedor.RazonSocial = Personas.RazonSocial;
         if(Personas.Nit) proveedor.Nit=Personas.Nit
         proveedor.Tipoproveedor = await verifyTipoproveedor({TipoproveedorId:Personas.IdTipoProveedor}) 
    
         await proveedor.save()
  
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
    const result = await AppDataSource.query(`
  SELECT 
  pr.idproveedor,
  pr.razonsocial,
  pr.nit,
  pr.estado,
  p.nombre,
  p.apellidopaterno,
  p.apellidomaterno,
  p.imagen,
  p.email,
  tp.nombre AS Tiponombre
FROM proveedor pr, persona p, tipoproveedor tp 
WHERE  pr.idpersona = p.idpersona AND pr.idtipoproveedor = tp.idtipoproveedor AND pr.estado = 1; 
`);

    return res.json({result});
      
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

       
          if(Persona.RazonSocial)proveedor.RazonSocial = Persona.RazonSocial;
          proveedor.Tipoproveedor = await verifyTipoproveedor({TipoproveedorId:Persona.IdTipoProveedor});
          if(Persona.Nit) proveedor.Nit = Persona.Nit

     await proveedor.save()
     
      


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

    const result = await AppDataSource.query(
     `UPDATE proveedor 
      SET estado = CASE WHEN estado = 1 THEN 0 ELSE 1 END
      WHERE IdProveedor = $1
      RETURNING estado AS estado`,
     [id]
   );
   
       // ✅ aquí está el cambio
       if (result.length === 0) {
         return res.status(404).json({ message: "Proveedor no encontrado" });
       }
   const nuevoEstado = Number(result[0][0].estado);
       const mensajeAccion = nuevoEstado === 1 ? "habilitaron" : "eliminaron";
   
    if (!nuevoEstado) {
      return res.status(500).json({ message: "No se pudo obtener el estado requerido." });
    }

   
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
        relations: ["Persona","Tipoproveedor",
          "Persona.Celulares","Persona.Documento",
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