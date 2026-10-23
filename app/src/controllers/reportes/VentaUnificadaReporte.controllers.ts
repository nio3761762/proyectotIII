import { Request, Response } from "express";
import { AppDataSource } from "../../db";

const MESES_NOMBRES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const normalizarFecha = (valor: any): string => {
  if (!valor) return "";
  return String(valor).slice(0, 10);
};

const normalizarPresentacion = (valor: any): string => {
  const texto = String(valor || "").trim();
  if (!texto) return "Sin Presentacion";
  if (/^(unidad|unidades|und|u)$/i.test(texto)) return "UNIDAD";
  return texto;
};

const etiquetaPresentacion = (presentacion: string, abreviatura: any): string => {
  if (presentacion === "UNIDAD") return "U";
  const abrev = String(abreviatura || "").trim();
  return abrev || presentacion;
};

const etiquetaMes = (monthKey: string): string => {
  const partes = String(monthKey || "").split("-");
  if (partes.length < 2) return monthKey;
  const idx = Number(partes[1]) - 1;
  if (isNaN(idx) || idx < 0 || idx > 11) return monthKey;
  return `${MESES_NOMBRES[idx]} ${partes[0]}`;
};

// Fechas en UTC para no depender de la zona horaria del servidor
const sumarDiasISO = (fecha: string, dias: number): string => {
  const d = new Date(`${fecha}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
};

const formatoDMY = (fecha: string): string => {
  const [y, m, d] = fecha.split("-");
  return `${d}/${m}/${y}`;
};

const inicioSemanaISO = (fecha: string, diaInicio: number): string => {
  const d = new Date(`${fecha}T00:00:00Z`);
  const diff = (d.getUTCDay() - diaInicio + 7) % 7;
  return sumarDiasISO(fecha, -diff);
};

const ordenOrigen = (tipo: string): number => {
  if (tipo === "Revendedor") return 0;
  if (tipo === "Vendido") return 1;
  if (tipo === "Pedido") return 2;
  return 3;
};

const numero = (valor: any): number => Number(valor || 0);

type Columna = {
  key: string;
  producto: string;
  presentacion: string;
  etiqueta: string;
  factor: number;
};

type Fila = {
  origen: string;
  tipo: string;
  cantidades: Record<string, number>;
  ingreso: number;
  gastoExtra: number;
  neto: number;
  comision: number;
  liquidoPanaderia: number;
};

type Totales = {
  ingreso: number;
  gastoExtra: number;
  neto: number;
  comision: number;
  liquidoPanaderia: number;
};

type Bloque = {
  filas: Fila[];
  totales: Totales;
  totalesPorColumna: Record<string, number>;
};

type Dia = Bloque & {
  fecha: string;
  monthKey: string;
  semanaKey: string;
};

type Meta = {
  label: string;
  fechaInicio: string;
  fechaFin: string;
};

type Grupo = Meta & {
  key: string;
  dias: Dia[];
};

const ultimoDiaDelMes = (monthKey: string): string => {
  const [y, m] = monthKey.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
};

const menor = (a: string, b: string): string => (a < b ? a : b);
const mayor = (a: string, b: string): string => (a > b ? a : b);

// Semana recortada a un limite (rango consultado o mes). Asi una semana compartida
// entre dos meses se muestra solo con los dias de cada mes y los totales cuadran.
const metaSemana = (inicio: string, limiteIni: string, limiteFin: string): Meta => {
  const ini = mayor(inicio, limiteIni);
  const fin = menor(sumarDiasISO(inicio, 6), limiteFin);
  return { label: `${formatoDMY(ini)} - ${formatoDMY(fin)}`, fechaInicio: ini, fechaFin: fin };
};

const crearFila = (origen: string, tipo: string): Fila => ({
  origen,
  tipo,
  cantidades: {},
  ingreso: 0,
  gastoExtra: 0,
  neto: 0,
  comision: 0,
  liquidoPanaderia: 0
});

const sumarCantidad = (fila: Fila, clave: string, cantidad: any) => {
  fila.cantidades[clave] = numero(fila.cantidades[clave]) + numero(cantidad);
};

const ordenarFilas = (filas: Fila[]): Fila[] =>
  filas.sort((a, b) => ordenOrigen(a.tipo) - ordenOrigen(b.tipo) || a.origen.localeCompare(b.origen, "es", { sensitivity: "base" }));

// Suma varias listas de filas (dias) en una sola lista por origen||tipo
const combinarFilas = (listas: Fila[][]): Fila[] => {
  const mapa = new Map<string, Fila>();
  listas.forEach((filas) => {
    filas.forEach((fila) => {
      const key = `${fila.origen}||${fila.tipo}`;
      if (!mapa.has(key)) mapa.set(key, crearFila(fila.origen, fila.tipo));
      const destino = mapa.get(key)!;
      Object.entries(fila.cantidades).forEach(([clave, cantidad]) => {
        destino.cantidades[clave] = numero(destino.cantidades[clave]) + numero(cantidad);
      });
      destino.ingreso += fila.ingreso;
      destino.gastoExtra += fila.gastoExtra;
      destino.neto += fila.neto;
      destino.comision += fila.comision;
      destino.liquidoPanaderia += fila.liquidoPanaderia;
    });
  });
  return ordenarFilas(Array.from(mapa.values()));
};

const construirBloque = (filas: Fila[], columnas: Columna[]): Bloque => {
  const totalesPorColumna: Record<string, number> = {};
  columnas.forEach((col) => { totalesPorColumna[col.key] = 0; });
  const totales: Totales = { ingreso: 0, gastoExtra: 0, neto: 0, comision: 0, liquidoPanaderia: 0 };

  filas.forEach((fila) => {
    columnas.forEach((col) => {
      totalesPorColumna[col.key] += numero(fila.cantidades[col.key]);
    });
    totales.ingreso += fila.ingreso;
    totales.gastoExtra += fila.gastoExtra;
    totales.neto += fila.neto;
    totales.comision += fila.comision;
    totales.liquidoPanaderia += fila.liquidoPanaderia;
  });

  return { filas, totales, totalesPorColumna };
};

// Agrupa los dias (ya ordenados desc) por una clave, conservando el orden de aparicion
const agruparPor = (dias: Dia[], claveDe: (dia: Dia) => string, metaDe: (clave: string) => Meta): Grupo[] => {
  const mapa = new Map<string, Grupo>();
  dias.forEach((dia) => {
    const key = claveDe(dia);
    if (!mapa.has(key)) mapa.set(key, { key, ...metaDe(key), dias: [] });
    mapa.get(key)!.dias.push(dia);
  });
  return Array.from(mapa.values());
};

const construirPeriodo = (grupo: Grupo, columnas: Columna[]) => ({
  key: grupo.key,
  label: grupo.label,
  fechaInicio: grupo.fechaInicio,
  fechaFin: grupo.fechaFin,
  fechas: grupo.dias.map((dia) => dia.fecha),
  ...construirBloque(combinarFilas(grupo.dias.map((dia) => dia.filas)), columnas)
});

export const getReporteVentaUnificada = async (req: Request, res: Response) => {
  try {
    const { fechadesde, fechahasta, idsucursal, diaInicioSemana } = req.query;

    if (!fechadesde || !fechahasta) {
      return res.status(400).json({ message: "Fechas obligatorias (fechadesde, fechahasta)." });
    }

    // Dia en que inicia la semana (0 = domingo ... 6 = sabado). Por defecto lunes.
    const diaInicioNumero = Number(diaInicioSemana ?? 1);
    const diaInicio = Number.isInteger(diaInicioNumero) && diaInicioNumero >= 0 && diaInicioNumero <= 6
      ? diaInicioNumero
      : 1;

    const params: any[] = [fechadesde, fechahasta];
    let ventaFiltro = "";
    let comisionFiltro = "";

    if (idsucursal && idsucursal !== "TODOS") {
      ventaFiltro = " AND v.idsucursal = $3";
      comisionFiltro = " AND rc.idsucursal = $3";
      params.push(idsucursal);
    }

    const sqlVentas = `
      SELECT
        TO_CHAR(v.fechaventa, 'YYYY-MM-DD') AS fecha,
        CASE
          WHEN LOWER(s.nombre) LIKE '%cocina%' OR LOWER(s.nombre) LIKE '%pedido%' THEN 'Cocina'
          ELSE 'Tienda Central'
        END AS origen,
        CASE
          WHEN LOWER(s.nombre) LIKE '%cocina%' OR LOWER(s.nombre) LIKE '%pedido%' THEN 'Pedido'
          ELSE 'Vendido'
        END AS tipo,
        COALESCE(prod.nombre, prom.nombre, 'Sin Producto') AS producto,
        CASE
          WHEN dv.idpromocion IS NOT NULL THEN 'PROMOCION'
          WHEN pres.nombre IS NOT NULL THEN pres.nombre
          ELSE 'UNIDAD'
        END AS presentacion,
        COALESCE(pres.abreviatura, '') AS abreviatura,
        COALESCE(pm.cantidad, 1) AS factor,
        SUM(dv.cantidad) AS cantidad,
        SUM(dv.cantidad * dv.precio) AS ingreso
      FROM venta v
      INNER JOIN sucursal s ON v.idsucursal = s.idsucursal
      INNER JOIN detalleventa dv ON dv.idventa = v.idventa
      LEFT JOIN producto prod ON dv.idproducto = prod.idproducto
      LEFT JOIN promocion prom ON dv.idpromocion = prom.idpromocion
      LEFT JOIN productomedida pm ON dv.idproductomedida = pm.idproductomedida
      LEFT JOIN presentacion pres ON pm.idpresentacion = pres.idpresentacion
      WHERE v.fechaventa BETWEEN $1 AND $2 AND v.estado = 1 ${ventaFiltro}
      GROUP BY fecha, origen, tipo, producto, presentacion, abreviatura, factor
      ORDER BY fecha, origen, producto, presentacion
    `;

    const sqlGastoVentas = `
      SELECT
        TO_CHAR(v.fechaventa, 'YYYY-MM-DD') AS fecha,
        CASE
          WHEN LOWER(s.nombre) LIKE '%cocina%' OR LOWER(s.nombre) LIKE '%pedido%' THEN 'Cocina'
          ELSE 'Tienda Central'
        END AS origen,
        CASE
          WHEN LOWER(s.nombre) LIKE '%cocina%' OR LOWER(s.nombre) LIKE '%pedido%' THEN 'Pedido'
          ELSE 'Vendido'
        END AS tipo,
        SUM(COALESCE(v.gastoextra, 0)) AS gasto_extra
      FROM venta v
      INNER JOIN sucursal s ON v.idsucursal = s.idsucursal
      WHERE v.fechaventa BETWEEN $1 AND $2 AND v.estado = 1 ${ventaFiltro}
      GROUP BY fecha, origen, tipo
    `;

    const sqlComisiones = `
      WITH filtered_rc AS (
        SELECT rc.*
        FROM revendedorcontrol rc
        WHERE rc.fecha BETWEEN $1 AND $2 AND rc.estado = 1 ${comisionFiltro}
      ),
      precios_agg AS (
        SELECT
          p.idrevendedorcontroldetalle,
          COALESCE(SUM(p.cantidad), 0) AS total_cantidad_ajustada,
          COALESCE(SUM(p.cantidad * p.precioventa), 0) AS total_venta_ajustada
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
          COALESCE((SELECT e_sub.idpersona FROM empleado e_sub WHERE e_sub.idempleado = rc.idempleado), rc.idpersona) AS persona_id,
          (d.cantidadentregada - d.cantidaddevuelta) AS vendido_total,
          (
            ((d.cantidadentregada - d.cantidaddevuelta - COALESCE(pa.total_cantidad_ajustada, 0)) * d.precioventa) +
            COALESCE(pa.total_venta_ajustada, 0)
          ) AS venta_total,
          (
            GREATEST(0, (d.cantidadentregada - d.cantidaddevuelta) - COALESCE(d.cantidadsincomision, 0)) * d.comisionunitaria
          ) AS comision_total,
          (
            ((d.cantidadentregada - d.cantidaddevuelta - COALESCE(pa.total_cantidad_ajustada, 0)) * d.precioventa) +
            COALESCE(pa.total_venta_ajustada, 0) -
            (GREATEST(0, (d.cantidadentregada - d.cantidaddevuelta) - COALESCE(d.cantidadsincomision, 0)) * d.comisionunitaria)
          ) AS liquido_panaderia
        FROM revendedorcontroldetalle d
        INNER JOIN filtered_rc rc ON rc.idrevendedorcontrol = d.idrevendedorcontrol
        LEFT JOIN precios_agg pa ON pa.idrevendedorcontroldetalle = d.idrevendedorcontroldetalle
      )
      SELECT
        TO_CHAR(dc.fecha, 'YYYY-MM-DD') AS fecha,
        COALESCE(per.nombre, per_dir.nombre, 'Revendedor') || ' ' || COALESCE(COALESCE(per.apellidopaterno, per_dir.apellidopaterno), '') AS origen,
        prod.nombre AS producto,
        COALESCE(pre.nombre, 'Sin Presentacion') AS presentacion,
        COALESCE(pre.abreviatura, '') AS abreviatura,
        COALESCE(pm.cantidad, 1) AS factor,
        SUM(dc.vendido_total) AS cantidad,
        SUM(dc.comision_total) AS comision,
        SUM(dc.liquido_panaderia) AS ingreso
      FROM detalles_calc dc
      LEFT JOIN empleado e ON dc.idempleado = e.idempleado
      LEFT JOIN persona per ON e.idpersona = per.idpersona
      LEFT JOIN persona per_dir ON per_dir.idpersona = dc.idpersona
      INNER JOIN productomedida pm ON dc.idproductomedida = pm.idproductomedida
      INNER JOIN producto prod ON pm.idproducto = prod.idproducto
      LEFT JOIN presentacion pre ON pm.idpresentacion = pre.idpresentacion
      GROUP BY fecha, origen, producto, presentacion, abreviatura, factor
      ORDER BY fecha, origen, producto, presentacion
    `;

    const sqlGastoComisiones = `
      WITH filtered_rc AS (
        SELECT rc.*
        FROM revendedorcontrol rc
        WHERE rc.fecha BETWEEN $1 AND $2 AND rc.estado = 1 ${comisionFiltro}
      )
      SELECT
        TO_CHAR(rc.fecha, 'YYYY-MM-DD') AS fecha,
        COALESCE(per.nombre, per_dir.nombre, 'Revendedor') || ' ' || COALESCE(COALESCE(per.apellidopaterno, per_dir.apellidopaterno), '') AS origen,
        SUM(COALESCE(rc.gastoextra, 0)) AS gasto_extra
      FROM filtered_rc rc
      LEFT JOIN empleado e ON rc.idempleado = e.idempleado
      LEFT JOIN persona per ON e.idpersona = per.idpersona
      LEFT JOIN persona per_dir ON per_dir.idpersona = rc.idpersona
      GROUP BY fecha, origen
    `;

    const [ventas, gastoVentas, comisiones, gastoComisiones] = await Promise.all([
      AppDataSource.query(sqlVentas, params),
      AppDataSource.query(sqlGastoVentas, params),
      AppDataSource.query(sqlComisiones, params),
      AppDataSource.query(sqlGastoComisiones, params)
    ]);

    const columnasMapa = new Map<string, Columna>();
    const diasMapa = new Map<string, Map<string, Fila>>();

    const obtenerFila = (fecha: string, origen: string, tipo: string): Fila => {
      if (!diasMapa.has(fecha)) diasMapa.set(fecha, new Map());
      const filasDia = diasMapa.get(fecha)!;
      const key = `${origen}||${tipo}`;
      if (!filasDia.has(key)) filasDia.set(key, crearFila(origen, tipo));
      return filasDia.get(key)!;
    };

    const registrarColumna = (producto: any, presentacion: any, abreviatura: any, factor: any): string => {
      const prod = String(producto || "Sin Producto").trim() || "Sin Producto";
      const pres = normalizarPresentacion(presentacion);
      const key = `${prod}||${pres}`;
      if (!columnasMapa.has(key)) {
        columnasMapa.set(key, {
          key,
          producto: prod,
          presentacion: pres,
          etiqueta: etiquetaPresentacion(pres, abreviatura),
          factor: numero(factor) || 1
        });
      }
      return key;
    };

    (ventas as any[]).forEach((row) => {
      const fecha = normalizarFecha(row.fecha);
      if (!fecha) return;
      const key = registrarColumna(row.producto, row.presentacion, row.abreviatura, row.factor);
      const fila = obtenerFila(fecha, row.origen, row.tipo);
      sumarCantidad(fila, key, row.cantidad);
      fila.ingreso += numero(row.ingreso);
    });

    (gastoVentas as any[]).forEach((row) => {
      const fecha = normalizarFecha(row.fecha);
      if (!fecha) return;
      const fila = obtenerFila(fecha, row.origen, row.tipo);
      fila.gastoExtra += numero(row.gasto_extra);
    });

    // Comisiones de revendedores: el ingreso ya es liquido (venta - comision)
    (comisiones as any[]).forEach((row) => {
      const fecha = normalizarFecha(row.fecha);
      if (!fecha) return;
      const key = registrarColumna(row.producto, row.presentacion, row.abreviatura, row.factor);
      const fila = obtenerFila(fecha, String(row.origen || "Revendedor").trim() || "Revendedor", "Revendedor");
      sumarCantidad(fila, key, row.cantidad);
      fila.comision += numero(row.comision);
      fila.ingreso += numero(row.ingreso);
      fila.liquidoPanaderia += numero(row.ingreso);
    });

    (gastoComisiones as any[]).forEach((row) => {
      const fecha = normalizarFecha(row.fecha);
      if (!fecha) return;
      const fila = obtenerFila(fecha, String(row.origen || "Revendedor").trim() || "Revendedor", "Revendedor");
      fila.gastoExtra += numero(row.gasto_extra);
    });

    const columnas = Array.from(columnasMapa.values()).sort((a, b) => {
      const prod = a.producto.localeCompare(b.producto, "es", { sensitivity: "base" });
      if (prod !== 0) return prod;
      if (a.factor !== b.factor) return a.factor - b.factor;
      return a.presentacion.localeCompare(b.presentacion, "es", { sensitivity: "base" });
    });

    const gruposMapa = new Map<string, { producto: string; presentaciones: Columna[] }>();
    columnas.forEach((col) => {
      if (!gruposMapa.has(col.producto)) {
        gruposMapa.set(col.producto, { producto: col.producto, presentaciones: [] });
      }
      gruposMapa.get(col.producto)!.presentaciones.push(col);
    });
    const grupos = Array.from(gruposMapa.values());

    // Dias: filas con datos, ordenadas por origen y tipo
    const diasBase = Array.from(diasMapa.entries())
      .map(([fecha, filasMapa]) => {
        const filas = Array.from(filasMapa.values())
          .map((fila) => {
            fila.neto = fila.ingreso - fila.gastoExtra;
            return fila;
          })
          .filter((fila) => fila.ingreso !== 0 || fila.gastoExtra !== 0 || Object.values(fila.cantidades).some((c) => c !== 0));
        return { fecha, filas: ordenarFilas(filas) };
      })
      .sort((a, b) => b.fecha.localeCompare(a.fecha));

    const dias: Dia[] = diasBase.map(({ fecha, filas }) => ({
      fecha,
      monthKey: fecha.slice(0, 7),
      semanaKey: inicioSemanaISO(fecha, diaInicio),
      ...construirBloque(filas, columnas)
    }));

    const desdeISO = String(fechadesde).slice(0, 10);
    const hastaISO = String(fechahasta).slice(0, 10);

    // Semanas (desc), recortadas al rango consultado. Cada semana lista sus fechas.
    const semanas = agruparPor(
      dias,
      (dia) => dia.semanaKey,
      (inicio) => metaSemana(inicio, desdeISO, hastaISO)
    ).map((grupo) => construirPeriodo(grupo, columnas));

    // Meses (desc). El mes va de dia 1 al ultimo dia (recortado al rango).
    // Sus semanas se recortan al mes: una semana compartida con otro mes aparece
    // en cada mes solo con sus dias, asi la suma de semanas = general del mes.
    const meses = agruparPor(
      dias,
      (dia) => dia.monthKey,
      (mes) => ({
        label: etiquetaMes(mes),
        fechaInicio: mayor(`${mes}-01`, desdeISO),
        fechaFin: menor(ultimoDiaDelMes(mes), hastaISO)
      })
    ).map((grupo) => {
      const limiteIni = mayor(`${grupo.key}-01`, desdeISO);
      const limiteFin = menor(ultimoDiaDelMes(grupo.key), hastaISO);
      const semanasDelMes = agruparPor(
        grupo.dias,
        (dia) => dia.semanaKey,
        (inicio) => metaSemana(inicio, limiteIni, limiteFin)
      ).map((g) => construirPeriodo(g, columnas));
      return {
        ...construirPeriodo(grupo, columnas),
        semanas: semanasDelMes
      };
    });

    // Totales globales por origen||tipo
    const filasGlobales = combinarFilas(dias.map((dia) => dia.filas));
    const bloqueGlobal = construirBloque(filasGlobales, columnas);
    const totalesGlobales = bloqueGlobal.totales;

    // Porcentajes: los revendedores se resumen en una sola fila "Revendedor"
    const porcentajeDe = (origen: string, tipo: string, cantidad: number, valores: { ingreso: number; neto: number; comision: number }) => ({
      origen,
      tipo,
      cantidad,
      monto: valores.ingreso,
      neto: valores.neto,
      comision: valores.comision,
      porcentaje: totalesGlobales.ingreso > 0 ? Number(((valores.ingreso / totalesGlobales.ingreso) * 100).toFixed(2)) : 0,
      porcentajeNeto: totalesGlobales.neto > 0 ? Number(((valores.neto / totalesGlobales.neto) * 100).toFixed(2)) : 0
    });

    const filasRevendedores = filasGlobales.filter((fila) => fila.tipo === "Revendedor");
    const otrasFilas = filasGlobales.filter((fila) => fila.tipo !== "Revendedor");
    const porcentajes: ReturnType<typeof porcentajeDe>[] = [];
    if (filasRevendedores.length) {
      const sumaRevendedores = filasRevendedores.reduce(
        (acc, fila) => ({
          ingreso: acc.ingreso + fila.ingreso,
          neto: acc.neto + fila.neto,
          comision: acc.comision + fila.comision
        }),
        { ingreso: 0, neto: 0, comision: 0 }
      );
      porcentajes.push(porcentajeDe("Revendedor", "Revendedor", filasRevendedores.length, sumaRevendedores));
    }
    otrasFilas.forEach((fila) => {
      porcentajes.push(porcentajeDe(fila.origen, fila.tipo, 1, fila));
    });

    // Resumen general por mes: ingreso, gasto, ganancia y % del total que aporta cada mes
    const pctDe = (valor: number, total: number): number =>
      total > 0 ? Number(((valor / total) * 100).toFixed(2)) : 0;

    const resumenMeses = meses.map((mes) => ({
      key: mes.key,
      label: mes.label,
      ingreso: mes.totales.ingreso,
      gastoExtra: mes.totales.gastoExtra,
      neto: mes.totales.neto,
      comision: mes.totales.comision,
      porcentajeIngreso: pctDe(mes.totales.ingreso, totalesGlobales.ingreso),
      porcentajeNeto: pctDe(mes.totales.neto, totalesGlobales.neto)
    }));

    return res.json({
      metadatos: {
        desde: fechadesde,
        hasta: fechahasta,
        sucursal: idsucursal || "TODAS",
        diaInicioSemana: diaInicio
      },
      columnas,
      grupos,
      dias,
      semanas,
      meses,
      resumenMeses,
      cantidadMeses: meses.length,
      porcentajes,
      totalesGlobales,
      totalesPorColumnaGlobales: bloqueGlobal.totalesPorColumna
    });
  } catch (error) {
    console.error("Error en reporte de venta unificada:", error);
    return res.status(500).json({ message: "Error al generar el reporte de venta unificada." });
  }
};
