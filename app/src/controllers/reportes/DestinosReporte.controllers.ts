import { Request, Response } from "express";
import { AppDataSource } from "../../db";

/**
 * REPORTE: Destinos de la Producción (por día y turno).
 * Fuentes:
 *   - Producción = stock inicial heredado + producido (por producto/presentación).
 *   - Revendedor = lo que sacó, tanto por control de revendedores (cantidadentregada)
 *     como por transferencias tipo 'VENDEDOR' (stock entregado a un vendedor).
 *   - Tienda = transferencias de stock (tipo 'SUCURSAL') hacia la tienda destino.
 *   - Cocina = solo pedidos (ventas directas).
 * Resta = Producción − lo entregado (se arrastra al siguiente turno/día en el front).
 */
export const getReporteDestinos = async (req: Request, res: Response) => {
  try {
    const { fechadesde, fechahasta, idsucursal } = req.query;

    if (!fechadesde || !fechahasta) {
      return res.status(400).json({ message: "Fechas obligatorias (fechadesde, fechahasta)." });
    }

    const params: any[] = [fechadesde, fechahasta];
    let sucursalCondProd = "";
    let sucursalCondRev = "";
    let sucursalCondTienda = "";
    let sucursalCondCocina = "";
    let sucursalCondVendedor = "";

    if (idsucursal && idsucursal !== "TODOS") {
      sucursalCondProd = ` AND prod.idsucursal = $3`;
      sucursalCondRev = ` AND rc.idsucursal = $3`;
      sucursalCondTienda = ` AND t.idsucursaldestino = $3`;
      sucursalCondCocina = ` AND pe.idsucursal = $3`;
      sucursalCondVendedor = ` AND t.idsucursalorigen = $3`;
      params.push(idsucursal);
    } else {
      // Sin sucursal seleccionada: "Tienda" son transferencias con destino a una
      // tienda (se excluye la cocina, central = 3).
      sucursalCondTienda = ` AND NOT EXISTS (SELECT 1 FROM sucursal sc WHERE sc.idsucursal = t.idsucursaldestino AND sc.central = 3)`;
    }

    const sqlTurnosProd = `
      SELECT
        prod.fechaproduccion as dia_comercial,
        CASE WHEN COALESCE(prod.horainicio, '00:00') >= '12:00' THEN 'tarde' ELSE 'manana' END as turno,
        dp.idproducto,
        pr.nombre as producto,
        dp.idproductomedida,
        COALESCE(pm2.idpresentacion, dp.idpresentacion) as idpresentacion,
        CASE WHEN dp.idproductomedida IS NOT NULL THEN COALESCE(pres.nombre, 'S/N') ELSE 'Unidad' END as presentacion,
        COALESCE(pres.abreviatura, '') as abreviatura,
        COALESCE(pm2.cantidad, 1) as presentacion_factor,
        SUM(CASE WHEN COALESCE(dp.cantidadpresentacion, 0) > 0 THEN dp.cantidadpresentacion ELSE COALESCE(dp.cantidadunidades, 0) END) as cantidad_producida
      FROM detalle_produccion dp
      INNER JOIN produccion prod ON dp.idproduccion = prod.idproduccion
      INNER JOIN producto pr ON dp.idproducto = pr.idproducto
      LEFT JOIN productomedida pm2 ON dp.idproductomedida = pm2.idproductomedida
      LEFT JOIN presentacion pres ON COALESCE(pm2.idpresentacion, dp.idpresentacion) = pres.idpresentacion
      WHERE prod.fechaproduccion BETWEEN $1 AND $2 AND prod.estado = 1 ${sucursalCondProd}
      GROUP BY dia_comercial, turno, dp.idproducto, pr.nombre, dp.idproductomedida, COALESCE(pm2.cantidad, 1), COALESCE(pm2.idpresentacion, dp.idpresentacion), CASE WHEN dp.idproductomedida IS NOT NULL THEN COALESCE(pres.nombre, 'S/N') ELSE 'Unidad' END, COALESCE(pres.abreviatura, '')
      ORDER BY dia_comercial, turno, pr.nombre, CASE WHEN dp.idproductomedida IS NOT NULL THEN COALESCE(pres.nombre, 'S/N') ELSE 'Unidad' END
    `;

    const sqlTurnosRevDest = `
      SELECT
        rc.fecha as dia_comercial,
        CASE WHEN COALESCE(rc.hora, '00:00') >= '12:00' THEN 'tarde' ELSE 'manana' END as turno,
        COALESCE(per.nombre, per_dir.nombre) || ' ' || COALESCE(COALESCE(per.apellidopaterno, per_dir.apellidopaterno), '') as revendedor,
        pm.idproducto,
        pr.nombre as producto,
        rcd.idproductomedida,
        COALESCE(pres.nombre, 'S/N') as presentacion,
        COALESCE(pres.abreviatura, '') as abreviatura,
        COALESCE(pm.cantidad, 1) as presentacion_factor,
        SUM(rcd.cantidadentregada) as cantidad_entregada
      FROM revendedorcontroldetalle rcd
      INNER JOIN revendedorcontrol rc ON rcd.idrevendedorcontrol = rc.idrevendedorcontrol
      INNER JOIN productomedida pm ON rcd.idproductomedida = pm.idproductomedida
      INNER JOIN producto pr ON pm.idproducto = pr.idproducto
      LEFT JOIN presentacion pres ON pm.idpresentacion = pres.idpresentacion
      LEFT JOIN empleado e ON rc.idempleado = e.idempleado
      LEFT JOIN persona per ON e.idpersona = per.idpersona
      LEFT JOIN persona per_dir ON per_dir.idpersona = rc.idpersona
      WHERE rc.fecha BETWEEN $1 AND $2 AND rc.estado = 1 ${sucursalCondRev}
      GROUP BY dia_comercial, turno, revendedor, pm.idproducto, pr.nombre, rcd.idproductomedida, COALESCE(pm.cantidad, 1), COALESCE(pres.nombre, 'S/N'), COALESCE(pres.abreviatura, '')
      ORDER BY dia_comercial, turno, revendedor, pr.nombre, COALESCE(pres.nombre, 'S/N')
    `;

    const sqlTurnosTiendaDest = `
      SELECT
        t.fecha as dia_comercial,
        CASE WHEN COALESCE(t.hora, '00:00') >= '12:00' THEN 'tarde' ELSE 'manana' END as turno,
        COALESCE(pm.idproducto, dt.idproducto) as idproducto,
        COALESCE(pr.nombre, pr2.nombre) as producto,
        dt.idproductomedida,
        CASE WHEN dt.idproductomedida IS NOT NULL THEN COALESCE(pres.nombre, 'S/N') ELSE 'Unidad' END as presentacion,
        COALESCE(pres.abreviatura, '') as abreviatura,
        COALESCE(pm.cantidad, 1) as presentacion_factor,
        SUM(dt.cantidad) as cantidad_tienda
      FROM detalle_transferencia dt
      INNER JOIN transferencia t ON dt.idtransferencia = t.idtransferencia
      LEFT JOIN productomedida pm ON dt.idproductomedida = pm.idproductomedida
      LEFT JOIN producto pr ON pm.idproducto = pr.idproducto
      LEFT JOIN producto pr2 ON dt.idproducto = pr2.idproducto
      LEFT JOIN presentacion pres ON pm.idpresentacion = pres.idpresentacion
      WHERE t.fecha BETWEEN $1 AND $2 AND t.estado = 1
        AND UPPER(t.tipo) = 'SUCURSAL' AND t.idsucursaldestino IS NOT NULL
        ${sucursalCondTienda}
      GROUP BY dia_comercial, turno, COALESCE(pm.idproducto, dt.idproducto), COALESCE(pr.nombre, pr2.nombre), dt.idproductomedida, COALESCE(pm.cantidad, 1), CASE WHEN dt.idproductomedida IS NOT NULL THEN COALESCE(pres.nombre, 'S/N') ELSE 'Unidad' END, COALESCE(pres.abreviatura, '')
      ORDER BY dia_comercial, turno, COALESCE(pr.nombre, pr2.nombre), CASE WHEN dt.idproductomedida IS NOT NULL THEN COALESCE(pres.nombre, 'S/N') ELSE 'Unidad' END
    `;

    const sqlTurnosVendedorDest = `
      SELECT
        t.fecha as dia_comercial,
        CASE WHEN COALESCE(t.hora, '00:00') >= '12:00' THEN 'tarde' ELSE 'manana' END as turno,
        COALESCE(per_v.nombre, sd.nombre) || ' ' || CASE WHEN per_v.idpersona IS NOT NULL THEN COALESCE(per_v.apellidopaterno, '') ELSE '' END as revendedor,
        COALESCE(pm.idproducto, dt.idproducto) as idproducto,
        COALESCE(pr.nombre, pr2.nombre) as producto,
        dt.idproductomedida,
        CASE WHEN dt.idproductomedida IS NOT NULL THEN COALESCE(pres.nombre, 'S/N') ELSE 'Unidad' END as presentacion,
        COALESCE(pres.abreviatura, '') as abreviatura,
        COALESCE(pm.cantidad, 1) as presentacion_factor,
        SUM(dt.cantidad) as cantidad_entregada
      FROM detalle_transferencia dt
      INNER JOIN transferencia t ON dt.idtransferencia = t.idtransferencia
      LEFT JOIN productomedida pm ON dt.idproductomedida = pm.idproductomedida
      LEFT JOIN producto pr ON pm.idproducto = pr.idproducto
      LEFT JOIN producto pr2 ON dt.idproducto = pr2.idproducto
      LEFT JOIN presentacion pres ON pm.idpresentacion = pres.idpresentacion
      LEFT JOIN empleado emp_v ON t.idempleado = emp_v.idempleado
      LEFT JOIN persona per_v ON emp_v.idpersona = per_v.idpersona
      LEFT JOIN sucursal sd ON t.idsucursaldestino = sd.idsucursal
      WHERE t.fecha BETWEEN $1 AND $2 AND t.estado = 1
        AND UPPER(t.tipo) = 'VENDEDOR'
        ${sucursalCondVendedor}
      GROUP BY dia_comercial, turno, revendedor, COALESCE(pm.idproducto, dt.idproducto), COALESCE(pr.nombre, pr2.nombre), dt.idproductomedida, COALESCE(pm.cantidad, 1), CASE WHEN dt.idproductomedida IS NOT NULL THEN COALESCE(pres.nombre, 'S/N') ELSE 'Unidad' END, COALESCE(pres.abreviatura, '')
      ORDER BY dia_comercial, turno, revendedor, COALESCE(pr.nombre, pr2.nombre), CASE WHEN dt.idproductomedida IS NOT NULL THEN COALESCE(pres.nombre, 'S/N') ELSE 'Unidad' END
    `;

    const sqlTurnosCocinaDest = `
      SELECT
        pe.fecharegistro as dia_comercial,
        CASE WHEN COALESCE(pe.hora, '00:00') >= '12:00' THEN 'tarde' ELSE 'manana' END as turno,
        COALESCE(pm.idproducto, dp.idproducto) as idproducto,
        COALESCE(pr.nombre, pr2.nombre) as producto,
        dp.idproductomedida,
        CASE WHEN dp.idproductomedida IS NOT NULL THEN COALESCE(pres.nombre, 'S/N') ELSE 'Unidad' END as presentacion,
        COALESCE(pres.abreviatura, '') as abreviatura,
        COALESCE(pm.cantidad, 1) as presentacion_factor,
        SUM(dp.cantidad - COALESCE(dp.cantidad_devuelta, 0)) as cantidad_cocina
      FROM detallepedido dp
      INNER JOIN pedido pe ON dp.idpedido = pe.idpedido
      LEFT JOIN productomedida pm ON dp.idproductomedida = pm.idproductomedida
      LEFT JOIN producto pr ON pm.idproducto = pr.idproducto
      LEFT JOIN producto pr2 ON dp.idproducto = pr2.idproducto
      LEFT JOIN presentacion pres ON pm.idpresentacion = pres.idpresentacion
      WHERE pe.fecharegistro BETWEEN $1 AND $2 AND pe.estado = 1 ${sucursalCondCocina}
      GROUP BY dia_comercial, turno, COALESCE(pm.idproducto, dp.idproducto), COALESCE(pr.nombre, pr2.nombre), dp.idproductomedida, COALESCE(pm.cantidad, 1), CASE WHEN dp.idproductomedida IS NOT NULL THEN COALESCE(pres.nombre, 'S/N') ELSE 'Unidad' END, COALESCE(pres.abreviatura, '')
      ORDER BY dia_comercial, turno, COALESCE(pr.nombre, pr2.nombre), CASE WHEN dp.idproductomedida IS NOT NULL THEN COALESCE(pres.nombre, 'S/N') ELSE 'Unidad' END
    `;

    const safeQ = async (sql: string, params: any[]) => {
      try { return await AppDataSource.query(sql, params); }
      catch (err) { console.error("DestinosReporte - consulta con error:", err); return []; }
    };

    const [turnosProd, turnosRevDest, turnosVendedorDest, turnosTiendaDest, turnosCocinaDest] = await Promise.all([
      safeQ(sqlTurnosProd, params),
      safeQ(sqlTurnosRevDest, params),
      safeQ(sqlTurnosVendedorDest, params),
      safeQ(sqlTurnosTiendaDest, params),
      safeQ(sqlTurnosCocinaDest, params)
    ]);

    // ===== Construcción de la matriz de destinos por día/turno =====
    // Claves normalizadas (producto::presentación) iguales a las del reporte
    // "Producción vs Venta", para que el front pueda alinear columnas y arrastrar.
    const presUnidad = (pres: any) => {
      const p = String(pres || "").trim();
      return (p === "Unidad" || p === "S/N" || p === "");
    };
    const normDia = (v: any) => {
      const d = v instanceof Date ? v : new Date(String(v).split('T')[0] + 'T12:00:00');
      return isNaN(d.getTime()) ? String(v) : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };
    const normKeyDest = (row: any) => String(row.idproducto) + '::' + (presUnidad(row.presentacion) ? '__unidad__' : String(row.presentacion).trim());

    const destMap = new Map<string, { prod: Map<string, number>; tda: Map<string, number>; coc: Map<string, number>; rev: Map<string, Map<string, number>>; meta: Map<string, any> }>();
    const ensureDest = (dia: string, turno: string) => {
      const key = `${dia}|${turno}`;
      let e = destMap.get(key);
      if (!e) { e = { prod: new Map(), tda: new Map(), coc: new Map(), rev: new Map(), meta: new Map() }; destMap.set(key, e); }
      return e;
    };
    const setMetaDest = (e: any, row: any) => {
      const key = normKeyDest(row);
      if (!e.meta.has(key)) {
        e.meta.set(key, {
          idproducto: row.idproducto,
          producto: row.producto || "Sin nombre",
          presentacion: presUnidad(row.presentacion) ? "Unidad" : String(row.presentacion).trim(),
          abreviatura: row.abreviatura || "",
          factor: Math.max(1, Number(row.presentacion_factor) || 1),
          esUnidad: presUnidad(row.presentacion)
        });
      }
    };
    const sumIn = (m: Map<string, number>, key: string, v: number) => { m.set(key, (m.get(key) || 0) + v); };

    for (const row of turnosProd as any[]) {
      const e = ensureDest(normDia(row.dia_comercial), row.turno);
      sumIn(e.prod, normKeyDest(row), Number(row.cantidad_producida) || 0);
      setMetaDest(e, row);
    }
    for (const row of turnosRevDest as any[]) {
      const e = ensureDest(normDia(row.dia_comercial), row.turno);
      const key = normKeyDest(row);
      const nombre = String(row.revendedor || "").trim() || "Revendedor";
      let per = e.rev.get(nombre);
      if (!per) { per = new Map(); e.rev.set(nombre, per); }
      sumIn(per, key, Number(row.cantidad_entregada) || 0);
      setMetaDest(e, row);
    }
    for (const row of turnosVendedorDest as any[]) {
      const e = ensureDest(normDia(row.dia_comercial), row.turno);
      const key = normKeyDest(row);
      const nombre = String(row.revendedor || "").trim() || "Revendedor";
      let per = e.rev.get(nombre);
      if (!per) { per = new Map(); e.rev.set(nombre, per); }
      sumIn(per, key, Number(row.cantidad_entregada) || 0);
      setMetaDest(e, row);
    }
    for (const row of turnosTiendaDest as any[]) {
      const e = ensureDest(normDia(row.dia_comercial), row.turno);
      sumIn(e.tda, normKeyDest(row), Number(row.cantidad_tienda) || 0);
      setMetaDest(e, row);
    }
    for (const row of turnosCocinaDest as any[]) {
      const e = ensureDest(normDia(row.dia_comercial), row.turno);
      sumIn(e.coc, normKeyDest(row), Number(row.cantidad_cocina) || 0);
      setMetaDest(e, row);
    }

    const destinos: any[] = [];
    for (const dia of [...new Set([...destMap.keys()].map(k => k.split("|")[0]))].sort()) {
      const unidades: Record<string, any> = {};
      const bTurno = (turno: string) => {
        const e = destMap.get(`${dia}|${turno}`);
        if (!e) return null;
        for (const [key, m] of e.meta.entries()) unidades[key] = m;
        const objOf = (m: Map<string, number>) => { const o: Record<string, number> = {}; for (const [k, v] of m.entries()) o[k] = v; return o; };
        const revendedores = [...e.rev.entries()]
          .map(([nombre, det]) => ({ revendedor: nombre, detalle: objOf(det) }))
          .sort((a: any, b: any) => a.revendedor.localeCompare(b.revendedor));
        return { produccion: objOf(e.prod), tienda: objOf(e.tda), cocina: objOf(e.coc), revendedores };
      };
      destinos.push({ fecha: dia, unidades, turnos: { manana: bTurno("manana"), tarde: bTurno("tarde") } });
    }
    destinos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    console.log(`[DestinosReporte] filas: prod=${turnosProd.length}, rev=${turnosRevDest.length}, vendedor=${turnosVendedorDest.length}, tienda=${turnosTiendaDest.length}, cocina=${turnosCocinaDest.length} -> dias=${destinos.length}, rango=${fechadesde}..${fechahasta}, sucursal=${idsucursal || "TODAS"}`);

    return res.json({
      metadatos: { desde: fechadesde, hasta: fechahasta, sucursal: idsucursal || "TODAS" },
      destinos
    });

  } catch (error) {
    console.error("Error en reporte de destinos de la producción:", error);
    return res.status(500).json({ message: "Error al generar el reporte de destinos." });
  }
};