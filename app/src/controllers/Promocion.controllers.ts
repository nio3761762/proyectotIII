import { Request, Response } from "express";
import { Promocion } from "../entities/Promocion";
import { Tipopromocion } from "../entities/Tipopromocion";
import { createRango, updateRango } from "./Rango.controllers";
import { createPromocionProducto, updatePromocionProducto } from "./PromocionProducto.controllers";
import { verifyTipoPromocion } from "./Tipopromocion.controllers";
import { Producto } from "../entities/Producto";
import { generarIdSecuencial } from "../utils/idGenerator";
import { AppDataSource } from "../db";

// en Promocion.controllers.ts
export const cerrarPromocionesVencidas = async (req?: Request, res?: Response) => {
  try {
    const promociones = await Promocion.find({ relations: ["Rango"] });
    const ahora = new Date();

    for (const promo of promociones) {
      if (promo.Rango) {
        const fechaFin = new Date(`${promo.Rango.FechaFin}T${promo.Rango.HoraFin}`);

        if (ahora > fechaFin && promo.Estado === 1) {
          promo.Estado = 0;
          promo.Fechaactualizacion = ahora;
          await promo.save();
      
        }
      }
    }

    if (res) {
      return res.json({ message: "Promociones vencidas cerradas correctamente" });
    } else {
 
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
    const promociones = await Promocion.find({ relations: ["Rango"] });
    const ahora = new Date();

    for (const promo of promociones) {
      if (promo.Rango) {
        // Construir fecha/hora de inicio
        const fechaInicio = new Date(`${promo.Rango.FechaInicio}T${promo.Rango.HoraInicio}`);
        const fechaFin = new Date(`${promo.Rango.FechaFin}T${promo.Rango.HoraFin}`);

        // Si ya llegó la fecha de inicio, no ha pasado la de fin y sigue inactiva → activar
        if (ahora >= fechaInicio && ahora <= fechaFin && promo.Estado === 0) {
          promo.Estado = 1;
          promo.Fechaactualizacion = ahora;
          await promo.save();
        
        }
      }
    }

    if (res) {
      return res.json({ message: "✔ Promociones activadas correctamente" });
    } else {
    
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
    const promociones = await Promocion.find({ relations: ["Rango"] });
    const ahora = new Date();

    for (const promo of promociones) {
      if (!promo.Rango) continue;

      const fechaInicio = new Date(`${promo.Rango.FechaInicio}T${promo.Rango.HoraInicio}`);
      const fechaFin = new Date(`${promo.Rango.FechaFin}T${promo.Rango.HoraFin}`);

      // Activar si estamos dentro del rango
      if (ahora >= fechaInicio && ahora <= fechaFin && promo.Estado !== 1) {
        promo.Estado = 1;
        promo.Fechaactualizacion = ahora;
        await promo.save();
    
      }

      // Desactivar si ya pasó el rango
      if (ahora > fechaFin && promo.Estado !== 0) {
        promo.Estado = 0;
        promo.Fechaactualizacion = ahora;
        await promo.save();
       
      }
    }
  } catch (error) {
    console.error("Error al actualizar promociones:", error);
  }
};


export const verifyPromocion = async ({ PromocionId }: { PromocionId: string }) => {

    const existPromocion = await Promocion.findOne({ where: { IdPromocion: PromocionId }, 
      relations :['Promocionproducto','Promocionproducto.Productomedida','Promocionproducto.Producto'] });


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
        nuevaPromocion.FechaRegistro = new Date();
        if (RegistrarPromocion.Descripcion) nuevaPromocion.Descripcion = RegistrarPromocion.Descripcion;
        if (RegistrarPromocion.Tipopromocion.IdTipoPromocion) 
            nuevaPromocion.Tipopromocion = await verifyTipoPromocion({ PromocionId: Number(RegistrarPromocion.Tipopromocion.IdTipoPromocion)});
         if(RegistrarPromocion.Url)  nuevaPromocion.Imagen = RegistrarPromocion.Url
         if(RegistrarPromocion.LimiteUso) nuevaPromocion.LimiteUso = RegistrarPromocion.LimiteUso
           nuevaPromocion.Preciopromocion = RegistrarPromocion.Preciopromocion
           if(RegistrarPromocion.TipoDescuento) nuevaPromocion.TipoDescuento = RegistrarPromocion.TipoDescuento
       
           await nuevaPromocion.save();

        await createRango({
            IdPromocion: nuevoId, HoraInicio: RegistrarPromocion.Rango.HoraInicio,
            HoraFin: RegistrarPromocion.Rango.HoraFin, FechaInicio: RegistrarPromocion.Rango.FechaInicio, FechaFin: RegistrarPromocion.Rango.FechaFin
        });

        for (const producto of RegistrarPromocion.Promocionproducto) {
            await createPromocionProducto( nuevaPromocion, producto.IdProducto,  producto.Cantidad,  producto.Descuento, producto.Precio,producto.IdEstado );
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
        if(RegistrarPromocion.LimiteUso) promocion.LimiteUso = RegistrarPromocion.LimiteUso
           promocion.Preciopromocion = RegistrarPromocion.Preciopromocion
        if(RegistrarPromocion.Url)   promocion.Imagen = RegistrarPromocion.Url
           if(RegistrarPromocion.TipoDescuento) promocion.TipoDescuento = RegistrarPromocion.TipoDescuento
        await promocion.save();

        await updateRango({
            RangoId: RegistrarPromocion.Rango.IdRango, HoraInicio: RegistrarPromocion.Rango.HoraInicio,
            HoraFin: RegistrarPromocion.Rango.HoraFin, FechaInicio: RegistrarPromocion.Rango.FechaInicio, FechaFin: RegistrarPromocion.Rango.FechaFin
        });


        for (const producto of RegistrarPromocion.Promocionproducto) {
            await updatePromocionProducto(producto.IdPromocionProducto,producto.IdProducto,promocion ,
                 producto.Cantidad,  producto.Descuento, producto.IdEstado,producto.Precio );
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
       
         const result = await AppDataSource.query(
         `UPDATE promocion 
          SET estado = CASE WHEN estado = 1 THEN 0 ELSE 1 END
          WHERE IdPromocion = $1
          RETURNING estado AS estado`,
         [id]
       );
       
           // ✅ aquí está el cambio
           if (result.length === 0) {
             return res.status(404).json({ message: "Persona no encontrado" });
           }
       const nuevoEstado = Number(result[0][0].estado);
           const mensajeAccion = nuevoEstado === 1 ? "habilitaron" : "eliminaron";
       
           return res.json({
             message: `Se ${mensajeAccion} los datos de la promocion correctamente`,
           });

    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const getPromociones = async (req: Request, res: Response) => {
  try {
    const {
      search,
      idproducto,
      estado,
      tipopromocion,
      page = 1,
      limit = 8
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const searchParam =
      typeof search === "string" && search.trim() !== ""
        ? search.trim()
        : null;

    const idProductoParam =
      typeof idproducto === "string" && idproducto.trim() !== ""
        ? idproducto.trim()
        : null;

    const estadoParam =
      estado !== undefined && estado !== ""
        ? Number(estado)
        : null;

   const tipoParam =
  tipopromocion !== undefined && tipopromocion !== ""
    ? Number(tipopromocion)
    : null;

    const result = await AppDataSource.query(
      `
      SELECT 
        pr.idpromocion,
        pr.nombre,
        pr.descripcion,
        pr.estado,
        pr.tipodescuento,
        pr.preciopromocion,
        pr.limiteuso,
        pr.imagen,
        COUNT(*) OVER() AS total,

        -- 🔥 RANGO
        json_build_object(
          'IdRango', r.idrango,
          'FechaInicio', r.fechainicio,
          'FechaFin', r.fechafin,
          'HoraInicio', r.horainicio,
          'HoraFin', r.horafin
        ) AS "Rango",

        -- 🔥 Tipo Promoción
        json_build_object(
          'IdTipoPromocion', tp.idtipopromocion,
          'Nombre', tp.nombre
        ) AS "Tipopromocion",

        -- 🔥 Productos de la promoción
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'IdPromocionProducto', pp.idpromocionproducto,
              'Cantidad', pp.cantidad,
              'Descuento', pp.descuento,
              'Precio', pp.precio,
              'Estado', pp.estado,

              'Productomedida', json_build_object(
                'IdProductoMedida', pm.idproductomedida,
                'Cantidad', pm.cantidad,
                'PrecioVenta', pm.precioventa,
                'Imagen', pm.imagen,

                -- 🔥 NUEVO: PRESENTACION
                'Presentacion', json_build_object(
                  'IdPresentacion', prd.idpresentacion,
                  'Nombre', prd.nombre,
                  'Estado', prd.estado
                ),

                'Producto', json_build_object(
                  'IdProducto', p.idproducto,
                  'Nombre', p.nombre,
                  'Estado', p.estado,
                  'Imagen', p.imagen
                )
              )
            )
          ) FILTER (WHERE pp.idpromocionproducto IS NOT NULL),
          '[]'
        ) AS "Promocionproducto"

      FROM promocion pr

      LEFT JOIN rango r 
        ON r.idpromocion = pr.idpromocion

      LEFT JOIN tipopromocion tp 
        ON tp.idtipopromocion = pr.idtipopromocion

      LEFT JOIN promocionproducto pp 
        ON pp.idpromocion = pr.idpromocion

      LEFT JOIN productomedida pm 
        ON pm.idproductomedida = pp.idproductomedida

      LEFT JOIN producto p 
        ON p.idproducto = pm.idproducto

      -- 🔥 NUEVO JOIN
      LEFT JOIN presentacion prd 
        ON prd.idpresentacion = pm.idpresentacion

      WHERE
        ($1::text IS NULL OR pr.nombre ILIKE '%' || $1::text || '%')
      AND ($2::text IS NULL OR p.idproducto = $2)
      AND ($3::int IS NULL OR pr.estado = $3)
      AND ($4::int IS NULL OR tp.idtipopromocion = $4::int)
     
      GROUP BY 
        pr.idpromocion,
        tp.idtipopromocion,
        r.idrango

      ORDER BY pr.idpromocion
      LIMIT $5 OFFSET $6;
      `,
      [
        searchParam,
        idProductoParam,
        estadoParam,
        tipoParam,
        Number(limit),
        offset
      ]
    );

    if (result.length === 0) {
      return res.json({
        total: 0,
        page: Number(page),
        limit: Number(limit),
        data: []
      });
    }

    return res.json({
      total: result[0].total,
      page: Number(page),
      limit: Number(limit),
      data: result
    });

  } catch (error) {
    console.error("Error real:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};



export const getPromocionesVista = async (req: Request, res: Response) => {
  try {
    const {
      search,
      tipopromocion,
      page = 1,
      limit = 12
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const searchParam =
      typeof search === "string" && search.trim() !== ""
        ? search.trim()
        : null;

    const tipoParam =
      tipopromocion !== undefined && tipopromocion !== ""
        ? Number(tipopromocion)
        : null;

    const result = await AppDataSource.query(
      `
      SELECT 
        pr.idpromocion,
        pr.nombre,
        pr.descripcion,
        pr.estado,
        pr.tipodescuento,
        pr.preciopromocion,
        pr.limiteuso,
        pr.imagen,
        COUNT(*) OVER() AS total,

        -- RANGO
        json_build_object(
          'IdRango', r.idrango,
          'FechaInicio', r.fechainicio,
          'FechaFin', r.fechafin,
          'HoraInicio', r.horainicio,
          'HoraFin', r.horafin
        ) AS "Rango",

        -- Tipo Promoción
        json_build_object(
          'IdTipoPromocion', tp.idtipopromocion,
          'Nombre', tp.nombre
        ) AS "Tipopromocion",

        --  Productos de la promoción
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'IdPromocionProducto', pp.idpromocionproducto,
              'Cantidad', pp.cantidad,
              'Descuento', pp.descuento,
              'Precio', pp.precio,
              'Estado', pp.estado,

              'Productomedida', json_build_object(
                'IdProductoMedida', pm.idproductomedida,
                'Cantidad', pm.cantidad,
                'PrecioVenta', pm.precioventa,
                'Imagen', pm.imagen,

                'Presentacion', json_build_object(
                  'IdPresentacion', prd.idpresentacion,
                  'Nombre', prd.nombre,
                  'Estado', prd.estado
                ),

                'Producto', json_build_object(
                  'IdProducto', p.idproducto,
                  'Nombre', p.nombre,
                  'Estado', p.estado,
                  'Imagen', p.imagen
                )
              )
            )
          ) FILTER (WHERE pp.idpromocionproducto IS NOT NULL AND pp.estado = 1),
          '[]'
        ) AS "Promocionproducto"

      FROM promocion pr

      LEFT JOIN rango r 
        ON r.idpromocion = pr.idpromocion

      LEFT JOIN tipopromocion tp 
        ON tp.idtipopromocion = pr.idtipopromocion

      LEFT JOIN promocionproducto pp 
        ON pp.idpromocion = pr.idpromocion

      LEFT JOIN productomedida pm 
        ON pm.idproductomedida = pp.idproductomedida

      LEFT JOIN producto p 
        ON p.idproducto = pm.idproducto

      LEFT JOIN presentacion prd 
        ON prd.idpresentacion = pm.idpresentacion

      WHERE pr.estado = 1
      AND ($1::text IS NULL OR pr.nombre ILIKE '%' || $1::text || '%')
      AND ($2::int IS NULL OR tp.idtipopromocion = $2::int)
      -- Validar que estemos dentro del rango de fechas
      AND (
        CURRENT_DATE BETWEEN r.fechainicio AND r.fechafin
      )

      GROUP BY 
        pr.idpromocion,
        tp.idtipopromocion,
        r.idrango

      ORDER BY pr.idpromocion
      LIMIT $3 OFFSET $4;
      `,
      [
        searchParam,
        tipoParam,
        Number(limit),
        offset
      ]
    );

    if (result.length === 0) {
      return res.json({
        total: 0,
        page: Number(page),
        limit: Number(limit),
        data: []
      });
    }

    return res.json({
      total: Number(result[0].total),
      page: Number(page),
      limit: Number(limit),
      data: result
    });

  } catch (error) {
    console.error("Error en getPromocionesVista:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};



