import { Request, Response } from "express";
import { AppDataSource } from "../../db";

export const getReporteRevendedorConsolidado = async (req: Request, res: Response) => {
  try {
    const { fechadesde, fechahasta, idempleado, idsucursal } = req.query;

    if (!fechadesde || !fechahasta) {
      return res.status(400).json({ message: "Fechas obligatorias (fechadesde, fechahasta)." });
    }

    const params: any[] = [fechadesde, fechahasta];
    let filterIdx = 3;

    let empleadoCond = "";
    if (idempleado && idempleado !== 'TODOS') {
      empleadoCond = ` AND (rc.idempleado = $${filterIdx} OR rc.idpersona = $${filterIdx})`;
      filterIdx++;
      params.push(idempleado);
    }

    let sucursalCond = "";
    if (idsucursal && idsucursal !== 'TODOS') {
      sucursalCond = ` AND rc.idsucursal = $${filterIdx++}`;
      params.push(idsucursal);
    }

    const filterCond = `${empleadoCond} ${sucursalCond}`;

    const sql = `
      WITH filtered_rc AS (
        SELECT rc.*
        FROM revendedorcontrol rc
        WHERE rc.fecha BETWEEN $1 AND $2 AND rc.estado = 1 ${filterCond}
      ),
      precios_agg AS (
        SELECT 
          p.idrevendedorcontroldetalle,
          COALESCE(SUM(p.cantidad), 0) as total_cantidad_ajustada,
          COALESCE(SUM(p.cantidad * p.precioventa), 0) as total_venta_ajustada
        FROM revendedorcontrolprecio p
        WHERE (p.estado IS NULL OR p.estado != 'NORMAL')
        GROUP BY p.idrevendedorcontroldetalle
      ),
      detalles_calc AS (
        SELECT 
          d.*,
          rc.fecha,
          rc.idempleado,
          rc.idpersona,
          rc.gastoextra,
          COALESCE((SELECT e_sub.idpersona FROM empleado e_sub WHERE e_sub.idempleado = rc.idempleado), rc.idpersona) as persona_id,
          (d.cantidadentregada - d.cantidaddevuelta) as vendido_total,
          (
            ((d.cantidadentregada - d.cantidaddevuelta - COALESCE(pa.total_cantidad_ajustada, 0)) * d.precioventa) +
            COALESCE(pa.total_venta_ajustada, 0)
          ) as venta_total,
          (
            GREATEST(0, (d.cantidadentregada - d.cantidaddevuelta) - COALESCE(d.cantidadsincomision, 0)) * d.comisionunitaria
          ) as comision_total,
          (
            ((d.cantidadentregada - d.cantidaddevuelta - COALESCE(pa.total_cantidad_ajustada, 0)) * d.precioventa) +
            COALESCE(pa.total_venta_ajustada, 0) -
            (GREATEST(0, (d.cantidadentregada - d.cantidaddevuelta) - COALESCE(d.cantidadsincomision, 0)) * d.comisionunitaria)
          ) as liquido_panaderia
        FROM revendedorcontroldetalle d
        INNER JOIN filtered_rc rc ON rc.idrevendedorcontrol = d.idrevendedorcontrol
        LEFT JOIN precios_agg pa ON pa.idrevendedorcontroldetalle = d.idrevendedorcontroldetalle
      ),
      por_producto AS (
        SELECT 
          dc.persona_id,
          COALESCE(per.nombre, per_dir.nombre) || ' ' || COALESCE(COALESCE(per.apellidopaterno, per_dir.apellidopaterno), '') as empleado,
          prod.idproducto,
          prod.nombre as producto,
          SUM(dc.vendido_total) as cantidad_total,
          SUM(dc.comision_total) as comision,
          SUM(dc.liquido_panaderia) as liquido_panaderia
        FROM detalles_calc dc
        LEFT JOIN empleado e ON dc.idempleado = e.idempleado
        LEFT JOIN persona per ON e.idpersona = per.idpersona
        LEFT JOIN persona per_dir ON per_dir.idpersona = dc.idpersona
        JOIN productomedida pm ON dc.idproductomedida = pm.idproductomedida
        JOIN producto prod ON pm.idproducto = prod.idproducto
        GROUP BY dc.persona_id, COALESCE(per.nombre, per_dir.nombre), COALESCE(per.apellidopaterno, per_dir.apellidopaterno), prod.idproducto, prod.nombre
      ),
      gasto_extra_agg AS (
        SELECT 
          COALESCE((SELECT e_sub.idpersona FROM empleado e_sub WHERE e_sub.idempleado = rc.idempleado), rc.idpersona) as persona_id,
          SUM(COALESCE(rc.gastoextra, 0)) as total_gasto_extra
        FROM filtered_rc rc
        GROUP BY COALESCE((SELECT e_sub.idpersona FROM empleado e_sub WHERE e_sub.idempleado = rc.idempleado), rc.idpersona)
      ),
      por_empleado AS (
        SELECT 
          pe.persona_id as idempleado,
          pe.empleado,
          json_agg(json_build_object(
            'producto', pe.producto,
            'idproducto', pe.idproducto,
            'cantidad_total', pe.cantidad_total,
            'comision', pe.comision,
            'liquido_panaderia', pe.liquido_panaderia
          ) ORDER BY pe.cantidad_total DESC) as productos,
          SUM(pe.comision) as total_comision,
          SUM(pe.liquido_panaderia) as total_liquido_panaderia,
          COALESCE(ge.total_gasto_extra, 0) as total_gasto_extra,
          SUM(pe.liquido_panaderia) - COALESCE(ge.total_gasto_extra, 0) as neto_a_entregar
        FROM por_producto pe
        LEFT JOIN gasto_extra_agg ge ON ge.persona_id = pe.persona_id
        GROUP BY pe.persona_id, pe.empleado, ge.total_gasto_extra
      )
      SELECT 
        json_agg(json_build_object(
          'empleado', empleado,
          'idempleado', idempleado,
          'productos', productos,
          'total_comision', total_comision,
          'total_liquido_panaderia', total_liquido_panaderia,
          'total_gasto_extra', total_gasto_extra,
          'neto_a_entregar', neto_a_entregar
        ) ORDER BY neto_a_entregar DESC) as empleados,
        SUM(total_comision) as total_comision,
        SUM(total_liquido_panaderia) as total_liquido_panaderia,
        SUM(total_gasto_extra) as total_gasto_extra,
        SUM(neto_a_entregar) as total_neto_a_entregar
      FROM por_empleado
    `;

    const result = await AppDataSource.query(sql, params);
    const data = result[0];

    return res.json({
      metadatos: {
        desde: fechadesde,
        hasta: fechahasta,
        empleado: idempleado || "TODOS",
        sucursal: idsucursal || "TODAS"
      },
      reporte: data?.empleados || [],
      totalesGlobales: {
        total_comision_empleados: Number(data?.total_comision || 0),
        total_ganancia_panaderia: Number(data?.total_liquido_panaderia || 0),
        total_gasto_extra: Number(data?.total_gasto_extra || 0),
        total_neto_a_entregar: Number(data?.total_neto_a_entregar || 0)
      }
    });

  } catch (error) {
    console.error("Error en reporte consolidado de revendedores:", error);
    return res.status(500).json({ message: "Error al generar el reporte." });
  }
};

