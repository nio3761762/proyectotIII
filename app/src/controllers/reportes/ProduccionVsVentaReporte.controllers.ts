import { Request, Response } from "express";
import { AppDataSource } from "../../db";

export const getReporteProduccionVsVenta = async (req: Request, res: Response) => {
  try {
    const { fechadesde, fechahasta, idsucursal } = req.query;

    if (!fechadesde || !fechahasta) {
      return res.status(400).json({ message: "Fechas obligatorias (fechadesde, fechahasta)." });
    }

    const params: any[] = [fechadesde, fechahasta];
    let filterIdx = 3;
    let sucursalCondProd = "";
    let sucursalCondVenta = "";
    let sucursalCondRev = "";

    if (idsucursal && idsucursal !== "TODOS") {
      sucursalCondProd = ` AND prod.idsucursal = $${filterIdx}`;
      sucursalCondVenta = ` AND v.idsucursal = $${filterIdx}`;
      sucursalCondRev = ` AND rc.idsucursal = $${filterIdx}`;
      filterIdx++;
      params.push(idsucursal);
    }

    const sqlProduccion = `
      SELECT
        dp.idproducto,
        pr.nombre as producto,
        SUM(CASE WHEN COALESCE(dp.cantidadpresentacion, 0) > 0 THEN dp.cantidadpresentacion ELSE COALESCE(dp.cantidadunidades, 0) END) as cantidad_producida
      FROM detalle_produccion dp
      INNER JOIN produccion prod ON dp.idproduccion = prod.idproduccion
      INNER JOIN producto pr ON dp.idproducto = pr.idproducto
      WHERE prod.fechaproduccion BETWEEN $1 AND $2 AND prod.estado = 1 ${sucursalCondProd}
      GROUP BY dp.idproducto, pr.nombre
      ORDER BY pr.nombre
    `;

    const sqlVenta = `
      SELECT
        COALESCE(pm.idproducto, dv.idproducto) as idproducto,
        COALESCE(pr.nombre, pr2.nombre) as producto,
        SUM(dv.cantidad) as cantidad_vendida,
        SUM(dv.cantidad * dv.precio) as total_venta
      FROM detalleventa dv
      INNER JOIN venta v ON dv.idventa = v.idventa
      LEFT JOIN productomedida pm ON dv.idproductomedida = pm.idproductomedida
      LEFT JOIN producto pr ON pm.idproducto = pr.idproducto
      LEFT JOIN producto pr2 ON dv.idproducto = pr2.idproducto
      WHERE v.fechaventa BETWEEN $1 AND $2 AND v.estado = 1 ${sucursalCondVenta}
        AND dv.idpromocion IS NULL
      GROUP BY COALESCE(pm.idproducto, dv.idproducto), COALESCE(pr.nombre, pr2.nombre)
      ORDER BY COALESCE(pr.nombre, pr2.nombre)
    `;

    const sqlRevendedor = `
      SELECT
        pm.idproducto,
        pr.nombre as producto,
        SUM(rcd.cantidadentregada - rcd.cantidaddevuelta) as cantidad_vendida,
        SUM(((rcd.cantidadentregada - rcd.cantidaddevuelta) * COALESCE(pm.cantidad, 1)) * COALESCE(pm.preciomayor, rcd.precioventa)) as total_venta
      FROM revendedorcontroldetalle rcd
      INNER JOIN revendedorcontrol rc ON rcd.idrevendedorcontrol = rc.idrevendedorcontrol
      INNER JOIN productomedida pm ON rcd.idproductomedida = pm.idproductomedida
      INNER JOIN producto pr ON pm.idproducto = pr.idproducto
      WHERE rc.fecha BETWEEN $1 AND $2 AND rc.estado = 1 ${sucursalCondRev}
      GROUP BY pm.idproducto, pr.nombre
      ORDER BY pr.nombre
    `;

    const sqlProduccionDiario = `
      SELECT
        prod.fechaproduccion as fecha,
        dp.idproducto,
        pr.nombre as producto,
        SUM(CASE WHEN COALESCE(dp.cantidadpresentacion, 0) > 0 THEN dp.cantidadpresentacion ELSE COALESCE(dp.cantidadunidades, 0) END) as cantidad_producida
      FROM detalle_produccion dp
      INNER JOIN produccion prod ON dp.idproduccion = prod.idproduccion
      INNER JOIN producto pr ON dp.idproducto = pr.idproducto
      WHERE prod.fechaproduccion BETWEEN $1 AND $2 AND prod.estado = 1 ${sucursalCondProd}
      GROUP BY prod.fechaproduccion, dp.idproducto, pr.nombre
      ORDER BY prod.fechaproduccion, pr.nombre
    `;

    const sqlVentaDiario = `
      SELECT
        v.fechaventa as fecha,
        COALESCE(pm.idproducto, dv.idproducto) as idproducto,
        COALESCE(pr.nombre, pr2.nombre) as producto,
        SUM(dv.cantidad) as cantidad_vendida,
        SUM(dv.cantidad * dv.precio) as total_venta
      FROM detalleventa dv
      INNER JOIN venta v ON dv.idventa = v.idventa
      LEFT JOIN productomedida pm ON dv.idproductomedida = pm.idproductomedida
      LEFT JOIN producto pr ON pm.idproducto = pr.idproducto
      LEFT JOIN producto pr2 ON dv.idproducto = pr2.idproducto
      WHERE v.fechaventa BETWEEN $1 AND $2 AND v.estado = 1 ${sucursalCondVenta}
        AND dv.idpromocion IS NULL
      GROUP BY v.fechaventa, COALESCE(pm.idproducto, dv.idproducto), COALESCE(pr.nombre, pr2.nombre)
      ORDER BY v.fechaventa, COALESCE(pr.nombre, pr2.nombre)
    `;

    const sqlRevendedorDiario = `
      SELECT
        rc.fecha,
        pm.idproducto,
        pr.nombre as producto,
        SUM(rcd.cantidadentregada - rcd.cantidaddevuelta) as cantidad_vendida,
        SUM(((rcd.cantidadentregada - rcd.cantidaddevuelta) * COALESCE(pm.cantidad, 1)) * COALESCE(pm.preciomayor, rcd.precioventa)) as total_venta
      FROM revendedorcontroldetalle rcd
      INNER JOIN revendedorcontrol rc ON rcd.idrevendedorcontrol = rc.idrevendedorcontrol
      INNER JOIN productomedida pm ON rcd.idproductomedida = pm.idproductomedida
      INNER JOIN producto pr ON pm.idproducto = pr.idproducto
      WHERE rc.fecha BETWEEN $1 AND $2 AND rc.estado = 1 ${sucursalCondRev}
      GROUP BY rc.fecha, pm.idproducto, pr.nombre
      ORDER BY rc.fecha, pr.nombre
    `;

    const sqlProduccionPres = `
      SELECT
        dp.idproducto,
        pr.nombre as producto,
        dp.idproductomedida,
        COALESCE(pm2.idpresentacion, dp.idpresentacion) as idpresentacion,
        CASE WHEN dp.idproductomedida IS NOT NULL THEN COALESCE(pres.nombre, 'S/N') ELSE 'Unidad' END as presentacion,
        SUM(CASE WHEN COALESCE(dp.cantidadpresentacion, 0) > 0 THEN dp.cantidadpresentacion ELSE COALESCE(dp.cantidadunidades, 0) END) as cantidad_producida,
        SUM(CASE WHEN dp.idproductomedida IS NOT NULL THEN dp.cantidadmala / NULLIF(pm2.cantidad, 0) ELSE dp.cantidadmala END) as cantidad_descartada
      FROM detalle_produccion dp
      INNER JOIN produccion prod ON dp.idproduccion = prod.idproduccion
      INNER JOIN producto pr ON dp.idproducto = pr.idproducto
      LEFT JOIN productomedida pm2 ON dp.idproductomedida = pm2.idproductomedida
      LEFT JOIN presentacion pres ON COALESCE(pm2.idpresentacion, dp.idpresentacion) = pres.idpresentacion
      WHERE prod.fechaproduccion BETWEEN $1 AND $2 AND prod.estado = 1 ${sucursalCondProd}
      GROUP BY dp.idproducto, pr.nombre, dp.idproductomedida, COALESCE(pm2.idpresentacion, dp.idpresentacion), CASE WHEN dp.idproductomedida IS NOT NULL THEN COALESCE(pres.nombre, 'S/N') ELSE 'Unidad' END
      ORDER BY pr.nombre, CASE WHEN dp.idproductomedida IS NOT NULL THEN COALESCE(pres.nombre, 'S/N') ELSE 'Unidad' END
    `;

    const sqlVentaPres = `
      SELECT
        COALESCE(pm.idproducto, dv.idproducto) as idproducto,
        COALESCE(pr.nombre, pr2.nombre) as producto,
        dv.idproductomedida,
        CASE WHEN dv.idproductomedida IS NOT NULL THEN COALESCE(pres.nombre, 'S/N') ELSE 'Unidad' END as presentacion,
        SUM(dv.cantidad) as cantidad_vendida,
        SUM(dv.cantidad * dv.precio) as total_venta
      FROM detalleventa dv
      INNER JOIN venta v ON dv.idventa = v.idventa
      LEFT JOIN productomedida pm ON dv.idproductomedida = pm.idproductomedida
      LEFT JOIN producto pr ON pm.idproducto = pr.idproducto
      LEFT JOIN producto pr2 ON dv.idproducto = pr2.idproducto
      LEFT JOIN presentacion pres ON pm.idpresentacion = pres.idpresentacion
      WHERE v.fechaventa BETWEEN $1 AND $2 AND v.estado = 1 ${sucursalCondVenta}
        AND dv.idpromocion IS NULL
      GROUP BY COALESCE(pm.idproducto, dv.idproducto), COALESCE(pr.nombre, pr2.nombre), dv.idproductomedida, CASE WHEN dv.idproductomedida IS NOT NULL THEN COALESCE(pres.nombre, 'S/N') ELSE 'Unidad' END
      ORDER BY COALESCE(pr.nombre, pr2.nombre), CASE WHEN dv.idproductomedida IS NOT NULL THEN COALESCE(pres.nombre, 'S/N') ELSE 'Unidad' END
    `;

    const sqlRevendedorPres = `
      WITH d AS (
        SELECT
          rcd.idrevendedorcontrol,
          rc.gastoextra,
          rcd.idproductomedida,
          pm.idproducto,
          pr.nombre as producto,
          COALESCE(pres.nombre, 'S/N') as presentacion,
          (rcd.cantidadentregada - rcd.cantidaddevuelta) as cantidad_vendida,
          (rcd.cantidadentregada - rcd.cantidaddevuelta) * COALESCE(pm.preciomayor, rcd.precioventa) as total_venta_detalle
        FROM revendedorcontroldetalle rcd
        INNER JOIN revendedorcontrol rc ON rcd.idrevendedorcontrol = rc.idrevendedorcontrol
        INNER JOIN productomedida pm ON rcd.idproductomedida = pm.idproductomedida
        INNER JOIN producto pr ON pm.idproducto = pr.idproducto
        LEFT JOIN presentacion pres ON pm.idpresentacion = pres.idpresentacion
        WHERE rc.fecha BETWEEN $1 AND $2 AND rc.estado = 1 ${sucursalCondRev}
      ),
      ct AS (
        SELECT idrevendedorcontrol, SUM(total_venta_detalle) as total_control
        FROM d GROUP BY idrevendedorcontrol
      )
      SELECT
        d.idproducto,
        d.producto,
        d.idproductomedida,
        d.presentacion,
        SUM(d.cantidad_vendida) as cantidad_vendida,
        SUM(d.total_venta_detalle) as total_venta,
        SUM(COALESCE(d.gastoextra, 0) * d.total_venta_detalle / NULLIF(ct.total_control, 0)) as gasto_extra
      FROM d
      INNER JOIN ct ON d.idrevendedorcontrol = ct.idrevendedorcontrol
      GROUP BY d.idproducto, d.producto, d.idproductomedida, d.presentacion
      ORDER BY d.producto, d.presentacion
    `;

    const sqlGanancias = `
      WITH ingresos AS (
        SELECT SUM(dv.cantidad * dv.precio) as ingreso_tienda
        FROM detalleventa dv
        INNER JOIN venta v ON dv.idventa = v.idventa
        WHERE v.fechaventa BETWEEN $1 AND $2 AND v.estado = 1 ${sucursalCondVenta}
          AND dv.idpromocion IS NULL
      ),
      gastos AS (
        SELECT SUM(COALESCE(v.gastoextra, 0)) as gasto_extra
        FROM venta v
        WHERE v.fechaventa BETWEEN $1 AND $2 AND v.estado = 1 ${sucursalCondVenta}
      )
      SELECT
        (SELECT COALESCE(ingreso_tienda, 0) FROM ingresos) as ingreso_tienda,
        (SELECT COALESCE(gasto_extra, 0) FROM gastos) as gasto_extra
    `;

    const sqlLiquido = `
      WITH precios_agg AS (
        SELECT
          p.idrevendedorcontroldetalle,
          COALESCE(SUM(p.cantidad), 0) as total_cantidad_ajustada,
          COALESCE(SUM(p.cantidad * p.precioventa), 0) as total_venta_ajustada
        FROM revendedorcontrolprecio p
        WHERE (p.estado IS NULL OR p.estado != 'NORMAL')
        GROUP BY p.idrevendedorcontroldetalle
      ),
      gastos_rev AS (
        SELECT SUM(COALESCE(rc.gastoextra, 0)) as gasto_extra_revendedor
        FROM revendedorcontrol rc
        WHERE rc.fecha BETWEEN $1 AND $2 AND rc.estado = 1 ${sucursalCondRev}
      )
      SELECT COALESCE(SUM(
        ((d.cantidadentregada - d.cantidaddevuelta - COALESCE(pa.total_cantidad_ajustada, 0)) * d.precioventa) +
        COALESCE(pa.total_venta_ajustada, 0) -
        (GREATEST(0, (d.cantidadentregada - d.cantidaddevuelta) - COALESCE(d.cantidadsincomision, 0)) * COALESCE(d.comisionunitaria, 0))
      ), 0) as liquido_revendedor,
      (SELECT COALESCE(gasto_extra_revendedor, 0) FROM gastos_rev) as gasto_extra_revendedor
      FROM revendedorcontroldetalle d
      INNER JOIN revendedorcontrol rc ON rc.idrevendedorcontrol = d.idrevendedorcontrol
      LEFT JOIN precios_agg pa ON pa.idrevendedorcontroldetalle = d.idrevendedorcontroldetalle
      WHERE rc.fecha BETWEEN $1 AND $2 AND rc.estado = 1 ${sucursalCondRev}
    `;

    // ====== Consultas por TURNO (día comercial 12pm -> 12pm) ======
    // Regla: si la hora de registro es >= 12:00 (tarde) el registro pertenece al día siguiente (dia_comercial + 1).
    //        si la hora es < 12:00 (mañana) pertenece al mismo día calendario.
    const sqlTurnosProd = `
      SELECT
        prod.fechaproduccion as dia_comercial,
        CASE WHEN COALESCE(prod.horainicio, '00:00') >= '12:00' THEN 'tarde' ELSE 'manana' END as turno,
        dp.idproducto,
        pr.nombre as producto,
        dp.idproductomedida,
        COALESCE(pm2.idpresentacion, dp.idpresentacion) as idpresentacion,
CASE WHEN dp.idproductomedida IS NOT NULL THEN COALESCE(pres.nombre, 'S/N') ELSE 'Unidad' END as presentacion,
        COALESCE(pm2.cantidad, 1) as presentacion_factor,
        SUM(CASE WHEN COALESCE(dp.cantidadpresentacion, 0) > 0 THEN dp.cantidadpresentacion ELSE COALESCE(dp.cantidadunidades, 0) END) as cantidad_producida
      FROM detalle_produccion dp
      INNER JOIN produccion prod ON dp.idproduccion = prod.idproduccion
      INNER JOIN producto pr ON dp.idproducto = pr.idproducto
      LEFT JOIN productomedida pm2 ON dp.idproductomedida = pm2.idproductomedida
      LEFT JOIN presentacion pres ON COALESCE(pm2.idpresentacion, dp.idpresentacion) = pres.idpresentacion
      WHERE prod.fechaproduccion BETWEEN $1 AND $2 AND prod.estado = 1 ${sucursalCondProd}
      GROUP BY dia_comercial, turno, dp.idproducto, pr.nombre, dp.idproductomedida, COALESCE(pm2.cantidad, 1), COALESCE(pm2.idpresentacion, dp.idpresentacion), CASE WHEN dp.idproductomedida IS NOT NULL THEN COALESCE(pres.nombre, 'S/N') ELSE 'Unidad' END
      ORDER BY dia_comercial, turno, pr.nombre, CASE WHEN dp.idproductomedida IS NOT NULL THEN COALESCE(pres.nombre, 'S/N') ELSE 'Unidad' END
    `;

    const sqlTurnosVenta = `
      SELECT
        v.fechaventa as dia_comercial,
        CASE WHEN COALESCE(v.horaventa, '00:00') >= '12:00' THEN 'tarde' ELSE 'manana' END as turno,
        COALESCE(pm.idproducto, dv.idproducto) as idproducto,
        COALESCE(pr.nombre, pr2.nombre) as producto,
        dv.idproductomedida,
        CASE WHEN dv.idproductomedida IS NOT NULL THEN COALESCE(pres.nombre, 'S/N') ELSE 'Unidad' END as presentacion,
        COALESCE(pm.cantidad, 1) as presentacion_factor,
        SUM(dv.cantidad) as cantidad_vendida,
        SUM(dv.cantidad * dv.precio) as total_venta
      FROM detalleventa dv
      INNER JOIN venta v ON dv.idventa = v.idventa
      LEFT JOIN productomedida pm ON dv.idproductomedida = pm.idproductomedida
      LEFT JOIN producto pr ON pm.idproducto = pr.idproducto
      LEFT JOIN producto pr2 ON dv.idproducto = pr2.idproducto
      LEFT JOIN presentacion pres ON pm.idpresentacion = pres.idpresentacion
      WHERE v.fechaventa BETWEEN $1 AND $2 AND v.estado = 1 ${sucursalCondVenta}
        AND dv.idpromocion IS NULL
      GROUP BY dia_comercial, turno, COALESCE(pm.idproducto, dv.idproducto), COALESCE(pr.nombre, pr2.nombre), dv.idproductomedida, COALESCE(pm.cantidad, 1), CASE WHEN dv.idproductomedida IS NOT NULL THEN COALESCE(pres.nombre, 'S/N') ELSE 'Unidad' END
      ORDER BY dia_comercial, turno, COALESCE(pr.nombre, pr2.nombre), CASE WHEN dv.idproductomedida IS NOT NULL THEN COALESCE(pres.nombre, 'S/N') ELSE 'Unidad' END
    `;

    const sqlTurnosRev = `
      SELECT
        rc.fecha as dia_comercial,
        CASE WHEN COALESCE(rc.hora, '00:00') >= '12:00' THEN 'tarde' ELSE 'manana' END as turno,
        pm.idproducto,
        pr.nombre as producto,
        rcd.idproductomedida,
        COALESCE(pres.nombre, 'S/N') as presentacion,
        COALESCE(pm.cantidad, 1) as presentacion_factor,
        SUM(rcd.cantidadentregada - rcd.cantidaddevuelta) as cantidad_vendida,
        SUM(((rcd.cantidadentregada - rcd.cantidaddevuelta) * COALESCE(pm.cantidad, 1)) * COALESCE(pm.preciomayor, rcd.precioventa)) as total_venta
      FROM revendedorcontroldetalle rcd
      INNER JOIN revendedorcontrol rc ON rcd.idrevendedorcontrol = rc.idrevendedorcontrol
      INNER JOIN productomedida pm ON rcd.idproductomedida = pm.idproductomedida
      INNER JOIN producto pr ON pm.idproducto = pr.idproducto
      LEFT JOIN presentacion pres ON pm.idpresentacion = pres.idpresentacion
      WHERE rc.fecha BETWEEN $1 AND $2 AND rc.estado = 1 ${sucursalCondRev}
      GROUP BY dia_comercial, turno, pm.idproducto, pr.nombre, rcd.idproductomedida, COALESCE(pm.cantidad, 1), COALESCE(pres.nombre, 'S/N')
      ORDER BY dia_comercial, turno, pr.nombre, COALESCE(pres.nombre, 'S/N')
    `;

    const [produccion, venta, revendedor, prodDiario, ventaDiario, revDiario, produccionPres, ventaPres, revendedorPres, gananciasRes, liquidoRes, turnosProd, turnosVenta, turnosRev] = await Promise.all([
      AppDataSource.query(sqlProduccion, params),
      AppDataSource.query(sqlVenta, params),
      AppDataSource.query(sqlRevendedor, params),
      AppDataSource.query(sqlProduccionDiario, params),
      AppDataSource.query(sqlVentaDiario, params),
      AppDataSource.query(sqlRevendedorDiario, params),
      AppDataSource.query(sqlProduccionPres, params),
      AppDataSource.query(sqlVentaPres, params),
      AppDataSource.query(sqlRevendedorPres, params),
      AppDataSource.query(sqlGanancias, params),
      AppDataSource.query(sqlLiquido, params),
      AppDataSource.query(sqlTurnosProd, params),
      AppDataSource.query(sqlTurnosVenta, params),
      AppDataSource.query(sqlTurnosRev, params)
    ]);

    const prodMap = new Map<string, any>();
    for (const row of produccion as any[]) {
      prodMap.set(row.idproducto, {
        idproducto: row.idproducto,
        producto: row.producto,
        cantidad_producida: Number(row.cantidad_producida) || 0
      });
    }

    const ventaMap = new Map<string, any>();
    for (const row of venta as any[]) {
      ventaMap.set(row.idproducto, {
        cantidad_vendida_tienda: Number(row.cantidad_vendida) || 0,
        total_venta_tienda: Number(row.total_venta) || 0
      });
    }

    const revMap = new Map<string, any>();
    for (const row of revendedor as any[]) {
      revMap.set(row.idproducto, {
        cantidad_vendida_revendedor: Number(row.cantidad_vendida) || 0,
        total_venta_revendedor: Number(row.total_venta) || 0
      });
    }

    const allProductIds = new Set<string>();
    for (const row of produccion as any[]) allProductIds.add(row.idproducto);
    for (const row of venta as any[]) allProductIds.add(row.idproducto);
    for (const row of revendedor as any[]) allProductIds.add(row.idproducto);

    const detalle: any[] = [];
    let totalProducido = 0;
    let totalVendidoTienda = 0;
    let totalVendidoRevendedor = 0;

    for (const id of allProductIds) {
      const p = prodMap.get(id) || { idproducto: id, producto: "", cantidad_producida: 0 };
      const v = ventaMap.get(id) || { cantidad_vendida_tienda: 0, total_venta_tienda: 0 };
      const r = revMap.get(id) || { cantidad_vendida_revendedor: 0, total_venta_revendedor: 0 };

      if (!p.producto) {
        const ventaRow = venta.find((r: any) => r.idproducto === id);
        const revRow = revendedor.find((r: any) => r.idproducto === id);
        p.producto = ventaRow?.producto || revRow?.producto || "Sin nombre";
      }

      const prodCant = p.cantidad_producida;
      const ventaCant = v.cantidad_vendida_tienda;
      const revCant = r.cantidad_vendida_revendedor;
      const totalVendido = ventaCant + revCant;
      const diferencia = prodCant - totalVendido;

      totalProducido += prodCant;
      totalVendidoTienda += ventaCant;
      totalVendidoRevendedor += revCant;

      detalle.push({
        idproducto: id,
        producto: p.producto,
        cantidad_producida: prodCant,
        cantidad_vendida_tienda: ventaCant,
        total_venta_tienda: v.total_venta_tienda,
        cantidad_vendida_revendedor: revCant,
        total_venta_revendedor: r.total_venta_revendedor,
        cantidad_vendida_total: totalVendido,
        diferencia: diferencia
      });
    }

    detalle.sort((a, b) => b.cantidad_producida - a.cantidad_producida);

    const prodDiarioMap = new Map<string, Map<string, any>>();
    const nombreProductos = new Map<string, string>();
    for (const row of prodDiario as any[]) {
      const fecha = row.fecha instanceof Date ? row.fecha.toISOString().split('T')[0] : String(row.fecha).split('T')[0];
      if (!prodDiarioMap.has(fecha)) prodDiarioMap.set(fecha, new Map());
      prodDiarioMap.get(fecha)!.set(String(row.idproducto), {
        cantidad_producida: Number(row.cantidad_producida) || 0
      });
      if (!nombreProductos.has(String(row.idproducto))) nombreProductos.set(String(row.idproducto), row.producto);
    }

    const ventaDiarioMap = new Map<string, Map<string, any>>();
    for (const row of ventaDiario as any[]) {
      const fecha = row.fecha instanceof Date ? row.fecha.toISOString().split('T')[0] : String(row.fecha).split('T')[0];
      if (!ventaDiarioMap.has(fecha)) ventaDiarioMap.set(fecha, new Map());
      ventaDiarioMap.get(fecha)!.set(String(row.idproducto), {
        cantidad_vendida: Number(row.cantidad_vendida) || 0,
        total_venta: Number(row.total_venta) || 0
      });
      if (!nombreProductos.has(String(row.idproducto))) nombreProductos.set(String(row.idproducto), row.producto);
    }

    const revDiarioMap = new Map<string, Map<string, any>>();
    for (const row of revDiario as any[]) {
      const fecha = row.fecha instanceof Date ? row.fecha.toISOString().split('T')[0] : String(row.fecha).split('T')[0];
      if (!revDiarioMap.has(fecha)) revDiarioMap.set(fecha, new Map());
      revDiarioMap.get(fecha)!.set(String(row.idproducto), {
        cantidad_vendida: Number(row.cantidad_vendida) || 0,
        total_venta: Number(row.total_venta) || 0
      });
      if (!nombreProductos.has(String(row.idproducto))) nombreProductos.set(String(row.idproducto), row.producto);
    }

    const allDates = new Set<string>();
    for (const key of prodDiarioMap.keys()) allDates.add(key);
    for (const key of ventaDiarioMap.keys()) allDates.add(key);
    for (const key of revDiarioMap.keys()) allDates.add(key);

    const detalleDiario: any[] = [];
    for (const fecha of [...allDates].sort()) {
      const prodDay = prodDiarioMap.get(fecha) || new Map();
      const ventaDay = ventaDiarioMap.get(fecha) || new Map();
      const revDay = revDiarioMap.get(fecha) || new Map();

      const allProdIds = new Set<string>();
      for (const id of prodDay.keys()) allProdIds.add(id);
      for (const id of ventaDay.keys()) allProdIds.add(id);
      for (const id of revDay.keys()) allProdIds.add(id);

      const productos: any[] = [];
      let totalProd = 0, totalVend = 0;

      for (const id of allProdIds) {
        const p = prodDay.get(id) || { cantidad_producida: 0 };
        const v = ventaDay.get(id) || { cantidad_vendida: 0, total_venta: 0 };
        const r = revDay.get(id) || { cantidad_vendida: 0, total_venta: 0 };

        const nombre = nombreProductos.get(id) || "Sin nombre";
        const prodCant = p.cantidad_producida;
        const vendCant = v.cantidad_vendida + r.cantidad_vendida;
        totalProd += prodCant;
        totalVend += vendCant;

        productos.push({
          idproducto: id,
          producto: nombre,
          cantidad_producida: prodCant,
          cantidad_vendida_tienda: v.cantidad_vendida,
          total_venta_tienda: v.total_venta,
          cantidad_vendida_revendedor: r.cantidad_vendida,
          total_venta_revendedor: r.total_venta,
          cantidad_vendida_total: vendCant,
          diferencia: prodCant - vendCant
        });
      }

      productos.sort((a, b) => b.cantidad_producida - a.cantidad_producida);
      detalleDiario.push({ fecha, productos, total_producido: totalProd, total_vendido: totalVend });
    }

    // ====== Agregación por TURNO (detalleTurnos) ======
    // Estructura: dia_comercial -> turno ('manana'|'tarde') -> idproducto -> fila.
    // Se agrupa por idproducto (la clave NO incluye el nombre de presentación)
    // para que producción, venta y control de revendedor del MISMO producto
    // queden en la misma fila aunque uno se registró "Unidad"/"S/N" y otro con
    // presentación, eliminando filas repetidas sin sentido y negativos falsos.
    const turnoProdMap = new Map<string, Map<string, any>>();
    const turnoVentaMap = new Map<string, Map<string, any>>();
    const turnoRevMap = new Map<string, Map<string, any>>();

    const normDia = (v: any) => {
      const d = v instanceof Date ? v : new Date(String(v).split('T')[0] + 'T12:00:00');
      return isNaN(d.getTime()) ? String(v) : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const presUnidad = (pres: any) => {
      const p = String(pres || "").trim();
      return (p === "Unidad" || p === "S/N" || p === "");
    };

    const ensureTurno = (map: Map<string, Map<string, any>>, dia: string, turno: string, id: string, row: any) => {
      let turnos = map.get(dia);
      if (!turnos) { turnos = new Map(); map.set(dia, turnos); }
      let prods = turnos.get(turno);
      if (!prods) { prods = new Map(); turnos.set(turno, prods); }
      let r = prods.get(id);
      if (!r) {
        r = { idproducto: row.idproducto, producto: "", presentacion: row.presentacion || "Unidad", esUnidad: presUnidad(row.presentacion), presentacion_factor: 1, cantidad_producida: 0, cantidad_vendida_tienda: 0, total_venta_tienda: 0, cantidad_vendida_revendedor: 0, total_venta_revendedor: 0 };
        prods.set(id, r);
      }
      return r;
    };

    const mergeMeta = (r: any, row: any) => {
      if (row.producto && !r.producto) r.producto = row.producto;
      const pres = String(row.presentacion || "").trim();
      if (pres && !presUnidad(pres)) r.presentacion = pres;
      if (!presUnidad(r.presentacion)) r.esUnidad = false;
      r.presentacion_factor = Math.max(Number(r.presentacion_factor) || 1, Number(row.presentacion_factor) || 1);
    };

    for (const row of turnosProd as any[]) {
      const dia = normDia(row.dia_comercial);
      const id = String(row.idproducto) + '::' + (presUnidad(row.presentacion) ? '__unidad__' : String(row.presentacion).trim());
      const r = ensureTurno(turnoProdMap, dia, row.turno, id, row);
      r.cantidad_producida += Number(row.cantidad_producida) || 0;
      mergeMeta(r, row);
    }
    for (const row of turnosVenta as any[]) {
      const dia = normDia(row.dia_comercial);
      const id = String(row.idproducto) + '::' + (presUnidad(row.presentacion) ? '__unidad__' : String(row.presentacion).trim());
      const r = ensureTurno(turnoVentaMap, dia, row.turno, id, row);
      r.cantidad_vendida_tienda += Number(row.cantidad_vendida) || 0;
      r.total_venta_tienda += Number(row.total_venta) || 0;
      mergeMeta(r, row);
    }
    for (const row of turnosRev as any[]) {
      const dia = normDia(row.dia_comercial);
      const id = String(row.idproducto) + '::' + (presUnidad(row.presentacion) ? '__unidad__' : String(row.presentacion).trim());
      const r = ensureTurno(turnoRevMap, dia, row.turno, id, row);
      r.cantidad_vendida_revendedor += Number(row.cantidad_vendida) || 0;
      r.total_venta_revendedor += Number(row.total_venta) || 0;
      mergeMeta(r, row);
    }

    const turnoDias = new Set<string>([...turnoProdMap.keys(), ...turnoVentaMap.keys(), ...turnoRevMap.keys()]);

    const detalleTurnos: any[] = [];
    for (const dia of [...turnoDias].sort()) {
      const turnos: any = { manana: { productos: [], total_producido: 0, total_vendido: 0 }, tarde: { productos: [], total_producido: 0, total_vendido: 0 } };
      let totalProdDia = 0, totalVendDia = 0;

      for (const turno of ['manana', 'tarde']) {
        const prodTurno: any = turnoProdMap.get(dia)?.get(turno) || new Map<string, any>();
        const ventaTurno: any = turnoVentaMap.get(dia)?.get(turno) || new Map<string, any>();
        const revTurno: any = turnoRevMap.get(dia)?.get(turno) || new Map<string, any>();
        const ids = new Set<string>([...prodTurno.keys(), ...ventaTurno.keys(), ...revTurno.keys()]);

        let totalProd = 0, totalVend = 0;
        const productos: any[] = [];
        for (const id of ids) {
          const p = prodTurno.get(id);
          const vt = ventaTurno.get(id);
          const rv = revTurno.get(id);
          const base = p || vt || rv;
          if (!base) continue;
          const prodCant = Number((p && p.cantidad_producida) || 0);
          const cantTienda = Number((vt && vt.cantidad_vendida_tienda) || 0);
          const ingTienda = Number((vt && vt.total_venta_tienda) || 0);
          const cantRev = Number((rv && rv.cantidad_vendida_revendedor) || 0);
          const ingRev = Number((rv && rv.total_venta_revendedor) || 0);
          const vendCant = cantTienda + cantRev;
          if (prodCant === 0 && vendCant === 0 && ingTienda === 0 && ingRev === 0) continue;
          const factor = Number(base.presentacion_factor) || 1;
          const esUnidad = base.esUnidad && presUnidad(base.presentacion || "Unidad");
          let pres = base.presentacion || "Unidad";
          if ((pres === "Unidad" || pres === "S/N" || pres === "") && factor > 1) pres = String(factor);
          totalProd += prodCant;
          totalVend += vendCant;
          productos.push({
            idproducto: base.idproducto,
            producto: base.producto || "Sin nombre",
            presentacion: pres,
            presentacion_factor: factor,
            esUnidad,
            cantidad_producida: prodCant,
            cantidad_vendida_tienda: cantTienda,
            total_venta_tienda: ingTienda,
            cantidad_vendida_revendedor: cantRev,
            total_venta_revendedor: ingRev,
            cantidad_vendida_total: vendCant,
            consumida: false,
            diferencia: prodCant - vendCant
          });
        }
        productos.sort((a, b) => b.cantidad_producida - a.cantidad_producida);
        turnos[turno].productos = productos;
        turnos[turno].total_producido = totalProd;
        turnos[turno].total_vendido = totalVend;
        totalProdDia += totalProd;
        totalVendDia += totalVend;
      }

      detalleTurnos.push({
        fecha: dia,
        turnos,
        total_producido: totalProdDia,
        total_vendido: totalVendDia
      });
    }

    // Asegura que aparezcan TODOS los días del rango (calendario), aunque no tengan datos.
    const toDiaStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const normRango = (v: any) => {
      const s = String(v || "").split('T')[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
      const dd = new Date(s + 'T12:00:00');
      return isNaN(dd.getTime()) ? null : toDiaStr(dd);
    };
    const d0 = normRango(fechadesde);
    const d1 = normRango(fechahasta);
    const porDia = new Map<string, any>(detalleTurnos.map(d => [d.fecha, d]));
    if (d0 && d1) {
      const cur = new Date(d0 + 'T12:00:00');
      const fin = new Date(d1 + 'T12:00:00');
      while (cur.getTime() <= fin.getTime()) {
        const f = toDiaStr(cur);
        if (!porDia.has(f)) porDia.set(f, { fecha: f, turnos: { manana: { productos: [], total_producido: 0, total_vendido: 0 }, tarde: { productos: [], total_producido: 0, total_vendido: 0 } }, total_producido: 0, total_vendido: 0 });
        cur.setDate(cur.getDate() + 1);
      }
      detalleTurnos.length = 0;
      detalleTurnos.push(...Array.from(porDia.values()));
    }
    detalleTurnos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    const presKey = (row: any) => `prod:${row.idproducto || ""}:${row.presentacion || "S/N"}`;

    const presMeta = new Map<string, any>();
    const presProdMap = new Map<string, any>();
    const presVentaMap = new Map<string, any>();
    const presRevMap = new Map<string, any>();

    for (const row of produccionPres as any[]) {
      const key = presKey(row);
      if (!presMeta.has(key)) presMeta.set(key, {
        idproductomedida: row.idproductomedida || null,
        idproducto: row.idproducto,
        producto: row.producto || "Sin nombre",
        presentacion: row.presentacion || "S/N"
      });
      const prev = presProdMap.get(key) || { cantidad_producida: 0, cantidad_descartada: 0 };
      prev.cantidad_producida += Number(row.cantidad_producida) || 0;
      prev.cantidad_descartada += Number(row.cantidad_descartada) || 0;
      presProdMap.set(key, prev);
    }

    for (const row of ventaPres as any[]) {
      const key = presKey(row);
      if (!presMeta.has(key)) presMeta.set(key, {
        idproductomedida: row.idproductomedida || null,
        idproducto: row.idproducto,
        producto: row.producto || "Sin nombre",
        presentacion: row.presentacion || "S/N"
      });
      const prev = presVentaMap.get(key) || { cantidad_vendida: 0, total_venta: 0 };
      prev.cantidad_vendida += Number(row.cantidad_vendida) || 0;
      prev.total_venta += Number(row.total_venta) || 0;
      presVentaMap.set(key, prev);
    }

    for (const row of revendedorPres as any[]) {
      const key = presKey(row);
      if (!presMeta.has(key)) presMeta.set(key, {
        idproductomedida: row.idproductomedida || null,
        idproducto: row.idproducto,
        producto: row.producto || "Sin nombre",
        presentacion: row.presentacion || "S/N"
      });
      const prev = presRevMap.get(key) || { cantidad_vendida: 0, total_venta: 0, gasto_extra: 0 };
      prev.cantidad_vendida += Number(row.cantidad_vendida) || 0;
      prev.total_venta += Number(row.total_venta) || 0;
      prev.gasto_extra += Number(row.gasto_extra) || 0;
      presRevMap.set(key, prev);
    }

    const presKeys = new Set<string>([...presProdMap.keys(), ...presVentaMap.keys(), ...presRevMap.keys()]);

    const porPresentacion: any[] = [];
    let totProd = 0, totDescarte = 0, totVendTienda = 0, totIngresoTienda = 0, totVendRev = 0, totVentaRev = 0, totVentaTotal = 0, totGastoExtraRev = 0;

    for (const key of presKeys) {
      const meta = presMeta.get(key) || { idproductomedida: null, idproducto: "", producto: "Sin nombre", presentacion: "S/N" };
      const p = presProdMap.get(key) || { cantidad_producida: 0, cantidad_descartada: 0 };
      const v = presVentaMap.get(key) || { cantidad_vendida: 0, total_venta: 0 };
      const r = presRevMap.get(key) || { cantidad_vendida: 0, total_venta: 0, gasto_extra: 0 };

      const prodCant = p.cantidad_producida;
      const descCant = p.cantidad_descartada;
      const vendTienda = v.cantidad_vendida;
      const ingTienda = v.total_venta;
      const vendRev = r.cantidad_vendida;
      const ventaRev = r.total_venta;
      const gastoExtraRev = r.gasto_extra;
      const totalVendido = vendTienda + vendRev;
      const totalVenta = ingTienda + ventaRev;
      const diferencia = prodCant - totalVendido;

      totProd += prodCant;
      totDescarte += descCant;
      totVendTienda += vendTienda;
      totIngresoTienda += ingTienda;
      totVendRev += vendRev;
      totVentaRev += ventaRev;
      totVentaTotal += totalVenta;
      totGastoExtraRev += gastoExtraRev;

      porPresentacion.push({
        idproductomedida: meta.idproductomedida,
        idproducto: meta.idproducto,
        producto: meta.producto,
        presentacion: meta.presentacion,
        cantidad_producida: prodCant,
        cantidad_descartada: descCant,
        cantidad_vendida_tienda: vendTienda,
        total_venta_tienda: ingTienda,
        cantidad_vendida_revendedor: vendRev,
        total_venta_revendedor: ventaRev,
        gasto_extra_revendedor: gastoExtraRev,
        total_venta: totalVenta,
        cantidad_vendida_total: totalVendido,
        diferencia: diferencia
      });
    }

    porPresentacion.sort((a, b) => b.cantidad_producida - a.cantidad_producida);

    const gRow = (gananciasRes as any[])[0] || {};
    const lRow = (liquidoRes as any[])[0] || {};
    const ingreso_tienda = Number(gRow.ingreso_tienda) || 0;
    const gasto_extra_tienda = Number(gRow.gasto_extra) || 0;
    const liquido_revendedor = Number(lRow.liquido_revendedor) || 0;
    const gasto_extra_revendedor = Number(lRow.gasto_extra_revendedor) || 0;
    const neto_tienda = ingreso_tienda - gasto_extra_tienda;
    const neto_revendedor = liquido_revendedor - gasto_extra_revendedor;
    const gasto_extra_total = gasto_extra_tienda + gasto_extra_revendedor;
    const ganancia_total = neto_tienda + neto_revendedor;

    const ganancias = {
      ingreso_tienda: ingreso_tienda,
      gasto_extra: gasto_extra_tienda,
      neto_tienda: neto_tienda,
      liquido_revendedor: liquido_revendedor,
      gasto_extra_revendedor: gasto_extra_revendedor,
      neto_revendedor: neto_revendedor,
      gasto_extra_total: gasto_extra_total,
      balance: ganancia_total,
      ganancia_total: ganancia_total
    };

    return res.json({
      metadatos: { desde: fechadesde, hasta: fechahasta, sucursal: idsucursal || "TODAS" },
      detalle: detalle,
      detalleDiario: detalleDiario,
      detalleTurnos: detalleTurnos,
      porPresentacion: porPresentacion,
      ganancias: ganancias,
      resumen: {
        total_producido: totalProducido,
        total_vendido_tienda: totalVendidoTienda,
        total_vendido_revendedor: totalVendidoRevendedor,
        total_vendido: totalVendidoTienda + totalVendidoRevendedor,
        diferencia_total: totalProducido - (totalVendidoTienda + totalVendidoRevendedor)
      },
      resumenPorPresentacion: {
        total_producido: totProd,
        total_descartado: totDescarte,
        total_vendido_tienda: totVendTienda,
        total_ingreso_tienda: totIngresoTienda,
        total_vendido_revendedor: totVendRev,
        total_venta_revendedor: totVentaRev,
        total_gasto_extra_revendedor: totGastoExtraRev,
        total_venta: totVentaTotal,
        total_vendido: totVendTienda + totVendRev,
        diferencia_total: totProd - (totVendTienda + totVendRev)
      }
    });

  } catch (error) {
    console.error("Error en reporte producción vs venta:", error);
    return res.status(500).json({ message: "Error al generar el reporte." });
  }
};
