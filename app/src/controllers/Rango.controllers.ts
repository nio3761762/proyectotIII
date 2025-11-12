import { Rango } from "../entities/Rango";
import { verifyPromocion } from "./Promocion.controllers";
import { HttpError } from "../utils/error.handler";


export const verifyRango = async ({ Rangoid }: { Rangoid:string }) => {

    const existrango= await Rango.findOne({ where: { IdRango: Rangoid} });
    
    
   if (!existrango) {
     throw new HttpError(404, `El rango con ID ${Rangoid} no existe.`);
  }
  
    return existrango;
};

export const createRango = async ({IdPromocion,HoraInicio,HoraFin,FechaInicio,FechaFin }: {  IdPromocion:string,HoraInicio:string,HoraFin:string,FechaInicio:Date,FechaFin:Date }) => {

       const result = await Rango.createQueryBuilder("Rango")
        .select("MAX(CAST(SUBSTRING(Rango.IdRango, 4) AS INTEGER))", "ultimoNumero")
        .where("Rango.IdRango LIKE 'RG-%'")
        .getRawOne();

    const nuevoNumero = (result?.ultimoNumero || 0) + 1;
    const nuevoId = `RG-${nuevoNumero}`;

    const nuevoRango =new Rango()
   nuevoRango.IdRango=nuevoId;
   nuevoRango.FechaInicio=FechaInicio;
   nuevoRango.FechaFin=FechaFin;
   nuevoRango.HoraInicio=HoraInicio;
   nuevoRango.HoraFin=HoraFin;
   nuevoRango.Promocion = await verifyPromocion({PromocionId:IdPromocion})
    
    await nuevoRango.save();


    return nuevoRango;
};



export const updateRango = async ({RangoId, HoraInicio,HoraFin,FechaInicio,FechaFin }: {  RangoId:string,HoraInicio:string,HoraFin:string,FechaInicio:Date,FechaFin:Date }) => {

      
    const existrango= await Rango.findOne({ where: { IdRango: RangoId} });


    if (!existrango) {
            throw new Error( "No existe registro el tiempo de duracion");
        }
   if(FechaInicio)existrango.FechaInicio=FechaInicio;
   if(FechaFin) existrango.FechaFin=FechaFin;
   if(HoraInicio) existrango.HoraInicio=HoraInicio;
   if(HoraFin) existrango.HoraFin=HoraFin;
   
 await existrango.save();


    return existrango;
};


