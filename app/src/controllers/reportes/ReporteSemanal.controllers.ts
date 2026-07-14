import { Request, Response } from "express";
import { Venta } from "../../entities/Venta";
import { Pedido } from "../../entities/Pedido";
import { Produccion } from "../../entities/Produccion";
import { Compra } from "../../entities/Compra";
import { AppDataSource } from "../../db";

const WEEK_LABEL = (semana: string) => {
  const d = new Date(semana + 'T12:00:00');
  const end = new Date(d);
  end.setDate(d.getDate() + 6);
  const fmt = (date: Date) => {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };
  return `${fmt(d)} - ${fmt(end)}`;
};

export const getReporteSemanalVentas = async (req: Request, res: Response) => {
  try {
    const { fechadesde, fechahasta, idsucursal } = req.query;
    if (!fechadesde || !fechahasta) return res.status(400).json({ message: "Fechas obligatorias." });

    const params: any[] = [fechadesde, fechahasta];
    let idx = 3;
    let sucCond = "";
    if (idsucursal && idsucursal !== 'TODOS') {
      sucCond = ` AND v.idsucursal = $${idx++}`;
      params.push(idsucursal);
    }

    const data = await Venta.query(`
      SELECT DATE_TRUNC('week', v.fechaventa)::date as semana,
             COUNT(v.idventa) as cant_ventas,
             SUM(v.preciototal) as total_ingresos,
             COUNT(v.idventa) FILTER (WHERE v.estado = 0) as anuladas
      FROM venta v
      WHERE v.fechaventa BETWEEN $1 AND $2 ${sucCond}
      GROUP BY DATE_TRUNC('week', v.fechaventa)
      ORDER BY semana ASC
    `, params);

    const result = (data as any[]).map(r => ({
      semana: r.semana,
      semanaLabel: WEEK_LABEL(r.semana),
      cant_ventas: Number(r.cant_ventas),
      total_ingresos: Number(r.total_ingresos || 0),
      anuladas: Number(r.anuladas || 0)
    }));

    return res.json({ result, metadatos: { fechadesde, fechahasta } });
  } catch (error) {
    console.error("Error en reporte semanal ventas:", error);
    return res.status(500).json({ message: "Error interno" });
  }
};

export const getReporteSemanalPedidos = async (req: Request, res: Response) => {
  try {
    const { fechadesde, fechahasta, idsucursal } = req.query;
    if (!fechadesde || !fechahasta) return res.status(400).json({ message: "Fechas obligatorias." });

    const params: any[] = [fechadesde, fechahasta];
    let idx = 3;
    let sucCond = "";
    if (idsucursal && idsucursal !== 'TODOS') {
      sucCond = ` AND p.idsucursal = $${idx++}`;
      params.push(idsucursal);
    }

    const data = await Pedido.query(`
      SELECT DATE_TRUNC('week', p.fecharegistro)::date as semana,
             COUNT(p.idpedido) as cant_pedidos,
             SUM(p.total) as total_monto
      FROM pedido p
      WHERE p.fecharegistro BETWEEN $1 AND $2 ${sucCond}
      GROUP BY DATE_TRUNC('week', p.fecharegistro)
      ORDER BY semana ASC
    `, params);

    const result = (data as any[]).map(r => ({
      semana: r.semana,
      semanaLabel: WEEK_LABEL(r.semana),
      cant_pedidos: Number(r.cant_pedidos),
      total_monto: Number(r.total_monto || 0)
    }));

    return res.json({ result, metadatos: { fechadesde, fechahasta } });
  } catch (error) {
    console.error("Error en reporte semanal pedidos:", error);
    return res.status(500).json({ message: "Error interno" });
  }
};

