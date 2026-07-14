"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReporteRevendedorDetallado = exports.getReporteRevendedorConsolidado = void 0;
const db_1 = require("../../db");
const getReporteRevendedorConsolidado = async (req, res) => {
    try {
        const { fechadesde, fechahasta, idempleado, idsucursal } = req.query;
        if (!fechadesde || !fechahasta) {
            return res.status(400).json({ message: "Fechas obligatorias (fechadesde, fechahasta)." });
        }
        const params = [fechadesde, fechahasta];
        let filterIdx = 3;
        let empleadoCond = "";
        if (idempleado && idempleado !== 'TODOS') {
            empleadoCond = ` AND rc.idempleado = $${filterIdx++}`;
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
          dc.idempleado,
          per.nombre || ' ' || COALESCE(per.apellidopaterno, '') as empleado,
          prod.idproducto,
          prod.nombre as producto,
          SUM(dc.vendido_total) as cantidad_total,
          SUM(dc.comision_total) as comision,
          SUM(dc.liquido_panaderia) as liquido_panaderia
        FROM detalles_calc dc
        JOIN empleado e ON dc.idempleado = e.idempleado
        JOIN persona per ON e.idpersona = per.idpersona
        JOIN productomedida pm ON dc.idproductomedida = pm.idproductomedida
        JOIN producto prod ON pm.idproducto = prod.idproducto
        GROUP BY dc.idempleado, e.idempleado, per.nombre, per.apellidopaterno, prod.idproducto, prod.nombre
      ),
      por_empleado AS (
        SELECT 
          idempleado,
          empleado,
          json_agg(json_build_object(
            'producto', producto,
            'idproducto', idproducto,
            'cantidad_total', cantidad_total,
            'comision', comision,
            'liquido_panaderia', liquido_panaderia
          ) ORDER BY cantidad_total DESC) as productos,
          SUM(comision) as total_comision,
          SUM(liquido_panaderia) as total_liquido_panaderia
        FROM por_producto
        GROUP BY idempleado, empleado
      )
      SELECT 
        json_agg(json_build_object(
          'empleado', empleado,
          'idempleado', idempleado,
          'productos', productos,
          'total_comision', total_comision,
          'total_liquido_panaderia', total_liquido_panaderia
        ) ORDER BY total_liquido_panaderia DESC) as empleados,
        SUM(total_comision) as total_comision,
        SUM(total_liquido_panaderia) as total_liquido_panaderia
      FROM por_empleado
    `;
        const result = await db_1.AppDataSource.query(sql, params);
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
                total_ganancia_panaderia: Number(data?.total_liquido_panaderia || 0)
            }
        });
    }
    catch (error) {
        console.error("Error en reporte consolidado de revendedores:", error);
        return res.status(500).json({ message: "Error al generar el reporte." });
    }
};
exports.getReporteRevendedorConsolidado = getReporteRevendedorConsolidado;
const getReporteRevendedorDetallado = async (req, res) => {
    try {
        const { fechadesde, fechahasta, idempleado, idsucursal } = req.query;
        if (!fechadesde || !fechahasta) {
            return res.status(400).json({ message: "Fechas obligatorias." });
        }
        const params = [fechadesde, fechahasta];
        let filterIdx = 3;
        let filterCond = "";
        if (idempleado && idempleado !== 'TODOS') {
            filterCond += ` AND rc.idempleado = $${filterIdx++}`;
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
          per.nombre || ' ' || COALESCE(per.apellidopaterno, '') as empleado,
          rc.idempleado,
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
          SUM(dc.liquido_panaderia) as total_liquido_panaderia
        FROM filtered_rc rc
        JOIN detalles_calc dc ON rc.idrevendedorcontrol = dc.idrevendedorcontrol
        JOIN empleado e ON rc.idempleado = e.idempleado
        JOIN persona per ON e.idpersona = per.idpersona
        JOIN sucursal s ON rc.idsucursal = s.idsucursal
        JOIN productomedida pm ON dc.idproductomedida = pm.idproductomedida
        JOIN producto prod ON pm.idproducto = prod.idproducto
        JOIN presentacion pre ON pm.idpresentacion = pre.idpresentacion
        GROUP BY rc.fecha, rc.idrevendedorcontrol, rc.observacion, per.nombre, per.apellidopaterno, rc.idempleado, s.nombre
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
          'total_liquido_panaderia', total_liquido_panaderia
        ) ORDER BY idrevendedorcontrol) as controles,
        SUM(total_comision) as total_comision_fecha,
        SUM(total_liquido_panaderia) as total_liquido_panaderia_fecha
      FROM por_control
      GROUP BY fecha
      ORDER BY fecha DESC
    `;
        const data = await db_1.AppDataSource.query(sql, params);
        const totalGlobalComision = data.reduce((acc, r) => acc + Number(r.total_comision_fecha), 0);
        const totalGlobalPanaderia = data.reduce((acc, r) => acc + Number(r.total_liquido_panaderia_fecha), 0);
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
                total_ganancia_panaderia: totalGlobalPanaderia
            }
        });
    }
    catch (error) {
        console.error("Error en reporte detallado de revendedores:", error);
        return res.status(500).json({ message: "Error interno" });
    }
};
exports.getReporteRevendedorDetallado = getReporteRevendedorDetallado;
