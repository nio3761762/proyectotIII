import { Request, Response } from "express";
import { Venta } from "../../entities/Venta";
import { Produccion } from "../../entities/Produccion";

/**
 * REPORTE CONSOLIDADO FINANCIERO
 */
export const getReporteFinancieroConsolidado = async (req: Request, res: Response) => {
    try {
        const { fechadesde, fechahasta, idsucursal } = req.query;
        if (!fechadesde || !fechahasta) return res.status(400).json({ message: "Fechas obligatorias." });

        const sucursalId = (idsucursal && idsucursal !== 'TODOS') ? idsucursal : null;
        const params = [fechadesde, fechahasta, sucursalId];

        // 1. Obtener todas las sucursales involucradas
        const sqlSucursales = `SELECT idsucursal, nombre FROM sucursal WHERE ($1::varchar IS NULL OR idsucursal = $1) AND estado = 1`;
        
        // 2. Ingresos Tienda agrupados por sucursal
        const sqlIngresosTienda = `
            SELECT idsucursal, COALESCE(SUM(preciototal), 0) as total 
            FROM venta 
            WHERE fechaventa BETWEEN $1 AND $2 AND estado = 1 AND ($3::varchar IS NULL OR idsucursal = $3)
            GROUP BY idsucursal
        `;
        
        // 3. Ingresos Revendedores agrupados por sucursal
        const sqlRevendedores = `
            SELECT rc.idsucursal, 
                SUM(
                    ((rd.cantidadentregada - rd.cantidaddevuelta - COALESCE(pa.total_cantidad_ajustada, 0)) * rd.precioventa) +
                    COALESCE(pa.total_venta_ajustada, 0)
                ) as venta_bruta,
                SUM(
                    GREATEST(0, (rd.cantidadentregada - rd.cantidaddevuelta) - COALESCE(rd.cantidadsincomision, 0)) * rd.comisionunitaria
                ) as comisiones
            FROM revendedorcontroldetalle rd
            JOIN revendedorcontrol rc ON rd.idrevendedorcontrol = rc.idrevendedorcontrol
            LEFT JOIN (
                SELECT p.idrevendedorcontroldetalle,
                       SUM(p.cantidad) as total_cantidad_ajustada,
                       SUM(p.cantidad * p.precioventa) as total_venta_ajustada
                FROM revendedorcontrolprecio p
                GROUP BY p.idrevendedorcontroldetalle
            ) pa ON pa.idrevendedorcontroldetalle = rd.idrevendedorcontroldetalle
            WHERE rc.estado = 1 AND rc.fecha BETWEEN $1 AND $2 AND ($3::varchar IS NULL OR rc.idsucursal = $3)
            GROUP BY rc.idsucursal
        `; 

        // 4. Gastos agrupados por sucursal
        const sqlGastos = `
            SELECT idsucursal, COALESCE(SUM(monto), 0) as total,
                   json_agg(json_build_object('servicio', servicio, 'monto', monto, 'fecha', fecha, 'tipo', tipo)) as detalle
            FROM gasto 
            WHERE fecha BETWEEN $1 AND $2 AND estado = 1 AND ($3::varchar IS NULL OR idsucursal = $3)
            GROUP BY idsucursal
        `;

        // 5. Salarios agrupados por sucursal
        const sqlSalarios = `
            SELECT es.idsucursal, COALESCE(SUM(s.salario), 0) as total,
                   json_agg(json_build_object('empleado', p.nombre || ' ' || COALESCE(p.apellidopaterno, ''), 'monto', s.salario)) as planilla
            FROM salario s
            JOIN empleado e ON s.idempleado = e.idempleado
            JOIN persona p ON e.idpersona = p.idpersona
            JOIN empleado_sucursal es ON e.idempleado = es.idempleado AND es.estado = 1
            WHERE s.estado = 1 AND (s.fechafin IS NULL OR s.fechafin >= $1) AND s.fechainicio <= $2 AND ($3::varchar IS NULL OR es.idsucursal = $3)
            GROUP BY es.idsucursal
        `;

        // 6b. Gastos Generales (globales, sin sucursal)
        const sqlGastosGenerales = `
            SELECT COALESCE(SUM(costo), 0) as total, COUNT(*) as cantidad
            FROM gasto_general
            WHERE estado = 1 AND fecha BETWEEN $1 AND $2
        `;
        const sqlGastosGeneralesDetalle = `
            SELECT idgastogeneral, nombre, fecha, costo
            FROM gasto_general
            WHERE estado = 1 AND fecha BETWEEN $1 AND $2
            ORDER BY fecha DESC, nombre ASC
        `;

        // 5b. Gasto Extra Revendedores por sucursal
        const sqlGastoExtraRev = `
            SELECT idsucursal, SUM(COALESCE(gastoextra, 0)) as total
            FROM revendedorcontrol
            WHERE estado = 1 AND fecha BETWEEN $1 AND $2 AND ($3::varchar IS NULL OR idsucursal = $3)
            GROUP BY idsucursal
        `;

        // 6. Compras (Globales/Filtradas)
        const sqlCompras = `
            SELECT COALESCE(SUM(preciototal), 0) as total 
            FROM compra 
            WHERE fechacompra BETWEEN $1 AND $2 AND estado = 1
            AND ($3::varchar IS NULL OR EXISTS (SELECT 1 FROM sucursal WHERE idsucursal = $3 AND central = 1))
        `;

        // 8. GANANCIA DEL DÍA ACTUAL (Revendedores)
        const sqlHoy = `
            SELECT  
                s.idsucursal,
                s.nombre as sucursal,
                (SELECT COALESCE(SUM(v.preciototal), 0) FROM venta v WHERE v.fechaventa = CURRENT_DATE AND v.estado = 1 AND v.idsucursal = s.idsucursal) as venta_tienda,
                (SELECT COALESCE(SUM(
                    ((rd.cantidadentregada - rd.cantidaddevuelta - COALESCE(pa.total_cantidad_ajustada, 0)) * rd.precioventa) +
                    COALESCE(pa.total_venta_ajustada, 0) -
                    GREATEST(0, (rd.cantidadentregada - rd.cantidaddevuelta) - COALESCE(rd.cantidadsincomision, 0)) * rd.comisionunitaria
                ), 0) 
                FROM revendedorcontroldetalle rd 
                JOIN revendedorcontrol rc ON rd.idrevendedorcontrol = rc.idrevendedorcontrol 
                LEFT JOIN (
                    SELECT p.idrevendedorcontroldetalle,
                           SUM(p.cantidad) as total_cantidad_ajustada,
                           SUM(p.cantidad * p.precioventa) as total_venta_ajustada
                    FROM revendedorcontrolprecio p
                    GROUP BY p.idrevendedorcontroldetalle
                ) pa ON pa.idrevendedorcontroldetalle = rd.idrevendedorcontroldetalle
                WHERE rc.estado = 1 AND rc.fecha = CURRENT_DATE AND rc.idsucursal = s.idsucursal) as ingreso_revendedores,
                (SELECT COALESCE(SUM(
                    GREATEST(0, (rd.cantidadentregada - rd.cantidaddevuelta) - COALESCE(rd.cantidadsincomision, 0)) * rd.comisionunitaria
                ), 0) 
                FROM revendedorcontroldetalle rd 
                JOIN revendedorcontrol rc ON rd.idrevendedorcontrol = rc.idrevendedorcontrol 
                WHERE rc.estado = 1 AND rc.fecha = CURRENT_DATE AND rc.idsucursal = s.idsucursal) as comisiones_hoy,
                CASE WHEN s.central = 1 THEN (SELECT COALESCE(SUM(preciototal), 0) FROM compra WHERE fechacompra = CURRENT_DATE AND estado = 1) ELSE 0 END as compras,
                (SELECT COALESCE(SUM(monto), 0) FROM gasto WHERE fecha = CURRENT_DATE AND estado = 1 AND idsucursal = s.idsucursal) as gastos_sucursal
            FROM sucursal s
            WHERE ($1::varchar IS NULL OR s.idsucursal = $1) AND s.estado = 1
        `;
 
        // 7. Cronología diaria (Ventas, Compras, Revendedores)
        const sqlVentasDiarias = `
            SELECT fechaventa as fecha, SUM(preciototal) as monto 
            FROM venta 
            WHERE fechaventa BETWEEN $1 AND $2 AND estado = 1 AND ($3::varchar IS NULL OR idsucursal = $3)
            GROUP BY fechaventa ORDER BY fechaventa
        `;

        const sqlComprasDiarias = `
            SELECT fechacompra as fecha, SUM(preciototal) as monto 
            FROM compra 
            WHERE fechacompra BETWEEN $1 AND $2 AND estado = 1
            AND ($3::varchar IS NULL OR EXISTS (SELECT 1 FROM sucursal WHERE idsucursal = $3 AND central = 1))
            GROUP BY fechacompra ORDER BY fechacompra
        `;

        const sqlIngresosRevendedoresDiarios = `
            SELECT rc.fecha, 
                SUM(
                    ((rd.cantidadentregada - rd.cantidaddevuelta - COALESCE(pa.total_cantidad_ajustada, 0)) * rd.precioventa) +
                    COALESCE(pa.total_venta_ajustada, 0) -
                    GREATEST(0, (rd.cantidadentregada - rd.cantidaddevuelta) - COALESCE(rd.cantidadsincomision, 0)) * rd.comisionunitaria
                ) as monto_neto,
                SUM(
                    GREATEST(0, (rd.cantidadentregada - rd.cantidaddevuelta) - COALESCE(rd.cantidadsincomision, 0)) * rd.comisionunitaria
                ) as monto_comisiones
            FROM revendedorcontroldetalle rd
            JOIN revendedorcontrol rc ON rd.idrevendedorcontrol = rc.idrevendedorcontrol
            LEFT JOIN (
                SELECT p.idrevendedorcontroldetalle,
                       SUM(p.cantidad) as total_cantidad_ajustada,
                       SUM(p.cantidad * p.precioventa) as total_venta_ajustada
                FROM revendedorcontrolprecio p
                GROUP BY p.idrevendedorcontroldetalle
            ) pa ON pa.idrevendedorcontroldetalle = rd.idrevendedorcontroldetalle
            WHERE rc.estado = 1 AND rc.fecha BETWEEN $1 AND $2 AND ($3::varchar IS NULL OR rc.idsucursal = $3)
            GROUP BY rc.fecha ORDER BY rc.fecha
        `;

        const sqlGastosDiarios = `
            SELECT fecha, SUM(monto) as monto 
            FROM gasto 
            WHERE fecha BETWEEN $1 AND $2 AND estado = 1 AND ($3::varchar IS NULL OR idsucursal = $3)
            GROUP BY fecha ORDER BY fecha
        `;

        const sqlGastoExtraDiario = `
            SELECT fecha, SUM(COALESCE(gastoextra, 0)) as total
            FROM revendedorcontrol
            WHERE estado = 1 AND fecha BETWEEN $1 AND $2 AND ($3::varchar IS NULL OR idsucursal = $3)
            GROUP BY fecha ORDER BY fecha
        `;

        const [sucRaw, ingRaw, revRaw, gastRaw, salRaw, compRaw, vDiariasRaw, cDiariasRaw, revDiariosRaw, gDiariosRaw, ggRaw, ggDetRaw, hoyRaw, gastoExtraRevRaw, gastoExtraDiarioRaw] = await Promise.all([
            Venta.query(sqlSucursales, [sucursalId]),
            Venta.query(sqlIngresosTienda, params),
            Venta.query(sqlRevendedores, params),
            Venta.query(sqlGastos, params),
            Venta.query(sqlSalarios, params),
            Venta.query(sqlCompras, params),
            Venta.query(sqlVentasDiarias, params),
            Venta.query(sqlComprasDiarias, params),
            Venta.query(sqlIngresosRevendedoresDiarios, params),
            Venta.query(sqlGastosDiarios, params),
            Venta.query(sqlGastosGenerales, [fechadesde, fechahasta]),
            Venta.query(sqlGastosGeneralesDetalle, [fechadesde, fechahasta]),
            Venta.query(sqlHoy, [sucursalId]),
            Venta.query(sqlGastoExtraRev, params),
            Venta.query(sqlGastoExtraDiario, params)
        ]);

        const totalGastosGenerales = Number(ggRaw[0]?.total || 0);
        const cantidadGastosGenerales = Number(ggRaw[0]?.cantidad || 0);
        const totalComprasRango = sucursalId ? 0 : Number(compRaw[0].total);

        // Procesar Ganancia de Hoy (Separada por Sucursal)
        const resumenHoy = hoyRaw.map((dataHoy: any) => {
            const gastoExtraHoy = gastoExtraRevRaw.find((r: any) => r.idsucursal === dataHoy.idsucursal)?.total || 0;
            const ingresosHoy = Number(dataHoy.venta_tienda) + Number(dataHoy.ingreso_revendedores);
            const comisionesPagadasAEmpleados = Number(dataHoy.comisiones_hoy);
            const ventaAmbulanteBruta = Number(dataHoy.ingreso_revendedores) + Number(dataHoy.comisiones_hoy);
            const gananciaPanaderiaAmbulantes = Number(dataHoy.ingreso_revendedores) - Number(gastoExtraHoy);
            const gananciaLimpiaPanaderia = Number(dataHoy.ingreso_revendedores) - Number(gastoExtraHoy);
            // Compras solo si es TODOS (sucursalId es null)
            const comprasHoy = sucursalId ? 0 : Number(dataHoy.compras);
            const egresosHoy = comprasHoy + Number(dataHoy.gastos_sucursal);
            
            return {
                sucursal: dataHoy.sucursal,
                idsucursal: dataHoy.idsucursal,
                fechaActual: new Date().toISOString().split('T')[0],
                ingresos: {
                    gananciaVentasTienda: Number(dataHoy.venta_tienda),
                    ingresoRevendedoresLimpio: Number(dataHoy.ingreso_revendedores),
                    ventaAmbulanteBruta,
                    gananciaPanaderiaAmbulantes,
                    gananciaLimpiaPanaderia,
                    totalIngresosBakery: ingresosHoy
                },
                egresos: { 
                    comprasInsumos: comprasHoy,
                    gastosOperativos: Number(dataHoy.gastos_sucursal),
                    comisionesPagadasAEmpleados,
                    totalEgresos: egresosHoy
                },
                utilidadLimpiaDelDia: ingresosHoy - egresosHoy
            };
        });

        // Mapear resultados por sucursal (Reporte de Rango)
        const reporteSucursales = sucRaw.map((s: any) => {
            const ing = ingRaw.find((r: any) => r.idsucursal === s.idsucursal)?.total || 0;
            const rev = revRaw.find((r: any) => r.idsucursal === s.idsucursal) || { venta_bruta: 0, comisiones: 0 };
            const gast = gastRaw.find((r: any) => r.idsucursal === s.idsucursal) || { total: 0, detalle: [] };
            const sal = salRaw.find((r: any) => r.idsucursal === s.idsucursal) || { total: 0, planilla: [] };
            const gastoExtraSuc = gastoExtraRevRaw.find((r: any) => r.idsucursal === s.idsucursal)?.total || 0;

            const ingresosTienda = Number(ing);
            const ventaRevendedorBruta = Number(rev.venta_bruta);
            const comisionesPagadas = Number(rev.comisiones);
            const gananciaLimpiaRevendedores = ventaRevendedorBruta - comisionesPagadas - Number(gastoExtraSuc);
            
            const ingresosTotalesSuc = ingresosTienda + gananciaLimpiaRevendedores;
            const egresosSuc = Number(gast.total) + Number(sal.total); 

            return {
                sucursal: s.nombre,
                idsucursal: s.idsucursal,
                ingresos: {
                    totalGananciaBakery: ingresosTotalesSuc,
                    detalle: { 
                        ingresosVentaTienda: ingresosTienda, 
                        ventaRevendedorBruta: ventaRevendedorBruta, 
                        ventaAmbulanteBruta: ventaRevendedorBruta,
                        gananciaLimpiaRevendedores: gananciaLimpiaRevendedores,
                        gananciaPanaderiaAmbulantes: gananciaLimpiaRevendedores,
                        gananciaLimpiaPanaderia: gananciaLimpiaRevendedores
                    }
                },
                egresos: {
                    totalGastos: egresosSuc,
                    detalle: {
                        gastosOperativos: Number(gast.total),
                        salarios: Number(sal.total),
                        comisionesPagadas: comisionesPagadas,
                        comisionesPagadasAEmpleados: comisionesPagadas,
                        listaGastos: gast.detalle,
                        planilla: sal.planilla
                    }
                },
                utilidadOperativa: ingresosTotalesSuc - egresosSuc
            };
        });

        // Consolidar cronología
        const cronologia: any = {};
        vDiariasRaw.forEach((v: any) => { 
            const f = v.fecha.toISOString().split('T')[0];
            cronologia[f] = { ...cronologia[f], ventaTienda: Number(v.monto) };
        });
        cDiariasRaw.forEach((c: any) => {
            const f = c.fecha.toISOString().split('T')[0];
            // Compras solo si es TODOS
            cronologia[f] = { ...cronologia[f], compra: sucursalId ? 0 : Number(c.monto) };
        });
        revDiariosRaw.forEach((rev: any) => {
            const f = rev.fecha.toISOString().split('T')[0];
            cronologia[f] = { 
                ...cronologia[f], 
                gananciaRevendedores: Number(rev.monto_neto),
                comisionesPagadas: Number(rev.monto_comisiones)
            };
        });
        gDiariosRaw.forEach((g: any) => {
            const f = g.fecha.toISOString().split('T')[0];
            cronologia[f] = { ...cronologia[f], gastosSucursal: Number(g.monto) };
        });
        gastoExtraDiarioRaw.forEach((ge: any) => {
            const f = ge.fecha.toISOString().split('T')[0];
            cronologia[f] = { ...cronologia[f], gastoExtraRevendedores: Number(ge.total) };
        });

        // Generar rango completo de fechas para incluir ceros
        const listaFechas: string[] = [];
        let fechaActualLoop = new Date(fechadesde as string);
        const fechaFinLoop = new Date(fechahasta as string);

        while (fechaActualLoop <= fechaFinLoop) {
            listaFechas.push(fechaActualLoop.toISOString().split('T')[0]);
            fechaActualLoop.setDate(fechaActualLoop.getDate() + 1);
        }

        const evolucionDiaria = listaFechas.map(fecha => {
            const dia = cronologia[fecha] || {};
            const vTienda = dia.ventaTienda || 0;
            const gRevendedores = (dia.gananciaRevendedores || 0) - (dia.gastoExtraRevendedores || 0);
            const comPagadas = dia.comisionesPagadas || 0;
            const compra = dia.compra || 0;
            const gSucursal = dia.gastosSucursal || 0;

            const ingresoTotal = vTienda + gRevendedores;
            const egresoTotal = compra + gSucursal;

            return {
                fecha,
                ingresos: {
                    gananciaVentaTienda: vTienda,
                    gananciaRevendedoresLimpia: gRevendedores,
                    ventaAmbulanteBruta: gRevendedores + comPagadas,
                    gananciaPanaderiaAmbulantes: gRevendedores,
                    gananciaLimpiaPanaderia: gRevendedores,
                    comisionesPagadas: comPagadas,
                    comisionesPagadasAEmpleados: comPagadas,
                    totalIngresosBakery: ingresoTotal
                },
                egresos: {
                    comprasInsumos: compra,
                    gastosOperativos: gSucursal,
                    totalEgresos: egresoTotal
                },
                utilidadLimpiaDia: ingresoTotal - egresoTotal
            };
        });

        // Resumen General
        const totalGastosOp = reporteSucursales.reduce((acc: number, curr: any) => acc + curr.egresos.totalGastos, 0);
        const gananciaOp = reporteSucursales.reduce((acc: number, curr: any) => acc + curr.utilidadOperativa, 0);
        const resumenGeneral = {
            totalIngresos: reporteSucursales.reduce((acc: number, curr: any) => acc + curr.ingresos.totalGananciaBakery, 0),
            totalEgresosOperativos: totalGastosOp,
            totalGastosGenerales: totalGastosGenerales,
            cantidadGastosGenerales: cantidadGastosGenerales,
            totalComprasCentral: totalComprasRango,
            gananciaNetaFinal: gananciaOp - totalComprasRango - totalGastosGenerales
        };

        return res.json({
            metadatos: { desde: fechadesde, hasta: fechahasta, sucursal: idsucursal || "TODAS" },
            resumenHoy, 
            reportePorSucursal: reporteSucursales,
            evolucionDiaria,
            gastosGenerales: ggDetRaw,
            resumenGeneral
        });

    } catch (error) {
        console.error("Error en reporte financiero por sucursales:", error);
        return res.status(500).json({ message: "Error interno" });
    }
};
