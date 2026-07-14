import { Request, Response } from "express";
import { AppDataSource } from "../db";
import { generarIdSecuencial } from "../utils/idGenerator";
import { Horno } from "../entities/Horno";
import { HornoEnergia } from "../entities/HornoEnergia";
import { verifySucursal } from "./Sucursal.controllers";
import { HttpError } from "../utils/error.handler";


export const getHornos = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await AppDataSource.query(`
      SELECT  
        h.idhorno,
        h.nombre,
        h.imagen,
        h.estado,
        h.cantidadlata,
        COALESCE(
          json_agg(
            json_build_object(
              'idHornoEnergia', e.idhornoenergia,
              'tipoEnergia', e.tipoenergia,
              'consumoPorHora', e.consumoporhora
            )
          ) FILTER (WHERE e.idhornoenergia IS NOT NULL),
          '[]'
        ) AS energias
      FROM horno h
      LEFT JOIN horno_energia e 
        ON e.idhorno = h.idhorno
      WHERE h.idsucursal = $1 
      GROUP BY h.idhorno, h.nombre, h.imagen
    `, [id]);

    return res.json({ result });

  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const UpdateORPostHorno = async (req: Request, res: Response) => {
  try {
    const { Personas } = req.body;

    if (!Personas || Personas.length === 0) {
      return res.status(400).json({ message: "Debe enviar al menos un horno" });
    }

    for (const persona of Personas) {
      
      const horno = await createHorno(persona.IdHorno,persona.IdSucursal,persona.Url,persona.Nombre,persona.Idestado,persona.Cantidad)
       
      // 🔹 Crear energías asociadas
      if (persona.Energia && persona.Energia.length > 0) {
        for (const energia of persona.Energia) {
        await createEHorno(horno,energia.IdHornEnergia,energia.Tipo,energia.Consumo)
        }
      }
    }

    return res.json({ message: "Se registraron los hornos correctamente" });

  } catch (error) {
    if (error instanceof Error) {
      console.error("Error al crear horno:", error);
      return res.status(500).json({ message: error.message });
    }
  }
};

export const verifyHorno = async (idhorno:string) => {
    const horno = await Horno.findOne({
      where:{IdHorno:idhorno}
    })
 if (!horno) {
    throw new HttpError(404,`El horno con ID ${idhorno} no existe.`);
  }
  
    return horno;
}

export const verifyHornoEnergia = async (idhorno:string) => {
    const horno = await HornoEnergia.findOne({
      where:{IdHornoEnergia:idhorno}
    })
 if (!horno) {
    throw new HttpError(404,`La energia del horno con ID ${idhorno} no existe.`);
  }
  
    return horno;
}

export const createHorno = async ( IdHorno: string, IdSucursal: string,  Url: string, Nombre: string, Estado:number, catindad:number
) => {
  let horno ;
    if(IdHorno){
      horno = await verifyHorno(IdHorno) 
      if(Nombre)horno.Nombre = Nombre
      if(Url)horno.Imagen = Url
      if(IdSucursal) horno.Sucursal = await verifySucursal({SucursalId:IdSucursal})
      horno.Cantidadlata = catindad
      horno.Estado = Estado
        await horno.save();
      }else{
     if(Estado === 1){
      horno = new Horno();
      const hornoId = await generarIdSecuencial('HORNO');
      horno.IdHorno = hornoId;
      horno.Nombre = Nombre;
      horno.Sucursal = await verifySucursal({ SucursalId: IdSucursal });
      horno.Cantidadlata = catindad
      if (Url) {
        horno.Imagen = Url;
      }
        await horno.save();
     }

    }
    return horno;
};

export const createEHorno = async (Horno: Horno  | undefined,IdEHorno: string, Tipo: string,  Consumo: number
) => {
    let henergia;
       if(IdEHorno){
        henergia = await verifyHornoEnergia(IdEHorno)
         if(Horno)henergia.Horno = Horno;
          henergia.TipoEnergia = Tipo;
          if (Consumo > 0) {
            henergia.ConsumoPorHora = Consumo;
          }
        
          await henergia.save()
       }else{
       const energiaId = await generarIdSecuencial('EHOOR');

           henergia = new HornoEnergia();
          henergia.IdHornoEnergia = energiaId;
           if(Horno) henergia.Horno = Horno;
          henergia.TipoEnergia = Tipo;

          if (Consumo > 0) {
            henergia.ConsumoPorHora = Consumo;
          }

         
          await henergia.save()
} 

};