export const getReporteSemanalProduccion = async (req: Request, res: Response) => {
  try {
    const { fechadesde, fechahasta, idsucursal } = req.query;
    if (!fechadesde || !fechahasta) return res.status(400).json({ message: "Fechas obligatorias." });

    const params: any[] = [fechadesde, fechahasta];
    let idx = 3;
    let sucCond = "";
    if (idsucursal && idsucursal !== 'TODOS') {
      sucCond = ` AND p.idsucursal = $${idx++}`;
      params.push(idsucursal);
    }

    const data = await Produccion.query(`
      SELECT DATE_TRUNC('week', p.fechaproduccion)::date as semana,
             COUNT(p.idproduccion) as cant_sesiones,
             SUM(p.costo_total) as costo_total,
             SUM(p.costo_insumos) as costo_insumos,
             SUM(p.costo_mano_obra) as costo_mano_obra,
             SUM(p.costo_indirecto) as costo_indirecto
      FROM produccion p
      WHERE p.fechaproduccion BETWEEN $1 AND $2 ${sucCond}
      GROUP BY DATE_TRUNC('week', p.fechaproduccion)
      ORDER BY semana ASC
    `, params);

    const result = (data as any[]).map(r => ({
      semana: r.semana,
      semanaLabel: WEEK_LABEL(r.semana),
      cant_sesiones: Number(r.cant_sesiones),
      costo_total: Number(r.costo_total || 0),
      costo_insumos: Number(r.costo_insumos || 0),
      costo_mano_obra: Number(r.costo_mano_obra || 0),
      costo_indirecto: Number(r.costo_indirecto || 0)
    }));

    return res.json({ result, metadatos: { fechadesde, fechahasta } });
  } catch (error) {
    console.error("Error en reporte semanal produccion:", error);
    return res.status(500).json({ message: "Error interno" });
  }
};

export const getReporteSemanalTransferencias = async (req: Request, res: Response) => {
  try {
    const { fechadesde, fechahasta } = req.query;
    if (!fechadesde || !fechahasta) return res.status(400).json({ message: "Fechas obligatorias." });

    const data = await AppDataSource.query(`
      SELECT DATE_TRUNC('week', t.fecha)::date as semana,
             COUNT(t.idtransferencia) as cant_transferencias,
             SUM(t.monto_total_productos) as monto_total,
             SUM(t.total_comision) as total_comisiones
      FROM transferencia t
      WHERE t.fecha BETWEEN $1 AND $2
      GROUP BY DATE_TRUNC('week', t.fecha)
      ORDER BY semana ASC
    `, [fechadesde, fechahasta]);

    const result = (data as any[]).map(r => ({
      semana: r.semana,
      semanaLabel: WEEK_LABEL(r.semana),
      cant_transferencias: Number(r.cant_transferencias),
      monto_total: Number(r.monto_total || 0),
      total_comisiones: Number(r.total_comisiones || 0)
    }));

    return res.json({ result, metadatos: { fechadesde, fechahasta } });
  } catch (error) {
    console.error("Error en reporte semanal transferencias:", error);
    return res.status(500).json({ message: "Error interno" });
  }
};

export const getReporteSemanalCompras = async (req: Request, res: Response) => {
  try {
    const { fechadesde, fechahasta } = req.query;
    if (!fechadesde || !fechahasta) return res.status(400).json({ message: "Fechas obligatorias." });

    const data = await Compra.query(`
      SELECT DATE_TRUNC('week', c.fechacompra)::date as semana,
             COUNT(c.idcompra) as cant_compras,
             SUM(c.preciototal) as total_invertido
      FROM compra c
      WHERE c.fechacompra BETWEEN $1 AND $2 AND c.estado = 1
      GROUP BY DATE_TRUNC('week', c.fechacompra)
      ORDER BY semana ASC
    `, [fechadesde, fechahasta]);

    const result = (data as any[]).map(r => ({
      semana: r.semana,
      semanaLabel: WEEK_LABEL(r.semana),
      cant_compras: Number(r.cant_compras),
      total_invertido: Number(r.total_invertido || 0)
    }));

    return res.json({ result, metadatos: { fechadesde, fechahasta } });
  } catch (error) {
    console.error("Error en reporte semanal compras:", error);
    return res.status(500).json({ message: "Error interno" });
  }
};

export const getReporteSemanalGastosGenerales = async (req: Request, res: Response) => {
  try {
    const { fechadesde, fechahasta } = req.query;
    if (!fechadesde || !fechahasta) return res.status(400).json({ message: "Fechas obligatorias." });

    const data = await AppDataSource.query(`
      SELECT DATE_TRUNC('week', gg.fecha)::date as semana,
             COUNT(gg.idgastogeneral) as cant_gastos,
             SUM(gg.costo) as total_gastos
      FROM gasto_general gg
      WHERE gg.estado = 1 AND gg.fecha BETWEEN $1 AND $2
      GROUP BY DATE_TRUNC('week', gg.fecha)
      ORDER BY semana ASC
    `, [fechadesde, fechahasta]);

    const result = (data as any[]).map(r => ({
      semana: r.semana,
      semanaLabel: WEEK_LABEL(r.semana),
      cant_gastos: Number(r.cant_gastos),
      total_gastos: Number(r.total_gastos || 0)
    }));

    return res.json({ result, metadatos: { fechadesde, fechahasta } });
  } catch (error) {
    console.error("Error en reporte semanal gastos generales:", error);
    return res.status(500).json({ message: "Error interno" });
  }
};

