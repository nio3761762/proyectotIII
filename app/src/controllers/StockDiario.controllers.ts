import { Request, Response } from "express";
import { AppDataSource } from "../db";
import { StockDiario } from "../entities/StockDiario";
import { generarIdSecuencial } from "../utils/idGenerator";

const presUnidad = (pres: any) => {
  const p = String(pres || "").trim();
  return p === "Unidad" || p === "S/N" || p === "";
};

const normDia = (v: any) => {
  const d = v instanceof Date ? v : new Date(String(v).split("T")[0] + "T12:00:00");
  if (isNaN(d.getTime())) return String(v).split("T")[0];
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const sqlTurnosProd = (sucursalCond: string) => `
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
    SUM(CASE WHEN COALESCE(dp.cantidadpresentacion, 0) > 0 THEN dp.cantidadpresentacion ELSE COALESCE(dp.cantidadunidades, 0) END) as cantidad_producida,
    SUM(CASE WHEN dp.idproductomedida IS NOT NULL THEN dp.cantidadmala / NULLIF(pm2.cantidad, 0) ELSE dp.cantidadmala END) as cantidad_descartada
  FROM detalle_produccion dp
  INNER JOIN produccion prod ON dp.idproduccion = prod.idproduccion
  INNER JOIN producto pr ON dp.idproducto = pr.idproducto
  LEFT JOIN productomedida pm2 ON dp.idproductomedida = pm2.idproductomedida
  LEFT JOIN presentacion pres ON COALESCE(pm2.idpresentacion, dp.idpresentacion) = pres.idpresentacion
  WHERE prod.fechaproduccion BETWEEN $1 AND $2 AND prod.estado = 1 ${sucursalCond}
  GROUP BY dia_comercial, turno, dp.idproducto, pr.nombre, dp.idproductomedida, COALESCE(pm2.cantidad, 1), COALESCE(pm2.idpresentacion, dp.idpresentacion), CASE WHEN dp.idproductomedida IS NOT NULL THEN COALESCE(pres.nombre, 'S/N') ELSE 'Unidad' END, COALESCE(pres.abreviatura, '')
  ORDER BY dia_comercial, turno, pr.nombre, CASE WHEN dp.idproductomedida IS NOT NULL THEN COALESCE(pres.nombre, 'S/N') ELSE 'Unidad' END
`;

const sqlTurnosVenta = (sucursalCond: string) => `
  SELECT
    v.fechaventa as dia_comercial,
    CASE WHEN COALESCE(v.horaventa, '00:00') >= '12:00' THEN 'tarde' ELSE 'manana' END as turno,
    COALESCE(pm.idproducto, dv.idproducto) as idproducto,
    COALESCE(pr.nombre, pr2.nombre) as producto,
    dv.idproductomedida,
    CASE WHEN dv.idproductomedida IS NOT NULL THEN COALESCE(pres.nombre, 'S/N') ELSE 'Unidad' END as presentacion,
    COALESCE(pres.abreviatura, '') as abreviatura,
    COALESCE(pm.cantidad, 1) as presentacion_factor,
    SUM(dv.cantidad) as cantidad_vendida,
    SUM(dv.cantidad * dv.precio) as total_venta
  FROM detalleventa dv
  INNER JOIN venta v ON dv.idventa = v.idventa
  LEFT JOIN productomedida pm ON dv.idproductomedida = pm.idproductomedida
  LEFT JOIN producto pr ON pm.idproducto = pr.idproducto
  LEFT JOIN producto pr2 ON dv.idproducto = pr2.idproducto
  LEFT JOIN presentacion pres ON pm.idpresentacion = pres.idpresentacion
  WHERE v.fechaventa BETWEEN $1 AND $2 AND v.estado = 1 ${sucursalCond}
    AND dv.idpromocion IS NULL
  GROUP BY dia_comercial, turno, COALESCE(pm.idproducto, dv.idproducto), COALESCE(pr.nombre, pr2.nombre), dv.idproductomedida, COALESCE(pm.cantidad, 1), CASE WHEN dv.idproductomedida IS NOT NULL THEN COALESCE(pres.nombre, 'S/N') ELSE 'Unidad' END, COALESCE(pres.abreviatura, '')
  ORDER BY dia_comercial, turno, COALESCE(pr.nombre, pr2.nombre), CASE WHEN dv.idproductomedida IS NOT NULL THEN COALESCE(pres.nombre, 'S/N') ELSE 'Unidad' END
`;

const sqlTurnosRev = (sucursalCond: string) => `
  SELECT
    rc.fecha as dia_comercial,
    CASE WHEN COALESCE(rc.hora, '00:00') >= '12:00' THEN 'tarde' ELSE 'manana' END as turno,
    pm.idproducto,
    pr.nombre as producto,
    rcd.idproductomedida,
    COALESCE(pres.nombre, 'S/N') as presentacion,
    COALESCE(pres.abreviatura, '') as abreviatura,
    COALESCE(pm.cantidad, 1) as presentacion_factor,
    SUM(rcd.cantidadentregada - rcd.cantidaddevuelta) as cantidad_vendida,
    SUM((rcd.cantidadentregada - rcd.cantidaddevuelta) * COALESCE(pm.preciomayor, rcd.precioventa)) as total_venta
  FROM revendedorcontroldetalle rcd
  INNER JOIN revendedorcontrol rc ON rcd.idrevendedorcontrol = rc.idrevendedorcontrol
  INNER JOIN productomedida pm ON rcd.idproductomedida = pm.idproductomedida
  INNER JOIN producto pr ON pm.idproducto = pr.idproducto
  LEFT JOIN presentacion pres ON pm.idpresentacion = pres.idpresentacion
  WHERE rc.fecha BETWEEN $1 AND $2 AND rc.estado = 1 ${sucursalCond}
  GROUP BY dia_comercial, turno, pm.idproducto, pr.nombre, rcd.idproductomedida, COALESCE(pm.cantidad, 1), COALESCE(pres.nombre, 'S/N'), COALESCE(pres.abreviatura, '')
  ORDER BY dia_comercial, turno, pr.nombre, COALESCE(pres.nombre, 'S/N')
`;

export const generarStockDiario = async (req: Request, res: Response) => {
  const body: any = req.body || {};
  let fechadesde: string | undefined = body.fechadesde;
  let fechahasta: string | undefined = body.fechahasta;
  let idsucursal: string | undefined = body.idsucursal;

  if (!fechadesde || !fechahasta) {
    fechadesde = (req.query.fechadesde as string) || undefined;
    fechahasta = (req.query.fechahasta as string) || undefined;
    idsucursal = idsucursal || (req.query.idsucursal as string) || undefined;
  }

  if (!fechadesde || !fechahasta) {
    return res.status(400).json({ message: "Fechas obligatorias (fechadesde, fechahasta)." });
  }

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    let sucursales: string[];
    if (idsucursal && idsucursal !== "TODOS") {
      sucursales = [idsucursal];
    } else {
      const rows = await queryRunner.query(`SELECT idsucursal FROM sucursal WHERE estado = 1 ORDER BY nombre`);
      sucursales = (rows as any[]).map((r: any) => String(r.idsucursal));
    }

    let totalRegistros = 0;

    for (const idSuc of sucursales) {
      const params = [fechadesde, fechahasta, idSuc];
      const sucursalCond = ` AND prod.idsucursal = $3 `;
      const sucursalCondVenta = ` AND v.idsucursal = $3 `;
      const sucursalCondRev = ` AND rc.idsucursal = $3 `;

      const [turnosProd, turnosVenta, turnosRev] = await Promise.all([
        queryRunner.query(sqlTurnosProd(sucursalCond), params),
        queryRunner.query(sqlTurnosVenta(sucursalCondVenta), params),
        queryRunner.query(sqlTurnosRev(sucursalCondRev), params)
      ]);

      const prevRows = await queryRunner.query(
        `SELECT
           sd.idproducto, sd.presentacion, sd.presentacionfactor, sd.esunidad,
           sd.abreviatura, sd.stockrestante, sd.producto, sd.idproductomedida
         FROM stock_diario sd
         WHERE sd.fecha = (
           SELECT MAX(fecha) FROM stock_diario
           WHERE fecha < $1 AND idsucursal = $2
         ) AND sd.idsucursal = $2
         ORDER BY sd.idproducto, sd.presentacion, sd.turno DESC`,
        [fechadesde, idSuc]
      );

      const disponibles = new Map<string, number>();
      for (const r of prevRows as any[]) {
        disponibles.set(String(r.idproducto) + "::" + (presUnidad(r.presentacion) ? "Unidad" : String(r.presentacion).trim()), Number(r.stockrestante) || 0);
      }

      await queryRunner.query(
        `DELETE FROM stock_diario WHERE fecha BETWEEN $1 AND $2 AND idsucursal = $3`,
        [fechadesde, fechahasta, idSuc]
      );

      const prodMap = new Map<string, any>();
      const ventaMap = new Map<string, any>();
      const revMap = new Map<string, any>();
      const metaCtx = new Map<string, any>();

      const keyOf = (row: any) => String(row.idproducto) + "::" + (presUnidad(row.presentacion) ? "Unidad" : String(row.presentacion).trim());

      const buildMeta = (row: any) => {
        const key = keyOf(row);
        const existing = metaCtx.get(key);
        if (!existing) {
          metaCtx.set(key, {
            presentacion: presUnidad(row.presentacion) ? "Unidad" : String(row.presentacion).trim(),
            abreviatura: row.abreviatura || "",
            factor: Math.max(1, Number(row.presentacion_factor) || 1),
            esUnidad: presUnidad(row.presentacion) ? 1 : 0,
            producto: row.producto || "",
            idproductomedida: row.idproductomedida || null
          });
        } else {
          if (!existing.producto && row.producto) existing.producto = row.producto;
          if (!existing.abreviatura && row.abreviatura) existing.abreviatura = row.abreviatura;
          existing.factor = Math.max(existing.factor, Math.max(1, Number(row.presentacion_factor) || 1));
        }
      };

      for (const row of turnosProd as any[]) buildMeta(row);
      for (const row of turnosVenta as any[]) buildMeta(row);
      for (const row of turnosRev as any[]) buildMeta(row);

      for (const row of turnosProd as any[]) {
        const kk = `${normDia(row.dia_comercial)}|${row.turno}|${keyOf(row)}`;
        const prev = prodMap.get(kk) || { producido: 0, descartada: 0 };
        prev.producido += Number(row.cantidad_producida) || 0;
        prev.descartada += Number(row.cantidad_descartada) || 0;
        prodMap.set(kk, prev);
      }

      for (const row of turnosVenta as any[]) {
        const kk = `${normDia(row.dia_comercial)}|${row.turno}|${keyOf(row)}`;
        const prev = ventaMap.get(kk) || { cantidad: 0, total: 0 };
        prev.cantidad += Number(row.cantidad_vendida) || 0;
        prev.total += Number(row.total_venta) || 0;
        ventaMap.set(kk, prev);
      }

      for (const row of turnosRev as any[]) {
        const kk = `${normDia(row.dia_comercial)}|${row.turno}|${keyOf(row)}`;
        const prev = revMap.get(kk) || { cantidad: 0, total: 0 };
        prev.cantidad += Number(row.cantidad_vendida) || 0;
        prev.total += Number(row.total_venta) || 0;
        revMap.set(kk, prev);
      }

      const fechas = new Set<string>();
      for (const k of [...prodMap.keys(), ...ventaMap.keys(), ...revMap.keys()]) fechas.add(k.split("|")[0]);

      for (const fecha of [...fechas].sort()) {
        for (const turno of ["manana", "tarde"]) {
          const keys = new Set<string>();
          for (const k of prodMap.keys()) if (k.startsWith(`${fecha}|${turno}|`)) keys.add(k.split("|").slice(2).join("|"));
          for (const k of ventaMap.keys()) if (k.startsWith(`${fecha}|${turno}|`)) keys.add(k.split("|").slice(2).join("|"));
          for (const k of revMap.keys()) if (k.startsWith(`${fecha}|${turno}|`)) keys.add(k.split("|").slice(2).join("|"));

          for (const key of keys) {
            const prod = prodMap.get(`${fecha}|${turno}|${key}`) || { producido: 0, descartada: 0 };
            const venta = ventaMap.get(`${fecha}|${turno}|${key}`) || { cantidad: 0, total: 0 };
            const rev = revMap.get(`${fecha}|${turno}|${key}`) || { cantidad: 0, total: 0 };
            const sep = key.lastIndexOf("::");
            const idproducto = key.slice(0, sep);
            const meta = metaCtx.get(key) || { presentacion: "Unidad", abreviatura: "", factor: 1, esUnidad: 1, producto: "", idproductomedida: null };

            const vendidoTienda = Number(venta.cantidad) || 0;
            const ingTienda = Number(venta.total) || 0;
            const vendidoRev = Number(rev.cantidad) || 0;
            const ingRev = Number(rev.total) || 0;
            const vendidoTotal = vendidoTienda + vendidoRev;
            const inicio = disponibles.get(key) || 0;
            const restante = inicio + (Number(prod.producido) || 0) - (Number(prod.descartada) || 0) - vendidoTotal;
            disponibles.set(key, restante);

            const sd = new StockDiario();
            sd.IdStockDiario = await generarIdSecuencial("SD", queryRunner);
            sd.Fecha = new Date(fecha + "T00:00:00");
            sd.Turno = turno;
            sd.IdSucursal = idSuc;
            sd.IdProducto = idproducto;
            sd.IdProductoMedida = meta.idproductomedida || null;
            sd.ProductoNombre = meta.producto;
            sd.Presentacion = meta.presentacion;
            sd.Abreviatura = meta.abreviatura;
            sd.PresentacionFactor = meta.factor;
            sd.EsUnidad = meta.esUnidad;
            sd.CantidadProducida = Number(prod.producido) || 0;
            sd.CantidadDescartada = Number(prod.descartada) || 0;
            sd.CantidadVendidaTienda = vendidoTienda;
            sd.TotalVentaTienda = ingTienda;
            sd.CantidadVendidaRevendedor = vendidoRev;
            sd.TotalVentaRevendedor = ingRev;
            sd.CantidadVendidaTotal = vendidoTotal;
            sd.StockInicio = inicio;
            sd.StockRestante = restante;
            sd.FechaGeneracion = new Date();

            await queryRunner.manager.save(sd);
            totalRegistros++;
          }
        }
      }
    }

    await queryRunner.commitTransaction();
    return res.status(201).json({
      message: "stock_diario generado correctamente",
      registros: totalRegistros,
      desde: fechadesde,
      hasta: fechahasta,
      sucursal: idsucursal && idsucursal !== "TODOS" ? idsucursal : "TODAS"
    });
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error("Error al generar stock_diario:", error);
    return res.status(500).json({
      message: "Error al generar stock_diario",
      error: error instanceof Error ? error.message : "Error desconocido"
    });
  } finally {
    await queryRunner.release();
  }
};

