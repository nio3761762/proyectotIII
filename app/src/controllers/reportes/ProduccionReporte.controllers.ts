import { Request, Response } from "express";
import { Produccion } from "../../entities/Produccion";

/**
 * REPORTE CONSOLIDADO DE PRODUCCIÓN (Estricto por Receta)
 */
export const getReporteProduccionConsolidado = async (req: Request, res: Response) => {
  try {
    const { fechadesde, fechahasta, idsucursal, idproducto } = req.query;

    if (!fechadesde || !fechahasta) return res.status(400).json({ message: "Fechas obligatorias." });

    let filterIdx = 1;
    const params: any[] = [];
    const wheres: string[] = ["p.fechaproduccion BETWEEN $" + (filterIdx++) + " AND $" + (filterIdx++), "p.estado = 1"];
    params.push(fechadesde, fechahasta);

    if (idsucursal && idsucursal !== "TODOS") {
      wheres.push(`p.idsucursal = $${filterIdx++}`);
      params.push(idsucursal);
    }

    if (idproducto && idproducto !== "TODOS") {
      wheres.push(`hp.idproducto = $${filterIdx++}`);
      params.push(idproducto);
    }

    const baseWhere = `WHERE ${wheres.join(" AND ")}`;

    // Build separate conditions for the cost query (needs EXISTS for product filter)
    let costFilterIdx = 1;
    const costParams: any[] = [];
    const costWheres: string[] = ["p.fechaproduccion BETWEEN $" + (costFilterIdx++) + " AND $" + (costFilterIdx++), "p.estado = 1"];
    costParams.push(fechadesde, fechahasta);

    if (idsucursal && idsucursal !== "TODOS") {
      costWheres.push(`p.idsucursal = $${costFilterIdx++}`);
      costParams.push(idsucursal);
    }

    let costProductFilter = "";
    if (idproducto && idproducto !== "TODOS") {
      costProductFilter = ` AND EXISTS (
        SELECT 1 FROM produccion_horno_detalle phd2
        INNER JOIN hornoproducto hp2 ON phd2.idproduccionhornodetalle = hp2.idproduccionhornodetalle
        WHERE phd2.idproduccion = p.idproduccion AND hp2.idproducto = $${costFilterIdx++}
      )`;
      costParams.push(idproducto);
    }

    const costBaseWhere = `WHERE ${costWheres.join(" AND ")}`;

    const sqlCosto = `
      SELECT COALESCE(SUM(p.costototal), 0) as costo_produccion_total
      FROM produccion p
      ${costBaseWhere} ${costProductFilter}
    `;

    const sql = `
      SELECT
        s.nombre as sucursal,
        pr.idproducto,
        pr.nombre as producto,
        pr.imagen,
        per.nombre || ' ' || COALESCE(per.apellidopaterno, '') as empleado,
        SUM(hp.cantidad) as cantidad,
        (
          SELECT json_agg(json_build_object(
            'insumo', i.nombre,
            'peso_en_receta', ing.peso,
            'rendimiento_receta', r.rendimiento,
            'unidad', um.abreviatura
          ))
          FROM (SELECT * FROM receta r2 WHERE r2.idproducto = pr.idproducto ORDER BY r2.idreceta DESC LIMIT 1) r
          INNER JOIN ingrediente ing ON r.idreceta = ing.idreceta
          INNER JOIN insumo i ON ing.idinsumo = i.idinsumo
          LEFT JOIN unidadmedida um ON ing.idunidadmedida = um.idunidadmedida
        ) as ingredientes
      FROM hornoproducto hp
      INNER JOIN produccion_horno_detalle phd ON hp.idproduccionhornodetalle = phd.idproduccionhornodetalle
      INNER JOIN produccion p ON phd.idproduccion = p.idproduccion
      INNER JOIN sucursal s ON p.idsucursal = s.idsucursal
      INNER JOIN producto pr ON hp.idproducto = pr.idproducto
      INNER JOIN empleado e ON hp.idempleado = e.idempleado
      INNER JOIN persona per ON e.idpersona = per.idpersona
      ${baseWhere}
      GROUP BY s.nombre, pr.idproducto, pr.nombre, pr.imagen, per.nombre, per.apellidopaterno
      ORDER BY s.nombre, pr.nombre, empleado
    `;

    const [rows, costoResult] = await Promise.all([
      Produccion.query(sql, params),
      Produccion.query(sqlCosto, costParams)
    ]);

    const costo_produccion_total = Number(costoResult[0]?.costo_produccion_total ?? 0);

    const sucursalMap = new Map<string, any>();
    let totalGeneral = 0;

    for (const row of rows as any[]) {
      const cant = Number(row.cantidad);
      totalGeneral += cant;

      if (!sucursalMap.has(row.sucursal)) {
        sucursalMap.set(row.sucursal, {
          sucursal: row.sucursal,
          total_sucursal: 0,
          productos: new Map<string, any>()
        });
      }
      const suc = sucursalMap.get(row.sucursal)!;
      suc.total_sucursal += cant;

      const prodKey = row.idproducto;
      if (!suc.productos.has(prodKey)) {
        const ingredientesRaw: any[] = row.ingredientes || [];
        suc.productos.set(prodKey, {
          idproducto: row.idproducto,
          producto: row.producto,
          imagen: row.imagen,
          total_producto: 0,
          empleados: [],
          ingredientes: ingredientesRaw
        });
      }
      const prod = suc.productos.get(prodKey)!;
      prod.total_producto += cant;
      prod.empleados.push({
        empleado: row.empleado,
        cantidad: cant
      });
    }

    const sucursales = Array.from(sucursalMap.values()).map(s => ({
      sucursal: s.sucursal,
      total_sucursal: s.total_sucursal,
        productos: Array.from(s.productos.values()).map((prod: any) => {
        const cantProducida = prod.total_producto;
        const insumosCalculados = (prod.ingredientes || []).map((ing: any) => {
          const peso = Number(ing.peso_en_receta);
          const rend = Number(ing.rendimiento_receta) || 1;
          const total = (peso / rend) * cantProducida;
          return {
            insumo: ing.insumo,
            cantidad_consumida: Number(total.toFixed(3)),
            unidad: ing.unidad
          };
        });
        const { ingredientes, ...rest } = prod as any;
        return { ...rest, insumos_calculados: insumosCalculados };
      })
    }));

    return res.json({ sucursales, total_general: totalGeneral, costo_produccion_total, metadatos: { desde: fechadesde, hasta: fechahasta } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error" });
  }
};

/**
 * REPORTE DETALLADO DE PRODUCCIÓN (Estricto por Receta con Empleado, Horno e Insumos Totales)
 */
export const getReporteProduccionDetallado = async (req: Request, res: Response) => {
  try {
    const { fechadesde, fechahasta, idsucursal, idproducto } = req.query;
    if (!fechadesde || !fechahasta) return res.status(400).json({ message: "Fechas obligatorias." });

    const params: any[] = [fechadesde, fechahasta];
    let filterIdx = 3;
    let sucursalCond = "";
    if (idsucursal && idsucursal !== 'TODOS') {
      sucursalCond = ` AND p.idsucursal = $${filterIdx++}`;
      params.push(idsucursal);
    } 

    let productCond = "";
    if (idproducto && idproducto !== 'TODOS') {
      productCond = ` AND hp.idproducto = $${filterIdx++}`;
      params.push(idproducto);
    }

    const sql = `
      SELECT 
        p.idproduccion, p.fechaproduccion, p.horainicio, p.horafin,
        p.costoinsumos, p.costomanobra, p.costoindirecto, p.costototal,
        s.nombre as sucursal_nombre,
        -- DETALLE DE PRODUCCIÓN POR LOTE (PRODUCTO + EMPLEADO + HORNO)
        (
          SELECT json_agg(json_build_object(
            'producto_nombre', pr.nombre,
            'cantidad', hp.cantidad,
            'costo_horno', CAST(phd.costo AS NUMERIC),
            'costo_unitario', (
              -- Uso del costo unitario guardado en el detalle de producción
              SELECT CAST(dp.costounitario AS NUMERIC)
              FROM detalle_produccion dp
              WHERE dp.idproduccion = p.idproduccion AND dp.idproducto = pr.idproducto
              LIMIT 1
            ),
            'cantidad_mala', (
              SELECT CAST(dp.cantidadmala AS NUMERIC)
              FROM detalle_produccion dp
              WHERE dp.idproduccion = p.idproduccion AND dp.idproducto = pr.idproducto
              LIMIT 1
            ),
            'motivo_mala', (
              SELECT dp.motivo
              FROM detalle_produccion dp
              WHERE dp.idproduccion = p.idproduccion AND dp.idproducto = pr.idproducto
              LIMIT 1
            ),
            'empleado_completo', per.nombre || ' ' || COALESCE(per.apellidopaterno, '') || ' ' || COALESCE(per.apellidomaterno, ''),
            'horno_nombre', h.nombre,
             'hora', hp.hora,
            'insumos_receta', (
              SELECT json_agg(json_build_object(
                'insumo', i.nombre,
                'cantidad_calculada', (ing.peso / r.rendimiento) * hp.cantidad,
                'costo_calculado', (ing.peso / r.rendimiento) * hp.cantidad * CAST(COALESCE(inv_i.costounitario, 0) AS NUMERIC),
                'unidad', um.abreviatura
              )) 
              FROM (SELECT * FROM receta r2 WHERE r2.idproducto = pr.idproducto ORDER BY r2.idreceta DESC LIMIT 1) r
              INNER JOIN ingrediente ing ON r.idreceta = ing.idreceta
              INNER JOIN insumo i ON ing.idinsumo = i.idinsumo
              LEFT JOIN unidadmedida um ON ing.idunidadmedida = um.idunidadmedida
              LEFT JOIN (
                -- Se prioriza el costo histórico del movimiento de inventario para esa producción
                SELECT idinsumo, AVG(CAST(costounitario AS NUMERIC)) as costounitario 
                FROM movimiento_inventario 
                WHERE idreferencia = p.idproduccion AND tipo = 'SALIDA_PRODUCCION'
                GROUP BY idinsumo
              ) inv_i ON i.idinsumo = inv_i.idinsumo
            )
          ))
          FROM hornoproducto hp
          INNER JOIN produccion_horno_detalle phd ON hp.idproduccionhornodetalle = phd.idproduccionhornodetalle
          INNER JOIN horno h ON phd.idhorno = h.idhorno
          INNER JOIN producto pr ON hp.idproducto = pr.idproducto
          INNER JOIN empleado e ON hp.idempleado = e.idempleado
          INNER JOIN persona per ON e.idpersona = per.idpersona
          WHERE phd.idproduccion = p.idproduccion ${productCond}
        ) as "DetalleLotes",
        -- RESUMEN DE MANO DE OBRA (CON APELLIDOS Y HORARIOS)
        (
          SELECT json_agg(json_build_object(
            'empleado', per.nombre || ' ' || COALESCE(per.apellidopaterno, ''), 
            'horas', pe_sub.h,
            'costo', pe_sub.c,
            'horainicio', pe_sub.hora_inicio,
            'horafin', pe_sub.hora_fin
          ))
          FROM (
            SELECT idempleado, SUM(horas) as h, SUM(CAST(costototal AS NUMERIC)) as c,
                   MIN(horainicio) as hora_inicio, MAX(horafin) as hora_fin
            FROM produccion_empleado 
            WHERE idproduccion = p.idproduccion 
            GROUP BY idempleado
          ) pe_sub
          INNER JOIN empleado e ON pe_sub.idempleado = e.idempleado
          INNER JOIN persona per ON e.idpersona = per.idpersona
        ) as "ManoObraTotal",
        -- RESUMEN DE USO DE HORNOS
        (
          SELECT json_agg(json_build_object('horno', h.nombre, 'energia', ph_sub.tipo, 'consumo', ph_sub.cons, 'costo', ph_sub.costo_e))
          FROM (
            SELECT idhorno, tipoenergia as tipo, SUM(consumo) as cons, SUM(CAST(costo AS NUMERIC)) as costo_e
            FROM produccion_horno_detalle 
            WHERE idproduccion = p.idproduccion 
            GROUP BY idhorno, tipoenergia
          ) ph_sub
          INNER JOIN horno h ON ph_sub.idhorno = h.idhorno
        ) as "UsoHornosTotal"
      FROM produccion p
      LEFT JOIN sucursal s ON p.idsucursal = s.idsucursal
      WHERE p.fechaproduccion BETWEEN $1 AND $2 ${sucursalCond}
      GROUP BY p.idproduccion, s.nombre, p.costoinsumos, p.costomanobra, p.costoindirecto, p.costototal
      ORDER BY p.fechaproduccion DESC
    `;

    const data = await Produccion.query(sql, params);

    // Cálculos de consumo total por producción y por periodo
    const resumenGeneralInsumos: any = {};

    const formatted = data.map((prod: any) => {
      const insumosProduccion: any = {};
      let cantidadTotalProduccion = 0;
      let costoInsumosTotal = 0;
      let costoManoObraTotal = 0;
      let costoIndirectoTotal = 0;
      
      const lotes = (prod.DetalleLotes || []).map((l: any) => {
        const cantLote = Number(l.cantidad);
        cantidadTotalProduccion += cantLote;

        const insumos = (l.insumos_receta || []).map((i: any) => {
          const cant = Number(i.cantidad_calculada);
          const costo = Number(i.costo_calculado);
          const clave = `${i.insumo} (${i.unidad})`;
          
          costoInsumosTotal += costo;
          insumosProduccion[clave] = (insumosProduccion[clave] || 0) + cant;
          resumenGeneralInsumos[clave] = (resumenGeneralInsumos[clave] || 0) + cant;

          return { ...i, cantidad_calculada: Number(cant.toFixed(3)), costo_calculado: Number(costo.toFixed(2)) };
        });
        return { ...l, cantidad: cantLote, costo_unitario: Number(Number(l.costo_unitario).toFixed(2)), insumos_receta: insumos };
      });

      // Formatear Mano de Obra y calcular total
      const manoObra = (prod.ManoObraTotal || []).map((mo: any) => {
        const costo = Number(mo.costo);
        costoManoObraTotal += costo;
        return {
          empleado: mo.empleado,
          horas: Number(mo.horas),
          costo_mano_obra: Number(costo.toFixed(2)),
          horainicio: mo.horainicio,
          horafin: mo.horafin
        };
      });

      // Formatear Uso de Hornos y calcular total
      const usoHornos = (prod.UsoHornosTotal || []).map((uh: any) => {
        const costo = Number(uh.costo);
        costoIndirectoTotal += costo;
        return {
          horno: uh.horno,
          energia: uh.energia,
          consumo: Number(uh.consumo),
          costo_energia: Number(costo.toFixed(2))
        };
      });

      return {
        ...prod,
        DetalleLotes: lotes,
        ManoObraTotal: manoObra,
        UsoHornosTotal: usoHornos,
        CANTIDAD_TOTAL_PRODUCIDA: cantidadTotalProduccion,
        COSTO_INSUMOS: Number(Number(prod.costoinsumos || 0).toFixed(2)),
        COSTO_MANO_OBRA: Number(Number(prod.costomanobra || 0).toFixed(2)),
        COSTO_INDIRECTO: Number(Number(prod.costoindirecto || 0).toFixed(2)),
        COSTO_TOTAL: Number(Number(prod.costototal || 0).toFixed(2)),
        CONSUMO_TOTAL_PRODUCCION: Object.keys(insumosProduccion).map(k => ({
          insumo_unidad: k,
          cantidad: Number(insumosProduccion[k].toFixed(3))
        }))
      };
    });

    return res.json({
      metadatos: { fechadesde, fechahasta, sucursal: idsucursal || "TODAS" },
      RESUMEN_TOTAL_CONSUMO_PERIODO: Object.keys(resumenGeneralInsumos).map(k => ({
        insumo_unidad: k,
        cantidad_total: Number(resumenGeneralInsumos[k].toFixed(3))
      })),
      producciones: formatted
    });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error interno" });
  }
};
