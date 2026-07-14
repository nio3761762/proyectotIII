"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReporteKardex = exports.getReporteInventarioConsolidado = void 0;
const Inventario_1 = require("../../entities/Inventario");
/**
 * REPORTE CONSOLIDADO DE INVENTARIO (Requerimientos 7-9 de prompreporte.txt)
 * Incluye: Stock actual, alertas de stock bajo e inventario valorizado.
 */
const getReporteInventarioConsolidado = async (req, res) => {
    try {
        const { idsucursal, tipo, iditem } = req.query; // tipo: 'INSUMO', 'PRODUCTO' o 'TODOS'
        const params = [];
        let filterIdx = 1;
        let sucursalCond = "";
        if (idsucursal && idsucursal !== 'TODOS') {
            sucursalCond = ` AND inv.idsucursal = $${filterIdx++}`;
            params.push(idsucursal);
        }
        let tipoCond = "";
        if (tipo === 'INSUMO') {
            tipoCond = " AND inv.idinsumo IS NOT NULL";
            if (iditem) {
                tipoCond += ` AND inv.idinsumo = $${filterIdx++}`;
                params.push(iditem);
            }
        }
        else if (tipo === 'PRODUCTO') {
            tipoCond = " AND inv.idproducto IS NOT NULL";
            if (iditem) {
                tipoCond += ` AND inv.idproducto = $${filterIdx++}`;
                params.push(iditem);
            }
        }
        // Agregación a nivel de Base de Datos para mayor eficiencia
        // Obtenemos todas las medidas disponibles (equivalencias) para cada item
        const sqlInventario = `
            SELECT 
                COALESCE(i.nombre, p.nombre) as nombre,
                COALESCE(i.imagen, p.imagen) as imagen,
                CASE WHEN i.idinsumo IS NOT NULL THEN 'INSUMO' ELSE 'PRODUCTO' END as tipo_item,
                s.nombre as sucursal,
                SUM(CAST(inv.stock AS NUMERIC)) as cantidad_base,
                COALESCE(i.stockminimo, p.stockminimo, 0) as stock_minimo,
                AVG(CAST(inv.costounitario AS NUMERIC)) as costo_promedio,
                COALESCE(
                    (SELECT json_agg(json_build_object(
                        'nombre', um_sub.nombre, 
                        'abreviatura', um_sub.abreviatura,
                        'factor', im_sub.cantidad, 
                        'medida_cantidad', um_sub.cantidad
                     ))
                     FROM insumomedida im_sub
                     JOIN unidadmedida um_sub ON im_sub.idunidadmedida = um_sub.idunidadmedida
                     WHERE im_sub.idinsumo = i.idinsumo AND im_sub.estado = 1),
                    (SELECT json_agg(json_build_object(
                        'nombre', pres_sub.nombre,
                        'abreviatura', pres_sub.abreviatura, 
                        'factor', pm_sub.cantidad,
                        'medida_cantidad', 1
                     ))
                     FROM productomedida pm_sub
                     JOIN presentacion pres_sub ON pm_sub.idpresentacion = pres_sub.idpresentacion
                     WHERE pm_sub.idproducto = p.idproducto AND pm_sub.estado = 1),
                    '[]'::json
                ) as unidades_disponibles
            FROM inventario inv
            LEFT JOIN insumo i ON inv.idinsumo = i.idinsumo
            LEFT JOIN producto p ON inv.idproducto = p.idproducto
            LEFT JOIN sucursal s ON inv.idsucursal = s.idsucursal
            WHERE inv.estado = 1 ${sucursalCond} ${tipoCond}
            GROUP BY s.nombre, i.idinsumo, p.idproducto, i.nombre, p.nombre, i.imagen, p.imagen, i.stockminimo, p.stockminimo
            ORDER BY s.nombre, tipo_item, 1
        `;
        const data = await Inventario_1.Inventario.query(sqlInventario, params);
        const procesado = data.map((item) => {
            const stock_total = Number(item.cantidad_base);
            const stock_minimo = Number(item.stock_minimo);
            const costo_promedio = Number(item.costo_promedio);
            // Calculamos el valor en cada unidad disponible
            const unidades = (item.unidades_disponibles || []).map((u) => {
                const factor = Number(u.factor) || 1;
                const medida_cantidad = Number(u.medida_cantidad) || 1;
                const abreviatura = u.abreviatura || "";
                let presentaciones = 0;
                let resto_unidades = 0;
                let cantidad_calculada = 0;
                if (item.tipo_item === 'PRODUCTO') {
                    // Para productos, dividimos el stock base (unidades) por el factor de la presentación
                    presentaciones = Math.floor(stock_total / factor);
                    resto_unidades = stock_total % factor;
                    cantidad_calculada = stock_total / factor;
                }
                else {
                    // LÓGICA DE DIVISIÓN PARA INSUMOS:
                    // El factor en insumomedida es la cantidad de la unidad de medida (ej: 50 para un saco de 50kg)
                    // medida_cantidad es el factor de conversión a la unidad base (ej: 1000 para Kilo si la base es Gramos)
                    const total_en_medida = stock_total / medida_cantidad;
                    presentaciones = Math.floor(total_en_medida / factor);
                    resto_unidades = Number((total_en_medida % factor).toFixed(2));
                    cantidad_calculada = total_en_medida;
                }
                return {
                    nombre: u.nombre,
                    abreviatura,
                    factor,
                    cantidad_medida: medida_cantidad,
                    cantidad_total: Number(cantidad_calculada.toFixed(2)),
                    presentaciones,
                    resto_unidades,
                    detalle_texto: `${presentaciones} ${u.nombre} y ${resto_unidades} ${item.tipo_item === 'PRODUCTO' ? 'unid.' : abreviatura}`
                };
            });
            return {
                nombre: item.nombre,
                imagen: item.imagen,
                tipo_item: item.tipo_item,
                sucursal: item.sucursal,
                stock_base: stock_total,
                stock_minimo,
                costo_promedio,
                valor_total: stock_total * costo_promedio,
                unidades, // Array con todas las conversiones disponibles (Kilo, Quintal, etc.)
                estado: stock_total <= 0 ? 'AGOTADO' : (stock_total <= stock_minimo ? 'STOCK BAJO' : 'OK')
            };
        });
        // Agrupar por sucursal para el formato de respuesta (lista corta de sucursales)
        const grouped = procesado.reduce((acc, item) => {
            const { sucursal, tipo_item } = item;
            if (!acc[sucursal]) {
                acc[sucursal] = {
                    sucursal,
                    insumos: [],
                    productos: []
                };
            }
            if (tipo_item === 'INSUMO') {
                acc[sucursal].insumos.push(item);
            }
            else {
                acc[sucursal].productos.push(item);
            }
            return acc;
        }, {});
        const sucursales = Object.values(grouped);
        return res.json({
            metadatos: { sucursal: idsucursal || "TODAS", generadoEn: new Date().toISOString() },
            sucursales,
            resumen: {
                totalItems: procesado.length,
                itemsAgotados: procesado.filter((i) => i.estado === 'AGOTADO').length,
                itemsStockBajo: procesado.filter((i) => i.estado === 'STOCK BAJO').length,
                valorTotalInventario: procesado.reduce((acc, curr) => acc + curr.valor_total, 0)
            }
        });
    }
    catch (error) {
        console.error("Error en reporte de inventario:", error);
        return res.status(500).json({ message: "Error al generar reporte de inventario." });
    }
};
exports.getReporteInventarioConsolidado = getReporteInventarioConsolidado;
/**
 * REPORTE KARDEX (Requerimiento 10 de prompreporte.txt)
 * Proporciona el historial detallado de movimientos. Filtros opcionales.
 */
