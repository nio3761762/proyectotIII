import { Request, Response } from "express";
import { Promocion } from "../entities/Promocion";
import { Estado } from "../entities/Estado";
import { Tipopromocion } from "../entities/Tipopromocion";
import { createRango, updateRango } from "./Rango.controllers";
import { verifyEstado } from "./Estado.controllers";
import { createPromocionProducto, updatePromocionProducto } from "./PromocionProducto.controllers";
import { verifyTipoPromocion } from "./Tipopromocion.controllers";
import { Producto } from "../entities/Producto";
import { generarIdSecuencial } from "../utils/idGenerator";
import { createImagen, updateImagen } from "./Foto.controllers";

// en Promocion.controllers.ts
export const cerrarPromocionesVencidas = async (req?: Request, res?: Response) => {
  try {
    const promociones = await Promocion.find({ relations: ["Rango", "Estado"] });
    const ahora = new Date();

    for (const promo of promociones) {
      if (promo.Rango) {
        const fechaFin = new Date(promo.Rango.FechaFin);
        const [h, m, s] = promo.Rango.HoraFin.split(":").map(Number);

        fechaFin.setHours(h, m, s);
console.log(fechaFin)
        if (ahora > fechaFin && promo.Estado.Nombre === "Activo") {
          const estadoInactivo = await Estado.findOne({ where: { Nombre: "Inactivo" } });
          if (estadoInactivo) {
            promo.Estado = estadoInactivo;
            promo.Fechaactualizacion = ahora;
            await promo.save();
          }
        }
      }
    }

    if (res) {
      return res.json({ message: "Promociones vencidas cerradas correctamente" });
    } else {
      console.log("✔ Promociones vencidas cerradas (llamado por cron)");
    }

  } catch (error) {
    console.error("Error al cerrar promociones:", error);
    if (res) {
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  }
};

export const activarPromociones = async (req?: Request, res?: Response) => {
  try {
    const promociones = await Promocion.find({ relations: ["Rango", "Estado"] });
    const ahora = new Date();

    for (const promo of promociones) {
      if (promo.Rango) {
        // Construir fecha/hora de inicio
        const fechaInicio = new Date(promo.Rango.FechaInicio);
        const [h, m, s] = promo.Rango.HoraInicio.split(":").map(Number);
        fechaInicio.setHours(h, m, s);

        // Si ya llegó la fecha de inicio y sigue inactiva → activar
        if (ahora >= fechaInicio && promo.Estado.Nombre === "Inactivo") {
          const estadoActivo = await Estado.findOne({ where: { Nombre: "Activo" } });
          if (estadoActivo) {
            promo.Estado = estadoActivo;
            promo.Fechaactualizacion = ahora;
            await promo.save();
          }
        }
      }
    }

    if (res) {
      return res.json({ message: "✔ Promociones activadas correctamente" });
    } else {
      console.log("✔ Promociones activadas automáticamente (cron)");
    }

  } catch (error) {
    console.error("Error al activar promociones:", error);
    if (res) {
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  }
};

export const actualizarPromociones = async () => {
  try {
    const promociones = await Promocion.find({ relations: ["Rango", "Estado"] });
    const ahora = new Date();

    for (const promo of promociones) {
      if (!promo.Rango) continue;

      const fechaInicio = new Date(`${promo.Rango.FechaInicio}T${promo.Rango.HoraInicio}`);
      const fechaFin = new Date(`${promo.Rango.FechaFin}T${promo.Rango.HoraFin}`);

      // Activar si estamos dentro del rango
      if (ahora >= fechaInicio && ahora <= fechaFin && promo.Estado.Nombre !== "Activo") {
        const estadoActivo = await Estado.findOne({ where: { Nombre: "Activo" } });
        if (estadoActivo) {
          promo.Estado = estadoActivo;
          promo.Fechaactualizacion = ahora;
          await promo.save();
          console.log(`✅ Promoción ${promo.Nombre} activada`);
        }
      }

      // Desactivar si ya pasó el rango
      if (ahora > fechaFin && promo.Estado.Nombre !== "Inactivo") {
        const estadoInactivo = await Estado.findOne({ where: { Nombre: "Inactivo" } });
        if (estadoInactivo) {
          promo.Estado = estadoInactivo;
          promo.Fechaactualizacion = ahora;
          await promo.save();
          console.log(`❌ Promoción ${promo.Nombre} desactivada`);
        }
      }
    }
  } catch (error) {
    console.error("Error al actualizar promociones:", error);
  }
};


export const verifyPromocion = async ({ PromocionId }: { PromocionId: string }) => {

    const existPromocion = await Promocion.findOne({ where: { IdPromocion: PromocionId } });


    if (!existPromocion) {
        throw new Error(`La promocion con ID ${PromocionId} no existe.`);
    }

    return existPromocion;
};


export const createPromocion = async (req: Request, res: Response) => {
    try {
        const { RegistrarPromocion } = req.body;

        const tipoPromocion = await Tipopromocion.findOneBy({ IdTipoPromocion: RegistrarPromocion.Tipopromocion.IdTipoPromocion });
        if (!tipoPromocion) {
            return res.status(404).json({ message: "Tipo de promoción no encontrado" });
        }
        
    
 const nuevoId = await generarIdSecuencial('PROM');

        const nuevaPromocion = new Promocion();
        nuevaPromocion.IdPromocion = nuevoId;
        if (RegistrarPromocion.Nombre) nuevaPromocion.Nombre = RegistrarPromocion.Nombre;
        nuevaPromocion.Estado = await verifyEstado({ EstadoId: 1 });
        nuevaPromocion.FechaRegistro = new Date();
        if (RegistrarPromocion.Descripcion) nuevaPromocion.Descripcion = RegistrarPromocion.Descripcion;
        if (RegistrarPromocion.Tipopromocion.IdTipoPromocion) 
            nuevaPromocion.Tipopromocion = await verifyTipoPromocion({ PromocionId: Number(RegistrarPromocion.Tipopromocion.IdTipoPromocion)});
        if(RegistrarPromocion.Url)
           nuevaPromocion.Imagen = await createImagen({Foto:RegistrarPromocion.Url})
        await nuevaPromocion.save();

        await createRango({
            IdPromocion: nuevoId, HoraInicio: RegistrarPromocion.Rango.HoraInicio,
            HoraFin: RegistrarPromocion.Rango.HoraFin, FechaInicio: RegistrarPromocion.Rango.FechaInicio, FechaFin: RegistrarPromocion.Rango.FechaFin
        });

        for (const producto of RegistrarPromocion.Promocionproducto) {
            await createPromocionProducto({ IdPromocion: nuevoId, IdProducto: producto.IdProducto, Cantidad: producto.Cantidad, Descuento: producto.Descuento, IdEstado:producto.IdEstado,IdPaquete:producto.IdPaquete });
        }

        return res.status(201).json({ message: "La promoción se registró correctamente" });

    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const updatePromocion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { RegistrarPromocion } = req.body;
         
        const promocion = await Promocion.findOneBy({ IdPromocion: id });
        if (!promocion) {
            return res.status(404).json({ message: "Promoción no encontrada" });
        }
 

        if (RegistrarPromocion.Nombre) promocion.Nombre = RegistrarPromocion.Nombre;
        if (RegistrarPromocion.Descripcion) promocion.Descripcion = RegistrarPromocion.Descripcion;
        if (RegistrarPromocion.Tipopromocion.IdTipoPromocion)
            promocion.Tipopromocion = await verifyTipoPromocion({ PromocionId: Number(RegistrarPromocion.Tipopromocion.IdTipoPromocion) });
            promocion.Fechaactualizacion = new Date();
        if(RegistrarPromocion.IdImagen)
            promocion.Imagen = await updateImagen({ImagenId:RegistrarPromocion.IdImagen,Foto:RegistrarPromocion.Url})
          else   
            if(RegistrarPromocion.Url)
            promocion.Imagen = await createImagen({Foto:RegistrarPromocion.Url})


        await promocion.save();

        await updateRango({
            RangoId: RegistrarPromocion.Rango.IdRango, HoraInicio: RegistrarPromocion.Rango.HoraInicio,
            HoraFin: RegistrarPromocion.Rango.HoraFin, FechaInicio: RegistrarPromocion.Rango.FechaInicio, FechaFin: RegistrarPromocion.Rango.FechaFin
        });


        for (const producto of RegistrarPromocion.Promocionproducto) {
            await updatePromocionProducto({ Idpp: producto.IdPromocionProducto,IdPromocion:id ,IdProducto: producto.IdProducto,
                 Cantidad: producto.Cantidad, Descuento: producto.Descuento, IdEstado:producto.IdEstado, IdPaquete:producto.IdPaquete });
        }

        return res.json({ message: "La promoción se actualizó correctamente" });

    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const deletePromocion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const promocion = await Promocion.findOne({ where: { IdPromocion: id }, relations: ['Estado'] });
        if (!promocion) {
            return res.status(404).json({ message: "Promoción no encontrada" });
        }

        const esActivo = promocion.Estado?.IdEstado === 1;
        const nuevoEstadoId = esActivo ? 2 : 1;
        const mensajeAccion = esActivo ? 'deshabilitó' : 'habilitó';

        const nuevoEstado = await verifyEstado({ EstadoId: nuevoEstadoId });
        if (!nuevoEstado) {
            return res.status(500).json({ message: "No se pudo obtener el estado requerido." });
        }

        promocion.Estado = nuevoEstado;
        await promocion.save();

        return res.json({ message: `Se ${mensajeAccion} correctamente` });

    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const getPromociones = async (req: Request, res: Response) => {
    try {
        const promociones = await Promocion.find({
            relations: ["Estado",
                 "Tipopromocion", 
                 "Rango",
                 "Imagen",
                  "Promocionproducto",
                  "Promocionproducto.Estado",
                  'Promocionproducto.Producto',
                  'Promocionproducto.Paquete']
        });
        return res.json(promociones);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const getPromocionesActiva = async (req: Request, res: Response) => {
    try {
        const promociones = await Promocion.find({
            where:{Estado:{IdEstado:1}},
            relations: [ "Imagen","Tipopromocion", "Promocionproducto",'Promocionproducto.Producto','Promocionproducto.Paquete']
        });
        return res.json(promociones);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const getPromocion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const promocion = await Promocion.findOne({
            where: { IdPromocion: id },
            relations: [
                "Promocionproducto",
                "Promocionproducto.Estado",
                "Promocionproducto.Producto",
                "Promocionproducto.Paquete"
            ]
        });

        if (!promocion) {
            return res.status(404).json({ message: "Promoción no encontrada" });
        }

        // Mapeamos el resultado para devolver solo lo necesario
        const promocionResponse = {
            IdPromocion: promocion.IdPromocion,
            Nombre: promocion.Nombre,
            Descripcion: promocion.Descripcion,
            Estado: promocion.Estado?.Nombre,  // Solo el nombre           
            Productos: promocion.Promocionproducto.map(p => ({
                Estado:p.Estado.IdEstado,
                IdProducto: p.Producto ? p.Producto.IdProducto : null,
                IdPaquete: p.Paquete ? p.Paquete.IdPaquete : null,
                Nombre: p.Producto?.Nombre || p.Paquete?.Nombre,
                Cantidad: p.Cantidad,
                Descuento: p.Descuento
            }))
        };

        return res.json(promocionResponse);

    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};