export const getReporteRevendedorDetallado = async (req: Request, res: Response) => {
  try {
    const { fechadesde, fechahasta, idempleado, idsucursal } = req.query;

    if (!fechadesde || !fechahasta) {
      return res.status(400).json({ message: "Fechas obligatorias." });
    }

    const params: any[] = [fechadesde, fechahasta];
    let filterIdx = 3;

    let filterCond = "";
    if (idempleado && idempleado !== 'TODOS') {
      filterCond += ` AND (rc.idempleado = $${filterIdx} OR rc.idpersona = $${filterIdx})`;
      filterIdx++;
      params.push(idempleado);
    }
    if (idsucursal && idsucursal !== 'TODOS') {
      filterCond += ` AND rc.idsucursal = $${filterIdx++}`;
      params.push(idsucursal);
    }

    const sql = `
      WITH filtered_rc AS (
        SELECT rc.*
        FROM revendedorcontrol rc
        WHERE rc.fecha BETWEEN $1 AND $2 AND rc.estado = 1 ${filterCond}
      ),
      precios_agg AS (
        SELECT 
          p.idrevendedorcontroldetalle,
          COALESCE(SUM(p.cantidad), 0) as total_cantidad_ajustada,
          COALESCE(SUM(p.cantidad * p.precioventa), 0) as total_venta_ajustada
        FROM revendedorcontrolprecio p
        WHERE (p.estado IS NULL OR p.estado != 'NORMAL')
        GROUP BY p.idrevendedorcontroldetalle
      ),
      detalles_calc AS (
        SELECT 
          d.*,
          rc.idempleado,
          rc.idpersona,
          rc.gastoextra,
          COALESCE((SELECT e_sub.idpersona FROM empleado e_sub WHERE e_sub.idempleado = rc.idempleado), rc.idpersona) as persona_id,
          (d.cantidadentregada - d.cantidaddevuelta) as vendido_total,
          (
            ((d.cantidadentregada - d.cantidaddevuelta - COALESCE(pa.total_cantidad_ajustada, 0)) * d.precioventa) +
            COALESCE(pa.total_venta_ajustada, 0)
          ) as venta_total,
          (
            GREATEST(0, (d.cantidadentregada - d.cantidaddevuelta) - COALESCE(d.cantidadsincomision, 0)) * d.comisionunitaria
          ) as comision_total,
          (
            ((d.cantidadentregada - d.cantidaddevuelta - COALESCE(pa.total_cantidad_ajustada, 0)) * d.precioventa) +
            COALESCE(pa.total_venta_ajustada, 0) -
            (GREATEST(0, (d.cantidadentregada - d.cantidaddevuelta) - COALESCE(d.cantidadsincomision, 0)) * d.comisionunitaria)
          ) as liquido_panaderia,
          COALESCE(pa.total_cantidad_ajustada, 0) as cantidad_ajustada
        FROM revendedorcontroldetalle d
        INNER JOIN filtered_rc rc ON rc.idrevendedorcontrol = d.idrevendedorcontrol
        LEFT JOIN precios_agg pa ON pa.idrevendedorcontroldetalle = d.idrevendedorcontroldetalle
      ),
      por_control AS (
        SELECT 
          rc.fecha,
          rc.idrevendedorcontrol,
          rc.observacion,
          rc.gastoextra,
          rc.idpersona,
          COALESCE(per.nombre, per_dir.nombre) || ' ' || COALESCE(COALESCE(per.apellidopaterno, per_dir.apellidopaterno), '') as empleado,
          COALESCE(rc.idempleado, rc.idpersona) as idempleado,
          s.nombre as sucursal,
          json_agg(json_build_object(
            'iddetalle', dc.idrevendedorcontroldetalle,
            'producto', prod.nombre,
            'presentacion', pre.nombre,
            'cantidad_entregada', dc.cantidadentregada,
            'cantidad_devuelta', dc.cantidaddevuelta,
            'cantidad_vendida', dc.vendido_total,
            'cantidad_ajustada', dc.cantidad_ajustada,
            'precio_venta', dc.precioventa,
            'comision_unitaria', dc.comisionunitaria,
            'comision_total', dc.comision_total,
            'liquido_panaderia', dc.liquido_panaderia,
            'motivo', dc.motivo,
            'precios_ajustados', COALESCE((
              SELECT json_agg(json_build_object(
                'idprecio', p.idrevendedorcontrolprecio,
                'cantidad', p.cantidad,
                'precio_venta', p.precioventa,
                'estado', p.estado,
                'observacion', p.observacion
              )) FROM revendedorcontrolprecio p 
              WHERE p.idrevendedorcontroldetalle = dc.idrevendedorcontroldetalle
            ), '[]')
          ) ORDER BY prod.nombre) as detalles,
          COALESCE((
            SELECT json_agg(json_build_object(
              'producto', pt.nombre,
              'total_devuelto', pt.total_devuelto,
              'total_ajustado', pt.total_ajustado
            )) FROM (
              SELECT 
                pr.nombre,
                SUM(dc_sub.cantidaddevuelta) as total_devuelto,
                SUM(dc_sub.cantidad_ajustada) as total_ajustado
              FROM detalles_calc dc_sub
              JOIN productomedida pm_sub ON dc_sub.idproductomedida = pm_sub.idproductomedida
              JOIN producto pr ON pm_sub.idproducto = pr.idproducto
              WHERE dc_sub.idrevendedorcontrol = rc.idrevendedorcontrol
              GROUP BY pr.nombre
            ) pt
          ), '[]') as producto_totales,
          SUM(dc.comision_total) as total_comision,
          SUM(dc.liquido_panaderia) as total_liquido_panaderia,
          COALESCE(rc.gastoextra, 0) as total_gasto_extra,
          SUM(dc.liquido_panaderia) - COALESCE(rc.gastoextra, 0) as neto_a_entregar
        FROM filtered_rc rc
        JOIN detalles_calc dc ON rc.idrevendedorcontrol = dc.idrevendedorcontrol
        LEFT JOIN empleado e ON rc.idempleado = e.idempleado
        LEFT JOIN persona per ON e.idpersona = per.idpersona
        LEFT JOIN persona per_dir ON per_dir.idpersona = rc.idpersona
        JOIN sucursal s ON rc.idsucursal = s.idsucursal
        JOIN productomedida pm ON dc.idproductomedida = pm.idproductomedida
        JOIN producto prod ON pm.idproducto = prod.idproducto
        JOIN presentacion pre ON pm.idpresentacion = pre.idpresentacion
        GROUP BY rc.fecha, rc.idrevendedorcontrol, rc.observacion, rc.gastoextra, COALESCE(per.nombre, per_dir.nombre), COALESCE(per.apellidopaterno, per_dir.apellidopaterno), COALESCE(rc.idempleado, rc.idpersona), rc.idempleado, rc.idpersona, per_dir.idpersona, per_dir.nombre, per_dir.apellidopaterno, per_dir.apellidomaterno, s.nombre
      )
      SELECT 
        fecha,
        json_agg(json_build_object(
          'idcontrol', idrevendedorcontrol,
          'observacion', observacion,
          'empleado', empleado,
          'idempleado', idempleado,
          'sucursal', sucursal,
          'detalles', detalles,
          'producto_totales', producto_totales,
          'total_comision', total_comision,
          'total_liquido_panaderia', total_liquido_panaderia,
          'total_gasto_extra', total_gasto_extra,
          'neto_a_entregar', neto_a_entregar
        ) ORDER BY idrevendedorcontrol) as controles,
        SUM(total_comision) as total_comision_fecha,
        SUM(total_liquido_panaderia) as total_liquido_panaderia_fecha,
        SUM(total_gasto_extra) as total_gasto_extra_fecha,
        SUM(neto_a_entregar) as total_neto_a_entregar_fecha
      FROM por_control
      GROUP BY fecha
      ORDER BY fecha DESC
    `;

    const data = await AppDataSource.query(sql, params);

    const totalGlobalComision = data.reduce((acc: number, r: any) => acc + Number(r.total_comision_fecha), 0);
    const totalGlobalPanaderia = data.reduce((acc: number, r: any) => acc + Number(r.total_liquido_panaderia_fecha), 0);
    const totalGlobalGastoExtra = data.reduce((acc: number, r: any) => acc + Number(r.total_gasto_extra_fecha), 0);
    const totalGlobalNetoEntregar = data.reduce((acc: number, r: any) => acc + Number(r.total_neto_a_entregar_fecha), 0);

    return res.json({
      metadatos: {
        desde: fechadesde,
        hasta: fechahasta,
        empleado: idempleado || "TODOS",
        sucursal: idsucursal || "TODAS"
      },
      reporte: data,
      totalesGlobales: {
        total_comision_empleados: totalGlobalComision,
        total_ganancia_panaderia: totalGlobalPanaderia,
        total_gasto_extra: totalGlobalGastoExtra,
        total_neto_a_entregar: totalGlobalNetoEntregar
      }
    });

  } catch (error) {
    console.error("Error en reporte detallado de revendedores:", error);
    return res.status(500).json({ message: "Error interno" });
  }
};
