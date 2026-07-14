import { Request, Response } from "express";
import { AppDataSource } from "../db";
import { Revendedorcontrol } from "../entities/RevendedorControl ";
import { Revendedorcontroldetalle } from "../entities/RevendedorControlDetalle ";
import { Revendedorcontrolprecio } from "../entities/RevendedorControlPrecio";
import { Empleado } from "../entities/Empleado";
import { Sucursal } from "../entities/Sucursal";
import { Productomedida } from "../entities/ProductoMedida";
import { HttpError } from "../utils/error.handler";
import { generarIdSecuencial } from "../utils/idGenerator";
import { getFechaHoraBolivia } from "../utils/Fecha";
import { DecrementProducto, IncrementProducto } from "./Inventario.controllers";
import { verifyProductoMedida } from "./ProductoMedida.controllers";
import { verifyEmpleado } from "./Empleado.controllers";
import { verifySucursal } from "./Sucursal.controllers";

const { fecha: fechaActual, hora: horaActual } = getFechaHoraBolivia();

export const registrarRevendedorControl = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const { controles } = req.body; // Se espera un array de controles

    if (!Array.isArray(controles) || controles.length === 0) {
      throw new HttpError(400, "Se requiere un array de controles.");
    }

    const resultados = [];

    for (const data of controles) {
      const { idEmpleado, idSucursal, observacion, detalles } = data;

      if (!idEmpleado || !idSucursal) {
        throw new HttpError(400, "Empleado y Sucursal son requeridos para cada control.");
      }

      // 1. Crear cabecera
      const nuevoIdControl = await generarIdSecuencial('RC');
      const control = new Revendedorcontrol();
      control.IdRevendedorControl = nuevoIdControl;
      control.Fecha = data.fecha || fechaActual;
      control.Hora = data.hora || horaActual;
      control.Observacion = observacion;
      
      const empleado = await verifyEmpleado(idEmpleado);
  
      control.Empleado = empleado;
      const sucursal = await verifySucursal({SucursalId:idSucursal});
      
      control.Sucursal = sucursal;

      await queryRunner.manager.save(control);

      // 2. Procesar Detalles
      if (Array.isArray(detalles)) {
        for (const det of detalles) {
          const detalle = new Revendedorcontroldetalle();
          detalle.IdRevendedorControlDetalle = await generarIdSecuencial('RCD');
          detalle.RevendedorControl = control;
          
          // Verificar y obtener el producto medida
          const productoMedida = await verifyProductoMedida({ PaqueteId: det.idProductoMedida });
          detalle.ProductoMedida = productoMedida;

          detalle.CantidadEntregada = det.cantidadEntregada || 0;
          detalle.CantidadDevuelta = det.cantidadDevuelta || 0;
          detalle.CantidadSinComision = det.cantidadSinComision || 0;
          
          // Prioridad: 1. Precio enviado en el body, 2. Precio de la Panadería
          detalle.PrecioVenta = det.precioVenta || Number(productoMedida.PrecioVenta);
          
          // Prioridad: 1. Comisión enviada, 2. Comisión fija de la tabla ProductoMedida
          detalle.ComisionUnitaria = det.comisionUnitaria !== undefined 
            ? det.comisionUnitaria 
            : Number(productoMedida.Comision);

          detalle.Motivo = det.motivo;

          await queryRunner.manager.save(detalle);

          // 2.1. Procesar Precios (Ajustes)
          if (Array.isArray(det.precios)) {
            for (const p of det.precios) {
              const rcp = new Revendedorcontrolprecio();
              rcp.IdRevendedorControlPrecio = await generarIdSecuencial('RCP');
              rcp.RevendedorControlDetalle = detalle;
              rcp.Cantidad = p.cantidad || 0;
              rcp.PrecioVenta = p.precioVenta || detalle.PrecioVenta;
              rcp.Estado = p.estado || 'NORMAL';
              rcp.Observacion = p.observacion;
              await queryRunner.manager.save(rcp);
            }
          }

          // 3. Actualizar Inventario (Descontar stock de la sucursal)
          await DecrementProducto(
            queryRunner, 
            productoMedida, 
            idSucursal, 
            detalle.CantidadEntregada, 
            nuevoIdControl, 
            "SALIDA_REVENDEDOR"
          );
        }
      }
      resultados.push(nuevoIdControl);
    }

    await queryRunner.commitTransaction();
    return res.status(201).json({ 
      message: "Controles de revendedor registrados correctamente e inventario actualizado", 
      ids: resultados 
    });

  } catch (error) {
    await queryRunner.rollbackTransaction();
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ 
      message: "Error al registrar controles", 
      error: error instanceof Error ? error.message : "Error desconocido" 
    });
  } finally {
    await queryRunner.release();
  }
};