export const getReporteSemanalFinanciero = async (req: Request, res: Response) => {
  try {
    const { fechadesde, fechahasta, idsucursal } = req.query;
    if (!fechadesde || !fechahasta) return res.status(400).json({ message: "Fechas obligatorias." });

    const sucursalId = (idsucursal && idsucursal !== 'TODOS') ? idsucursal : null;
    const params = [fechadesde, fechahasta, sucursalId];

    const [ingresos, egresos, gastos, compras] = await Promise.all([
      Venta.query(`
        SELECT DATE_TRUNC('week', v.fechaventa)::date as semana,
               SUM(v.preciototal) as total_ingresos
        FROM venta v
        WHERE v.fechaventa BETWEEN $1 AND $2 AND v.estado = 1 AND ($3::varchar IS NULL OR v.idsucursal = $3)
        GROUP BY DATE_TRUNC('week', v.fechaventa)
        ORDER BY semana ASC
      `, params),
      AppDataSource.query(`
        SELECT DATE_TRUNC('week', g.fecha)::date as semana,
               SUM(g.monto) as total_egresos
        FROM gasto g
        WHERE g.fecha BETWEEN $1 AND $2 AND g.estado = 1 AND ($3::varchar IS NULL OR g.idsucursal = $3)
        GROUP BY DATE_TRUNC('week', g.fecha)
        ORDER BY semana ASC
      `, params),
      AppDataSource.query(`
        SELECT DATE_TRUNC('week', gg.fecha)::date as semana,
               SUM(gg.costo) as total_gastos
        FROM gasto_general gg
        WHERE gg.estado = 1 AND gg.fecha BETWEEN $1 AND $2
        GROUP BY DATE_TRUNC('week', gg.fecha)
        ORDER BY semana ASC
      `, [fechadesde, fechahasta]),
      Compra.query(`
        SELECT DATE_TRUNC('week', c.fechacompra)::date as semana,
               SUM(c.preciototal) as total_compras
        FROM compra c
        WHERE c.fechacompra BETWEEN $1 AND $2 AND c.estado = 1
          AND ($3::varchar IS NULL OR EXISTS (SELECT 1 FROM sucursal WHERE idsucursal = $3 AND central = 1))
        GROUP BY DATE_TRUNC('week', c.fechacompra)
        ORDER BY semana ASC
      `, params)
    ]);

    const semanaMap = new Map<string, any>();
    for (const r of ingresos as any[]) {
      semanaMap.set(r.semana, { semana: r.semana, semanaLabel: WEEK_LABEL(r.semana), ingresos: Number(r.total_ingresos || 0), egresos: 0, gastos_generales: 0, compras: 0 });
    }
    for (const r of egresos as any[]) {
      const entry = semanaMap.get(r.semana) || { semana: r.semana, semanaLabel: WEEK_LABEL(r.semana), ingresos: 0, egresos: 0, gastos_generales: 0, compras: 0 };
      entry.egresos = Number(r.total_egresos || 0);
      semanaMap.set(r.semana, entry);
    }
    for (const r of gastos as any[]) {
      const entry = semanaMap.get(r.semana) || { semana: r.semana, semanaLabel: WEEK_LABEL(r.semana), ingresos: 0, egresos: 0, gastos_generales: 0, compras: 0 };
      entry.gastos_generales = Number(r.total_gastos || 0);
      semanaMap.set(r.semana, entry);
    }
    for (const r of compras as any[]) {
      const entry = semanaMap.get(r.semana) || { semana: r.semana, semanaLabel: WEEK_LABEL(r.semana), ingresos: 0, egresos: 0, gastos_generales: 0, compras: 0 };
      entry.compras = Number(r.total_compras || 0);
      semanaMap.set(r.semana, entry);
    }

    const result = Array.from(semanaMap.values()).sort((a, b) => a.semana.localeCompare(b.semana));
    return res.json({ result, metadatos: { fechadesde, fechahasta } });
  } catch (error) {
    console.error("Error en reporte semanal financiero:", error);
    return res.status(500).json({ message: "Error interno" });
  }
};

