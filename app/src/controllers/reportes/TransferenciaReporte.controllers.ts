import { Request, Response } from "express";
import { Produccion } from "../../entities/Produccion";

/**
 * REPORTE CONSOLIDADO DE TRANSFERENCIAS (Requerimientos 19-21 de prompreporte.txt)
 */
export const getReporteTransferenciasConsolidado = async (req: Request, res: Response) => {
  try {
    const { fechadesde, fechahasta, idsucursalorigen, idsucursaldestino, idempleado } = req.query;

    if (!fechadesde || !fechahasta) {
      return res.status(400).json({
        message: "Fechas obligatorias."
      });
    }

    const params: any[] = [fechadesde, fechahasta];
    let filterIdx = 3;
    let sucursalOrigenCond = "";
    if (idsucursalorigen && idsucursalorigen !== "TODOS") {
      sucursalOrigenCond = ` AND t.idsucursalorigen = $${filterIdx++}`;
      params.push(idsucursalorigen);
    }

    let sucursalDestinoCond = "";
    if (idsucursaldestino && idsucursaldestino !== "TODOS") {
      sucursalDestinoCond = ` AND t.idsucursaldestino = $${filterIdx++}`;
      params.push(idsucursaldestino);
    }

    let empCond = "";
    if (idempleado && idempleado !== 'TODOS') {
        empCond = ` AND t.idempleado = $${filterIdx++}`;
        params.push(idempleado);
    }

    const sqlResumen = `
      SELECT
        t.tipo,
        so.nombre AS origen,
        COALESCE(
          sd.nombre,
          per_emp.nombre || ' ' || COALESCE(per_emp.apellidopaterno, '') || ' (Vendedor)'
        ) AS destino,
        COUNT(DISTINCT t.idtransferencia) AS nro_transferencias,
        
        -- Detalle de items consolidado para este grupo
        (
            SELECT json_agg(item_summary)
            FROM (
                SELECT 
                    COALESCE(p.nombre, i.nombre) as nombre_producto,
                    SUM(dt_in.cantidad) as cantidad_total,
                    SUM(CASE WHEN t_in.idempleado IS NOT NULL THEN (dt_in.cantidad * pm_in.precioventa) ELSE 0 END) as subtotal_acumulado
                FROM detalle_transferencia dt_in
                JOIN transferencia t_in ON dt_in.idtransferencia = t_in.idtransferencia
                LEFT JOIN producto p ON dt_in.idproducto = p.idproducto
                LEFT JOIN insumo i ON dt_in.idinsumo = i.idinsumo
                LEFT JOIN productomedida pm_in ON dt_in.idproductomedida = pm_in.idproductomedida
                WHERE t_in.fecha BETWEEN $1 AND $2
                  AND t_in.estado = 1
                  AND t_in.tipo = t.tipo
                  AND t_in.idsucursalorigen = t.idsucursalorigen
                  AND (t_in.idsucursaldestino = t.idsucursaldestino OR (t_in.idsucursaldestino IS NULL AND t.idsucursaldestino IS NULL))
                  AND (t_in.idempleado = t.idempleado OR (t_in.idempleado IS NULL AND t.idempleado IS NULL))
                GROUP BY 1
                ORDER BY cantidad_total DESC
            ) item_summary
        ) as detalle_items,

        -- Totales del grupo
        SUM(
          COALESCE((
            SELECT SUM(CASE WHEN t.idempleado IS NOT NULL THEN (dt2.cantidad * pm2.precioventa) ELSE 0 END)
            FROM detalle_transferencia dt2
            JOIN productomedida pm2 ON dt2.idproductomedida = pm2.idproductomedida
            WHERE dt2.idtransferencia = t.idtransferencia
          ), 0)
        ) as monto_total

      FROM transferencia t
      LEFT JOIN sucursal so ON so.idsucursal = t.idsucursalorigen
      LEFT JOIN sucursal sd ON sd.idsucursal = t.idsucursaldestino
      LEFT JOIN empleado emp ON emp.idempleado = t.idempleado
      LEFT JOIN persona per_emp ON per_emp.idpersona = emp.idpersona

      WHERE t.fecha BETWEEN $1 AND $2 AND t.estado = 1
      ${sucursalOrigenCond}
      ${sucursalDestinoCond}
      ${empCond}

      GROUP BY
        t.tipo,
        t.idsucursalorigen,
        t.idsucursaldestino,
        t.idempleado,
        so.nombre,
        sd.nombre,
        per_emp.nombre,
        per_emp.apellidopaterno

      ORDER BY
        nro_transferencias DESC;
    `;

    const data = await Produccion.query(sqlResumen, params);

    return res.json({
      metadatos: {
        desde: fechadesde,
        hasta: fechahasta,
        sucursal_origen: idsucursalorigen || "TODAS",
        sucursal_destino: idsucursaldestino || "TODAS",
        empleado: idempleado || "TODOS"
      },
      data
    });

  } catch (error) {
    console.error("Error en reporte transferencias consolidado:", error);
    return res.status(500).json({
      message: "Error interno"
    });
  }
}; 

/**
 * Reporte detallado de Transferencias (CON IMÁGENES)
 */
