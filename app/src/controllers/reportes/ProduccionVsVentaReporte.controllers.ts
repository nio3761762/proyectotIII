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
        SUM(dp.cantidad) as cantidad_producida
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
        SUM(dv.cantidad * COALESCE(pm.cantidad, 1)) as cantidad_vendida,
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
        SUM((rcd.cantidadentregada - rcd.cantidaddevuelta) * COALESCE(pm.cantidad, 1)) as cantidad_vendida,
        SUM(((rcd.cantidadentregada - rcd.cantidaddevuelta) * COALESCE(pm.cantidad, 1)) * rcd.precioventa) as total_venta
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
        SUM(dp.cantidad) as cantidad_producida
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
        SUM(dv.cantidad * COALESCE(pm.cantidad, 1)) as cantidad_vendida,
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
        SUM((rcd.cantidadentregada - rcd.cantidaddevuelta) * COALESCE(pm.cantidad, 1)) as cantidad_vendida,
        SUM(((rcd.cantidadentregada - rcd.cantidaddevuelta) * COALESCE(pm.cantidad, 1)) * rcd.precioventa) as total_venta
      FROM revendedorcontroldetalle rcd
      INNER JOIN revendedorcontrol rc ON rcd.idrevendedorcontrol = rc.idrevendedorcontrol
      INNER JOIN productomedida pm ON rcd.idproductomedida = pm.idproductomedida
      INNER JOIN producto pr ON pm.idproducto = pr.idproducto
      WHERE rc.fecha BETWEEN $1 AND $2 AND rc.estado = 1 ${sucursalCondRev}
      GROUP BY rc.fecha, pm.idproducto, pr.nombre
      ORDER BY rc.fecha, pr.nombre
    `;

    const [produccion, venta, revendedor, prodDiario, ventaDiario, revDiario] = await Promise.all([
      AppDataSource.query(sqlProduccion, params),
      AppDataSource.query(sqlVenta, params),
      AppDataSource.query(sqlRevendedor, params),
      AppDataSource.query(sqlProduccionDiario, params),
      AppDataSource.query(sqlVentaDiario, params),
      AppDataSource.query(sqlRevendedorDiario, params)
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

    return res.json({
      metadatos: { desde: fechadesde, hasta: fechahasta, sucursal: idsucursal || "TODAS" },
      detalle: detalle,
      detalleDiario: detalleDiario,
      resumen: {
        total_producido: totalProducido,
        total_vendido_tienda: totalVendidoTienda,
        total_vendido_revendedor: totalVendidoRevendedor,
        total_vendido: totalVendidoTienda + totalVendidoRevendedor,
        diferencia_total: totalProducido - (totalVendidoTienda + totalVendidoRevendedor)
      }
    });

  } catch (error) {
    console.error("Error en reporte producción vs venta:", error);
    return res.status(500).json({ message: "Error al generar el reporte." });
  }
};