export const getReporteSemanalComisiones = async (req: Request, res: Response) => {
  try {
    const { fechadesde, fechahasta, idsucursal } = req.query;
    if (!fechadesde || !fechahasta) return res.status(400).json({ message: "Fechas obligatorias." });

    const params: any[] = [fechadesde, fechahasta];
    let idx = 3;
    let sucCond = "";
    if (idsucursal && idsucursal !== 'TODOS') {
      sucCond = ` AND rc.idsucursal = $${idx++}`;
      params.push(idsucursal);
    }

    const data = await AppDataSource.query(`
      SELECT DATE_TRUNC('week', rc.fecha)::date as semana,
             COUNT(DISTINCT rc.idrevendedorcontrol) as cant_controles,
             SUM((rd.cantidadentregada - rd.cantidaddevuelta) * rd.precioventa) as venta_bruta,
             SUM(GREATEST(0, (rd.cantidadentregada - rd.cantidaddevuelta) - COALESCE(rd.cantidadsincomision, 0)) * rd.comisionunitaria) as total_comision
      FROM revendedorcontroldetalle rd
      JOIN revendedorcontrol rc ON rd.idrevendedorcontrol = rc.idrevendedorcontrol
      WHERE rc.fecha BETWEEN $1 AND $2 AND rc.estado = 1 ${sucCond}
      GROUP BY DATE_TRUNC('week', rc.fecha)
      ORDER BY semana ASC
    `, params);

    const result = (data as any[]).map(r => ({
      semana: r.semana,
      semanaLabel: WEEK_LABEL(r.semana),
      cant_controles: Number(r.cant_controles),
      venta_bruta: Number(r.venta_bruta || 0),
      total_comision: Number(r.total_comision || 0)
    }));

    return res.json({ result, metadatos: { fechadesde, fechahasta } });
  } catch (error) {
    console.error("Error en reporte semanal comisiones:", error);
    return res.status(500).json({ message: "Error interno" });
  }
};

export const getReporteSemanalKardex = async (req: Request, res: Response) => {
  try {
    const { fechadesde, fechahasta, idsucursal } = req.query;
    if (!fechadesde || !fechahasta) return res.status(400).json({ message: "Fechas obligatorias." });

    const params: any[] = [fechadesde, fechahasta];
    let idx = 3;
    let sucCond = "";
    if (idsucursal && idsucursal !== 'TODOS') {
      sucCond = ` AND mi.idsucursal = $${idx++}`;
      params.push(idsucursal);
    }

    const data = await AppDataSource.query(`
      SELECT DATE_TRUNC('week', mi.fecha)::date as semana,
             COUNT(mi.idmovimiento) as cant_movimientos,
             COUNT(mi.idmovimiento) FILTER (WHERE mi.tipomovimiento = 'ENTRADA') as entradas,
             COUNT(mi.idmovimiento) FILTER (WHERE mi.tipomovimiento = 'SALIDA') as salidas
      FROM movimiento_inventario mi
      WHERE mi.fecha BETWEEN $1 AND $2 ${sucCond}
      GROUP BY DATE_TRUNC('week', mi.fecha)
      ORDER BY semana ASC
    `, params);

    const result = (data as any[]).map(r => ({
      semana: r.semana,
      semanaLabel: WEEK_LABEL(r.semana),
      cant_movimientos: Number(r.cant_movimientos),
      entradas: Number(r.entradas || 0),
      salidas: Number(r.salidas || 0)
    }));

    return res.json({ result, metadatos: { fechadesde, fechahasta } });
  } catch (error) {
    console.error("Error en reporte semanal kardex:", error);
    return res.status(500).json({ message: "Error interno" });
  }
};

