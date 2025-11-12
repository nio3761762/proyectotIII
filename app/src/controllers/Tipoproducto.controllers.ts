import { HttpError } from "../utils/error.handler";
import { Tipoproducto } from "../entities/TipoProducto";


export const verifyTipoProducto = async ({ TipoId }: { TipoId:string }) => {

    const existTipoProducto= await Tipoproducto.findOne({ where: { IdTipoProducto: TipoId} });
    
    
   if (!existTipoProducto) {
     throw new HttpError(404, `El rango con ID ${TipoId} no existe.`);
  }
  
    return existTipoProducto;
};