export const listarStockDiario = async (req: Request, res: Response) => {
  try {
    const { fechadesde, fechahasta, idsucursal } = req.query;

    const sql = `
      SELECT
        sd.idstockdiario,
        sd.fecha,
        sd.turno,
        sd.idsucursal,
        sc.nombre as nombre_sucursal,
        sd.idproducto,
        pr.nombre as nombre_producto,
        sd.idproductomedida,
        sd.presentacion,
        sd.abreviatura,
        sd.presentacionfactor,
        sd.esunidad,
        sd.cantidadproducida,
        sd.cantidaddescartada,
        sd.cantidadvendidatienda,
        sd.totalventatienda,
        sd.cantidadvendidarevendedor,
        sd.totalventarevendedor,
        sd.cantidadvendidatotal,
        sd.stockinicio,
        sd.stockrestante,
        sd.fechageneracion
      FROM stock_diario sd
      LEFT JOIN producto pr ON sd.idproducto = pr.idproducto
      LEFT JOIN sucursal sc ON sd.idsucursal = sc.idsucursal
      WHERE ($1::date IS NULL OR sd.fecha >= $1::date)
        AND ($2::date IS NULL OR sd.fecha <= $2::date)
        AND ($3::varchar IS NULL OR $3 = 'TODOS' OR sd.idsucursal = $3::varchar)
      ORDER BY sd.fecha DESC, sd.turno, sd.producto, sd.presentacion
      LIMIT 5000
    `;

    const rows = await AppDataSource.query(sql, [
      fechadesde || null,
      fechahasta || null,
      idsucursal || null
    ]);

    return res.json({
      total: (rows as any[]).length,
      data: rows
    });
  } catch (error) {
    console.error("Error al listar stock_diario:", error);
    return res.status(500).json({
      message: "Error al listar stock_diario",
      error: error instanceof Error ? error.message : "Error desconocido"
    });
  }
};