export const getRevendedorControls = async (req: Request, res: Response) => {
  try {
    const {
      fecha,
      idempleado,
      idsucursal,
      limit = 10,
      page = 1
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const query = `
      WITH filtered_rc AS (
        SELECT rc.*
        FROM revendedorcontrol rc
        WHERE rc.estado = 1
          AND ($1::date IS NULL OR rc.fecha = $1)
          AND ($2::varchar IS NULL OR rc.idempleado = $2)
          AND ($3::varchar IS NULL OR rc.idsucursal = $3)
      ),
      detalles_calc AS (
        SELECT 
          d.*,
          rc.fecha,
          rc.idempleado,
          (d.cantidadentregada - d.cantidaddevuelta) as vendido_total,
          COALESCE((SELECT SUM(p.cantidad) FROM revendedorcontrolprecio p WHERE p.idrevendedorcontroldetalle = d.idrevendedorcontroldetalle AND p.estado = 'NORMAL'), 0) as vendido_normal,
          COALESCE((SELECT SUM(p.cantidad * p.precioventa) FROM revendedorcontrolprecio p WHERE p.idrevendedorcontroldetalle = d.idrevendedorcontroldetalle), 0) as venta_total,
          (
            GREATEST(0, (d.cantidadentregada - d.cantidaddevuelta) - COALESCE(d.cantidadsincomision, 0)) * d.comisionunitaria
          ) as comision_total,
          (
            COALESCE((SELECT SUM(p.cantidad * p.precioventa) FROM revendedorcontrolprecio p WHERE p.idrevendedorcontroldetalle = d.idrevendedorcontroldetalle), 0) - 
            (GREATEST(0, (d.cantidadentregada - d.cantidaddevuelta) - COALESCE(d.cantidadsincomision, 0)) * d.comisionunitaria)
          ) as liquido_panaderia
        FROM revendedorcontroldetalle d
        INNER JOIN filtered_rc rc ON rc.idrevendedorcontrol = d.idrevendedorcontrol
      )
      SELECT 
        rc.idrevendedorcontrol,
        rc.fecha,
        rc.observacion,
        rc.hora, 
        rc.estado,
        COUNT(*) OVER() AS total,

        -- EMPLEADO
        json_build_object(
          'IdEmpleado', e.idempleado,
          'Nombre', per.nombre,
          'ApellidoPaterno', per.apellidopaterno,
          'ApellidoMaterno', per.apellidomaterno,
          'Imagen', per.imagen
        ) AS "Empleado",

        -- SUCURSAL
        json_build_object(
          'IdSucursal', s.idsucursal,
          'Nombre', s.nombre
        ) AS "Sucursal",

        -- TOTALES DEL CONTROL
        COALESCE(SUM(dc.venta_total), 0) as "TotalVenta",
        COALESCE(SUM(dc.comision_total), 0) as "TotalComision",
        COALESCE(SUM(dc.liquido_panaderia), 0) as "TotalLiquidoPanaderia",

        -- DETALLES
        COALESCE(
          json_agg(
            json_build_object(
              'IdDetalle', dc.idrevendedorcontroldetalle,
              'Producto', prod.nombre,
              'Imagen_Producto', prod.imagen,
              'Presentacion', pre.nombre,
              'CantidadEntregada', dc.cantidadentregada,
              'CantidadDevuelta', dc.cantidaddevuelta,
              'VendidoTotal', dc.vendido_total,
              'VendidoNormal', dc.vendido_normal,
              'PrecioVenta', dc.precioventa,
              'VentaTotal', dc.venta_total,
              'CantidadSinComision', COALESCE(dc.cantidadsincomision, 0),
              'ComisionUnitaria', dc.comisionunitaria,
              'ComisionTotal', dc.comision_total,
              'LiquidoPanaderia', dc.liquido_panaderia,
              'Motivo', dc.motivo,
              'PreciosAjustados', COALESCE((
                SELECT json_agg(json_build_object(
                  'IdPrecio', p.idrevendedorcontrolprecio,
                  'Cantidad', p.cantidad,
                  'PrecioVenta', p.precioventa,
                  'Estado', p.estado,
                  'Observacion', p.observacion
                )) FROM revendedorcontrolprecio p 
                WHERE p.idrevendedorcontroldetalle = dc.idrevendedorcontroldetalle
              ), '[]')
            ) ORDER BY prod.nombre
          ) FILTER (WHERE dc.idrevendedorcontroldetalle IS NOT NULL),
          '[]'
        ) AS "Detalles"
      FROM filtered_rc rc
      LEFT JOIN empleado e ON e.idempleado = rc.idempleado
      LEFT JOIN persona per ON per.idpersona = e.idpersona
      LEFT JOIN sucursal s ON s.idsucursal = rc.idsucursal
      LEFT JOIN detalles_calc dc ON dc.idrevendedorcontrol = rc.idrevendedorcontrol
      LEFT JOIN productomedida pm ON pm.idproductomedida = dc.idproductomedida
      LEFT JOIN presentacion pre ON pre.idpresentacion = pm.idpresentacion
      LEFT JOIN producto prod ON prod.idproducto = pm.idproducto
      GROUP BY 
        rc.idrevendedorcontrol, rc.fecha, rc.hora, rc.observacion, rc.estado,
        e.idempleado, per.nombre, per.apellidopaterno, per.apellidomaterno, per.imagen,
        s.idsucursal, s.nombre
      ORDER BY rc.fecha DESC
      LIMIT $4 OFFSET $5;
    `;

    const result = await AppDataSource.query(query, [
      fecha || null,
      idempleado || null,
      idsucursal || null,
      Number(limit),
      offset
    ]);

    if (result.length === 0) {
      return res.json({
        total: 0,
        page: Number(page),
        limit: Number(limit),
        data: []
      });
    }

    const total = Number(result[0].total);
    return res.json({
      total,
      page: Number(page),
      limit: Number(limit),
      data: result.map(({ total, ...rest }: any) => rest)
    });

  } catch (error) {
    return res.status(500).json({ 
      message: "Error al listar controles", 
      error: error instanceof Error ? error.message : "Error desconocido" 
    });
  }
};

export const actualizarAjusteDetalle = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const { idDetalle } = req.params;
    const { precioVenta, cantidadDevuelta, motivo, precios } = req.body;

    const detalle = await queryRunner.manager.findOne(Revendedorcontroldetalle, {
      where: { IdRevendedorControlDetalle: idDetalle }
    });

    if (!detalle) {
      throw new HttpError(404, "Detalle de control no encontrado.");
    }

    if (precioVenta !== undefined) detalle.PrecioVenta = precioVenta;
    if (cantidadDevuelta !== undefined) detalle.CantidadDevuelta = cantidadDevuelta;
    if (motivo !== undefined) detalle.Motivo = motivo;

    await queryRunner.manager.save(detalle);

    // Si se envían precios, actualizar la tabla Revendedorcontrolprecio
    if (Array.isArray(precios)) {
      await queryRunner.manager.delete(Revendedorcontrolprecio, {
        RevendedorControlDetalle: { IdRevendedorControlDetalle: idDetalle }
      });

      for (const p of precios) {
        const rcp = new Revendedorcontrolprecio();
        rcp.IdRevendedorControlPrecio = await generarIdSecuencial('RCP');
        rcp.RevendedorControlDetalle = detalle;
        rcp.Cantidad = p.cantidad || 0;
        rcp.PrecioVenta = p.precioVenta || detalle.PrecioVenta;
        rcp.Estado = p.estado || 'NORMAL';
        rcp.Observacion = p.observacion;
        await queryRunner.manager.save(rcp);
      }
    }

    await queryRunner.commitTransaction();
    return res.json({ message: "Ajuste de producto actualizado correctamente", data: detalle });

  } catch (error) {
    await queryRunner.rollbackTransaction();
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ 
      message: "Error al actualizar ajuste", 
      error: error instanceof Error ? error.message : "Error desconocido" 
    });
  } finally {
    await queryRunner.release();
  }
};