const getReporteKardex = async (req, res) => {
    try {
        const { iditem, tipo, idsucursal, fechadesde, fechahasta } = req.query;
        const params = [];
        let filterIdx = 1;
        let dynamicWhere = "WHERE 1=1";
        if (tipo === 'INSUMO') {
            dynamicWhere += " AND mi.idinsumo IS NOT NULL";
            if (iditem) {
                dynamicWhere += ` AND mi.idinsumo = $${filterIdx++}`;
                params.push(iditem);
            }
        }
        else if (tipo === 'PRODUCTO') {
            dynamicWhere += " AND mi.idproducto IS NOT NULL";
            if (iditem) {
                dynamicWhere += ` AND mi.idproducto = $${filterIdx++}`;
                params.push(iditem);
            }
        }
        if (idsucursal && idsucursal !== 'TODOS') {
            dynamicWhere += ` AND mi.idsucursal = $${filterIdx++}`;
            params.push(idsucursal);
        }
        if (fechadesde) {
            dynamicWhere += ` AND mi.fecha >= $${filterIdx++}::date`;
            params.push(fechadesde);
        }
        if (fechahasta) {
            // mi.fecha::date asegura que se compare solo la parte de la fecha, 
            // incluyendo todo el día de 'fechahasta'
            dynamicWhere += ` AND mi.fecha::date <= $${filterIdx++}`;
            params.push(fechahasta);
        }
        // Consulta detallada con Saldo Acumulado (Kardex)
        // PARTITION BY asegura que el saldo se calcule independientemente para cada item
        const sqlKardex = `
            SELECT 
                mi.fecha, 
                mi.tipo as tipo_movimiento, 
                mi.idreferencia,
                s.nombre as sucursal,
                COALESCE(i.nombre, p.nombre) as item_nombre,
                CASE WHEN i.idinsumo IS NOT NULL THEN 'INSUMO' ELSE 'PRODUCTO' END as tipo_item,
                CASE WHEN mi.cantidad > 0 THEN mi.cantidad ELSE 0 END as entrada,
                CASE WHEN mi.cantidad < 0 THEN ABS(mi.cantidad) ELSE 0 END as salida,
                CAST(mi.costounitario AS NUMERIC) as costo_unitario,
                CAST(mi.costototal AS NUMERIC) as costo_total,
                SUM(mi.cantidad) OVER (PARTITION BY mi.idinsumo, mi.idproducto ORDER BY mi.fecha ASC, mi.idmovimiento ASC) as saldo,
                COALESCE(
                    (SELECT json_agg(json_build_object(
                        'nombre', um_sub.nombre, 
                        'abreviatura', um_sub.abreviatura,
                        'factor', im_sub.cantidad, 
                        'medida_cantidad', um_sub.cantidad
                     ))
                     FROM insumomedida im_sub
                     JOIN unidadmedida um_sub ON im_sub.idunidadmedida = um_sub.idunidadmedida
                     WHERE im_sub.idinsumo = i.idinsumo AND im_sub.estado = 1),
                    (SELECT json_agg(json_build_object(
                        'nombre', pres_sub.nombre,
                        'abreviatura', pres_sub.abreviatura, 
                        'factor', pm_sub.cantidad,
                        'medida_cantidad', 1
                     ))
                     FROM productomedida pm_sub
                     JOIN presentacion pres_sub ON pm_sub.idpresentacion = pres_sub.idpresentacion
                     WHERE pm_sub.idproducto = p.idproducto AND pm_sub.estado = 1),
                    '[]'::json
                ) as unidades_disponibles
            FROM movimiento_inventario mi
            JOIN sucursal s ON mi.idsucursal = s.idsucursal
            LEFT JOIN insumo i ON mi.idinsumo = i.idinsumo
            LEFT JOIN producto p ON mi.idproducto = p.idproducto
            ${dynamicWhere}
            ORDER BY mi.fecha DESC, mi.idmovimiento DESC
        `;
        const movimientos = await Inventario_1.Inventario.query(sqlKardex, params);
        // Procesar y agrupar por tipo (INSUMO / PRODUCTO)
        const procesado = movimientos.reduce((acc, m) => {
            const entrada_base = Number(m.entrada);
            const salida_base = Number(m.salida);
            const saldo_base = Number(m.saldo);
            // Calcular conversiones para cada unidad disponible
            const unidades = (m.unidades_disponibles || []).map((u) => {
                const factor = Number(u.factor) || 1;
                const medida_cantidad = Number(u.medida_cantidad) || 1;
                const abreviatura = u.abreviatura || "";
                let entrada_calc, salida_calc;
                if (m.tipo_item === 'PRODUCTO') {
                    entrada_calc = entrada_base / factor;
                    salida_calc = salida_base / factor;
                }
                else {
                    entrada_calc = entrada_base / medida_cantidad;
                    salida_calc = salida_base / medida_cantidad;
                }
                return {
                    unidad: u.nombre,
                    abreviatura: abreviatura,
                    // Variables solicitadas: entrada, salida y saldo convertidos
                    entrada: Number(entrada_calc.toFixed(2)),
                    salida: Number(salida_calc.toFixed(2)),
                    // Detalles de la división (Solo para Insumos)
                    factor_presentacion: factor
                };
            });
            const itemProcesado = {
                ...m,
                entrada: entrada_base,
                salida: salida_base,
                costo_unitario: Number(m.costo_unitario),
                costo_total: Number(m.costo_total),
                saldo: saldo_base,
                unidades
            };
            if (m.tipo_item === 'INSUMO')
                acc.insumos.push(itemProcesado);
            else
                acc.productos.push(itemProcesado);
            return acc;
        }, { insumos: [], productos: [] });
        return res.json({
            metadatos: {
                reporte: "Historial de Movimientos (Kardex)",
                filtros: { iditem, tipo, idsucursal, fechadesde, fechahasta },
                totalMovimientos: movimientos.length,
                generadoEn: new Date().toISOString()
            },
            insumos: procesado.insumos,
            productos: procesado.productos
        });
    }
    catch (error) {
        console.error("Error en reporte Kardex:", error);
        return res.status(500).json({ message: "Error al generar Kardex." });
    }
};
exports.getReporteKardex = getReporteKardex;