export const getReporteSemanalGeneral = async (req: Request, res: Response) => {
  try {
    const { fechadesde, fechahasta, idsucursal } = req.query;
    if (!fechadesde || !fechahasta) return res.status(400).json({ message: "Fechas obligatorias." });

    const sucId = (idsucursal && idsucursal !== 'TODOS') ? idsucursal : null;
    const params: any[] = [fechadesde, fechahasta, sucId];
    const sucCondVenta = sucId ? ` AND v.idsucursal = $3` : ` AND ($3::varchar IS NULL OR v.idsucursal = $3)`;
    const sucCondGasto = sucId ? ` AND g.idsucursal = $3` : ` AND ($3::varchar IS NULL OR g.idsucursal = $3)`;
    const sucCondRev = sucId ? ` AND rc.idsucursal = $3` : ` AND ($3::varchar IS NULL OR rc.idsucursal = $3)`;

    const [ventasData, revendedoresData, gastosData, gastosGeneralesData, comprasData] = await Promise.all([
      AppDataSource.query(`
        SELECT DATE_TRUNC('week', v.fechaventa)::date as semana,
               COALESCE(SUM(v.preciototal), 0) as total_ventas,
               COUNT(v.idventa) as cant_ventas
        FROM venta v
        WHERE v.fechaventa BETWEEN $1 AND $2 AND v.estado = 1 ${sucCondVenta}
        GROUP BY DATE_TRUNC('week', v.fechaventa)
        ORDER BY semana ASC
      `, params),
      AppDataSource.query(`
        SELECT DATE_TRUNC('week', rc.fecha)::date as semana,
               COALESCE(SUM(
                 ((rd.cantidadentregada - rd.cantidaddevuelta - COALESCE(pa.total_cantidad_ajustada, 0)) * rd.precioventa) +
                 COALESCE(pa.total_venta_ajustada, 0)
               ), 0) as venta_bruta,
               COALESCE(SUM(
                 GREATEST(0, (rd.cantidadentregada - rd.cantidaddevuelta) - COALESCE(rd.cantidadsincomision, 0)) * rd.comisionunitaria
               ), 0) as comisiones
        FROM revendedorcontroldetalle rd
        JOIN revendedorcontrol rc ON rd.idrevendedorcontrol = rc.idrevendedorcontrol
        LEFT JOIN (
          SELECT p.idrevendedorcontroldetalle,
                 SUM(p.cantidad) as total_cantidad_ajustada,
                 SUM(p.cantidad * p.precioventa) as total_venta_ajustada
          FROM revendedorcontrolprecio p
          GROUP BY p.idrevendedorcontroldetalle
        ) pa ON pa.idrevendedorcontroldetalle = rd.idrevendedorcontroldetalle
        WHERE rc.estado = 1 AND rc.fecha BETWEEN $1 AND $2 ${sucCondRev}
        GROUP BY DATE_TRUNC('week', rc.fecha)
        ORDER BY semana ASC
      `, params),
      AppDataSource.query(`
        SELECT DATE_TRUNC('week', g.fecha)::date as semana,
               COALESCE(SUM(g.monto), 0) as total_gastos
        FROM gasto g
        WHERE g.fecha BETWEEN $1 AND $2 AND g.estado = 1 ${sucCondGasto}
        GROUP BY DATE_TRUNC('week', g.fecha)
        ORDER BY semana ASC
      `, params),
      AppDataSource.query(`
        SELECT DATE_TRUNC('week', gg.fecha)::date as semana,
               COALESCE(SUM(gg.costo), 0) as total_gastos_generales,
               COUNT(gg.idgastogeneral) as cantidad
        FROM gasto_general gg
        WHERE gg.estado = 1 AND gg.fecha BETWEEN $1 AND $2
        GROUP BY DATE_TRUNC('week', gg.fecha)
        ORDER BY semana ASC
      `, [fechadesde, fechahasta]),
      AppDataSource.query(`
        SELECT DATE_TRUNC('week', c.fechacompra)::date as semana,
               COALESCE(SUM(c.preciototal), 0) as total_compras,
               COUNT(c.idcompra) as cant_compras
        FROM compra c
        WHERE c.fechacompra BETWEEN $1 AND $2 AND c.estado = 1
          AND ($3::varchar IS NULL OR EXISTS (SELECT 1 FROM sucursal WHERE idsucursal = $3 AND central = 1))
        GROUP BY DATE_TRUNC('week', c.fechacompra)
        ORDER BY semana ASC
      `, params)
    ]);

    // Build week map from all distinct weeks
    const weekMap: Record<string, any> = {};
    const toDateStr = (d: any) => d instanceof Date ? d.toISOString().slice(0, 10) : String(d).split('T')[0];

    (ventasData as any[]).forEach(r => {
      const s = toDateStr(r.semana);
      weekMap[s] = weekMap[s] || { semana: s, semanaLabel: WEEK_LABEL(s), ventas: { total: 0, cantidad: 0 }, revendedores: { venta_bruta: 0, comisiones: 0, neto: 0 }, gastos: 0, gastosGenerales: { total: 0, cantidad: 0 }, compras: { total: 0, cantidad: 0 } };
      weekMap[s].ventas.total += Number(r.total_ventas);
      weekMap[s].ventas.cantidad += Number(r.cant_ventas);
    });

    (revendedoresData as any[]).forEach(r => {
      const s = toDateStr(r.semana);
      weekMap[s] = weekMap[s] || { semana: s, semanaLabel: WEEK_LABEL(s), ventas: { total: 0, cantidad: 0 }, revendedores: { venta_bruta: 0, comisiones: 0, neto: 0 }, gastos: 0, gastosGenerales: { total: 0, cantidad: 0 }, compras: { total: 0, cantidad: 0 } };
      weekMap[s].revendedores.venta_bruta += Number(r.venta_bruta);
      weekMap[s].revendedores.comisiones += Number(r.comisiones);
      weekMap[s].revendedores.neto = weekMap[s].revendedores.venta_bruta - weekMap[s].revendedores.comisiones;
    });

    (gastosData as any[]).forEach(r => {
      const s = toDateStr(r.semana);
      weekMap[s] = weekMap[s] || { semana: s, semanaLabel: WEEK_LABEL(s), ventas: { total: 0, cantidad: 0 }, revendedores: { venta_bruta: 0, comisiones: 0, neto: 0 }, gastos: 0, gastosGenerales: { total: 0, cantidad: 0 }, compras: { total: 0, cantidad: 0 } };
      weekMap[s].gastos += Number(r.total_gastos);
    });

    (gastosGeneralesData as any[]).forEach(r => {
      const s = toDateStr(r.semana);
      weekMap[s] = weekMap[s] || { semana: s, semanaLabel: WEEK_LABEL(s), ventas: { total: 0, cantidad: 0 }, revendedores: { venta_bruta: 0, comisiones: 0, neto: 0 }, gastos: 0, gastosGenerales: { total: 0, cantidad: 0 }, compras: { total: 0, cantidad: 0 } };
      weekMap[s].gastosGenerales.total += Number(r.total_gastos_generales);
      weekMap[s].gastosGenerales.cantidad += Number(r.cantidad);
    });

    (comprasData as any[]).forEach(r => {
      const s = toDateStr(r.semana);
      weekMap[s] = weekMap[s] || { semana: s, semanaLabel: WEEK_LABEL(s), ventas: { total: 0, cantidad: 0 }, revendedores: { venta_bruta: 0, comisiones: 0, neto: 0 }, gastos: 0, gastosGenerales: { total: 0, cantidad: 0 }, compras: { total: 0, cantidad: 0 } };
      weekMap[s].compras.total += Number(r.total_compras);
      weekMap[s].compras.cantidad += Number(r.cant_compras);
    });

    const result = Object.values(weekMap).sort((a: any, b: any) => a.semana.localeCompare(b.semana)).map((w: any) => {
      const ingresoTotal = w.ventas.total + w.revendedores.neto;
      const egresoTotal = w.compras.total + w.gastos + w.gastosGenerales.total;
      return {
        semana: w.semana,
        semanaLabel: w.semanaLabel,
        ingresos: {
          ventaTienda: w.ventas.total,
          revendedoresNeto: w.revendedores.neto,
          revendedoresBruto: w.revendedores.venta_bruta,
          comisionesPagadas: w.revendedores.comisiones,
          totalIngresos: ingresoTotal
        },
        egresos: {
          compras: w.compras.total,
          gastosOperativos: w.gastos,
          gastosGenerales: w.gastosGenerales.total,
          totalEgresos: egresoTotal
        },
        resumen: {
          cantVentas: w.ventas.cantidad,
          cantCompras: w.compras.cantidad,
          utilidadSemanal: ingresoTotal - egresoTotal
        }
      };
    });

    return res.json({ result, metadatos: { fechadesde, fechahasta, idsucursal: idsucursal || "TODAS" } });
  } catch (error) {
    console.error("Error en reporte semanal general:", error);
    return res.status(500).json({ message: "Error interno" });
  }
};