export const actualizarControlCompleto = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const { idControl } = req.params;
    const { observacion, detalles } = req.body;

    const control = await queryRunner.manager.findOne(Revendedorcontrol, {
      where: { IdRevendedorControl: idControl },
      relations: ["Sucursal"]
    });

    if (!control) {
      throw new HttpError(404, "Control no encontrado.");
    }

    if (observacion !== undefined) {
      control.Observacion = observacion;
    }
    await queryRunner.manager.save(control);

    const idSucursal = control.Sucursal.IdSucursal;

    if (Array.isArray(detalles)) {
      for (const det of detalles) {
        const { idDetalle, cantidadEntregada, cantidadDevuelta, precioVenta, motivo, precios } = det;

        if (!idDetalle) continue;

        const detalle = await queryRunner.manager.findOne(Revendedorcontroldetalle, {
          where: { IdRevendedorControlDetalle: idDetalle },
          relations: ["ProductoMedida", "ProductoMedida.Producto", "ProductoMedida.Presentacion"]
        });

        if (!detalle) {
          throw new HttpError(404, `Detalle ${idDetalle} no encontrado.`);
        }

        const productoMedida = detalle.ProductoMedida;

        if (cantidadEntregada !== undefined && cantidadEntregada !== Number(detalle.CantidadEntregada)) {
          const oldCantidad = Number(detalle.CantidadEntregada);
          await IncrementProducto(queryRunner, productoMedida, idSucursal, oldCantidad, idControl, "AJUSTE_REVENDEDOR");
          await DecrementProducto(queryRunner, productoMedida, idSucursal, cantidadEntregada, idControl, "SALIDA_REVENDEDOR");
          detalle.CantidadEntregada = cantidadEntregada;
        }

        if (precioVenta !== undefined) detalle.PrecioVenta = precioVenta;
        if (cantidadDevuelta !== undefined) detalle.CantidadDevuelta = cantidadDevuelta;
        if (motivo !== undefined) detalle.Motivo = motivo;

        await queryRunner.manager.save(detalle);

        if (Array.isArray(precios)) {
          await queryRunner.manager.delete(Revendedorcontrolprecio, {
            RevendedorControlDetalle: { IdRevendedorControlDetalle: idDetalle }
          });

          for (const p of precios) {
            const rcp = new Revendedorcontrolprecio();
            rcp.IdRevendedorControlPrecio = await generarIdSecuencial('RCP');
            rcp.RevendedorControlDetalle = detalle;
            rcp.Cantidad = p.cantidad || 0;
            rcp.PrecioVenta = p.precioVenta ?? detalle.PrecioVenta;
            rcp.Estado = p.estado || 'NORMAL';
            rcp.Observacion = p.observacion;
            await queryRunner.manager.save(rcp);
          }
        }
      }
    }

    await queryRunner.commitTransaction();
    return res.json({ message: "Control actualizado correctamente", data: { idControl } });

  } catch (error) {
    await queryRunner.rollbackTransaction();
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({
      message: "Error al actualizar control completo",
      error: error instanceof Error ? error.message : "Error desconocido"
    });
  } finally {
    await queryRunner.release();
  }
};