export const getReporteTransferenciasDetallado = async (req: Request, res: Response) => {
    try {
        const { fechadesde, fechahasta, idsucursalorigen, idsucursaldestino, idempleado } = req.query;

        if (!fechadesde || !fechahasta) return res.status(400).json({ message: "Fechas obligatorias." });

        const params: any[] = [fechadesde, fechahasta];
        let filterIdx = 3;

        let sucursalOrigenCond = "";
        if (idsucursalorigen && idsucursalorigen !== 'TODOS') {
            sucursalOrigenCond = ` AND t.idsucursalorigen = $${filterIdx++}`;
            params.push(idsucursalorigen);
        }

        let sucursalDestinoCond = "";
        if (idsucursaldestino && idsucursaldestino !== 'TODOS') {
            sucursalDestinoCond = ` AND t.idsucursaldestino = $${filterIdx++}`;
            params.push(idsucursaldestino);
        }

        let empCond = "";
        if (idempleado && idempleado !== 'TODOS') {
            empCond = ` AND t.idempleado = $${filterIdx++}`;
            params.push(idempleado);
        }

        const sqlTransferencias = `
            SELECT 
                t.*, 
                so.nombre AS "SucursalOrigen", 
                sd.nombre AS "SucursalDestino", 
                per_emp.nombre || ' ' || COALESCE(per_emp.apellidopaterno, '') AS "EmpleadoDestino",
                COALESCE((
                    SELECT json_agg(prod_group)
                    FROM (
                        SELECT 
                            p.idproducto, p.nombre as producto_nombre, p.imagen as producto_imagen,
                            SUM(dt.cantidad) as total_cantidad,
                            SUM(CASE WHEN t.idempleado IS NOT NULL THEN (dt.cantidad * pm.precioventa) ELSE 0 END) as subtotal,
                            -- Detalle de cada presentación enviada de este producto
                            json_agg(json_build_object(
                                'presentacion', pres.nombre,
                                'cantidad', dt.cantidad,
                                'precio_venta', pm.precioventa
                            )) as presentaciones
                        FROM detalle_transferencia dt
                        JOIN producto p ON dt.idproducto = p.idproducto
                        LEFT JOIN productomedida pm ON dt.idproductomedida = pm.idproductomedida
                        LEFT JOIN presentacion pres ON pm.idpresentacion = pres.idpresentacion
                        WHERE dt.idtransferencia = t.idtransferencia
                        GROUP BY p.idproducto, p.nombre, p.imagen
                    ) prod_group
                ), '[]') as "Productos",
                COALESCE((
                    SELECT json_agg(ins_group)
                    FROM (
                        SELECT 
                            ins.idinsumo, ins.nombre as insumo_nombre, ins.imagen as insumo_imagen,
                            SUM(dt.cantidad) as total_cantidad,
                            -- Detalle de cada medida enviada de este insumo
                            json_agg(json_build_object(
                                'unidad', um.nombre,
                                'abreviatura', um.abreviatura,
                                'cantidad', dt.cantidad
                            )) as medidas
                        FROM detalle_transferencia dt
                        JOIN insumo ins ON dt.idinsumo = ins.idinsumo
                        LEFT JOIN insumomedida im ON dt.idinsumomedida = im.idinsumomedida
                        LEFT JOIN unidadmedida um ON im.idunidadmedida = um.idunidadmedida
                        WHERE dt.idtransferencia = t.idtransferencia
                        GROUP BY ins.idinsumo, ins.nombre, ins.imagen
                    ) ins_group
                ), '[]') as "Insumos",
                COALESCE((
                    SELECT SUM(CASE WHEN t.idempleado IS NOT NULL THEN (dt2.cantidad * pm2.precioventa) ELSE 0 END)
                    FROM detalle_transferencia dt2
                    JOIN productomedida pm2 ON dt2.idproductomedida = pm2.idproductomedida
                    WHERE dt2.idtransferencia = t.idtransferencia
                ), 0) as "MontoTotalProductos"

            FROM transferencia t 
            LEFT JOIN sucursal so ON t.idsucursalorigen = so.idsucursal 
            LEFT JOIN sucursal sd ON t.idsucursaldestino = sd.idsucursal
            LEFT JOIN empleado emp ON t.idempleado = emp.idempleado 
            LEFT JOIN persona per_emp ON emp.idpersona = per_emp.idpersona
            WHERE t.fecha BETWEEN $1 AND $2 ${sucursalOrigenCond} ${sucursalDestinoCond} ${empCond}
            ORDER BY t.fecha DESC
        `;

        const data = await Produccion.query(sqlTransferencias, params);

        // Calcular resumen global para el reporte
        const resumenGlobal = data.reduce((acc: any, curr: any) => {
            acc.totalMonto += Number(curr.MontoTotalProductos || 0);
            return acc;
        }, { totalMonto: 0 });

        return res.json({
            metadatos: {
                desde: fechadesde,
                hasta: fechahasta,
                sucursal_origen: idsucursalorigen || "TODAS",
                sucursal_destino: idsucursaldestino || "TODAS",
                empleado: idempleado || "TODOS"
            },
            resumenGlobal,
            data
        });

    } catch (error) {
        console.error("Error en transferencias detalladas:", error);
        return res.status(500).json({ message: "Error interno" });
    }
};
