"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReportePreciosHistorico = exports.getReporteComprasConsolidado = void 0;
const Compra_1 = require("../../entities/Compra");
/**
 * REPORTE CONSOLIDADO DE COMPRAS (Requerimientos 15-17 de prompreporte.txt)
 */
const getReporteComprasConsolidado = async (req, res) => {
    try {
        const { fechadesde, fechahasta, idproveedor, idinsumo } = req.query;
        if (!fechadesde || !fechahasta)
            return res.status(400).json({ message: "Fechas obligatorias." });
        let filterIdx = 1;
        const params = [];
        const wheres = ["c.fechacompra BETWEEN $" + (filterIdx++) + " AND $" + (filterIdx++), "c.estado = 1"];
        params.push(fechadesde, fechahasta);
        if (idproveedor && idproveedor !== 'TODOS') {
            wheres.push(`c.idproveedor = $${filterIdx++}`);
            params.push(idproveedor);
        }
        if (idinsumo && idinsumo !== 'TODOS') {
            wheres.push(`dc.idinsumo = $${filterIdx++}`);
            params.push(idinsumo);
        }
        const baseWhere = `WHERE ${wheres.join(" AND ")}`;
        const sqlDetalle = `
            SELECT
                p.nombre || ' ' || COALESCE(p.apellidopaterno, '') as proveedor,
                i.nombre as insumo,
                um.nombre as medida,
                um.abreviatura as medida_abreviatura,
                im.cantidad as peso_insumo,
                SUM(dc.cantidad) as cantidad,
                SUM(dc.preciototal) as inversion
            FROM detallecompra dc
            JOIN compra c ON dc.idcompra = c.idcompra
            JOIN proveedor prov ON c.idproveedor = prov.idproveedor
            JOIN persona p ON prov.idpersona = p.idpersona
            JOIN insumo i ON dc.idinsumo = i.idinsumo
            LEFT JOIN insumomedida im ON dc.idinsumomedida = im.idinsumomedida
            LEFT JOIN unidadmedida um ON im.idunidadmedida = um.idunidadmedida
            ${baseWhere}
            GROUP BY prov.idproveedor, p.nombre, p.apellidopaterno, i.idinsumo, i.nombre, um.nombre, um.abreviatura, im.cantidad
            ORDER BY proveedor, cantidad DESC
        `;
        const sqlTotal = `
            SELECT SUM(dc.preciototal) as total_gastos
            FROM detallecompra dc
            JOIN compra c ON dc.idcompra = c.idcompra
            ${baseWhere}
        `;
        const [rows, totalResult] = await Promise.all([
            Compra_1.Compra.query(sqlDetalle, [...params]),
            Compra_1.Compra.query(sqlTotal, [...params])
        ]);
        const total_gastos = totalResult[0]?.total_gastos ?? 0;
        const detalleMap = new Map();
        for (const row of rows) {
            const key = row.proveedor;
            if (!detalleMap.has(key)) {
                detalleMap.set(key, {
                    proveedor: row.proveedor,
                    insumos: [],
                    total_proveedor: 0
                });
            }
            const entry = detalleMap.get(key);
            entry.insumos.push({
                insumo: row.insumo,
                medida: row.medida,
                medida_abreviatura: row.medida_abreviatura,
                peso_insumo: row.peso_insumo,
                cantidad: Number(row.cantidad),
                inversion: Number(row.inversion)
            });
            entry.total_proveedor += Number(row.inversion);
        }
        const detalle = Array.from(detalleMap.values());
        return res.json({ detalle, total_gastos, metadatos: { desde: fechadesde, hasta: fechahasta } });
    }
    catch (error) {
        console.error("Error en reporte de compras:", error);
        return res.status(500).json({ message: "Error interno" });
    }
};
exports.getReporteComprasConsolidado = getReporteComprasConsolidado;
/**
 * REPORTE HISTÓRICO DE PRECIOS
 */
const getReportePreciosHistorico = async (req, res) => {
    try {
        const { idinsumo, idproveedor, fechadesde, fechahasta } = req.query;
        const params = [];
        let filterIdx = 1;
        let insumoCond = "";
        if (idinsumo && idinsumo !== 'TODOS') {
            insumoCond = ` AND dc.idinsumo = $${filterIdx++}`;
            params.push(idinsumo);
        }
        let provCond = "";
        if (idproveedor && idproveedor !== 'TODOS') {
            provCond = ` AND c.idproveedor = $${filterIdx++}`;
            params.push(idproveedor);
        }
        let dateCond = "";
        if (fechadesde && fechahasta) {
            dateCond = ` AND c.fechacompra BETWEEN $${filterIdx++} AND $${filterIdx++}`;
            params.push(fechadesde, fechahasta);
        }
        const sqlPrecios = `
            SELECT 
                c.idcompra,
                p.nombre || ' ' || COALESCE(p.apellidopaterno, '') as proveedor, 
                c.fechacompra as fecha, 
                c.preciototal as total_compra,
                JSON_AGG(JSON_BUILD_OBJECT(
                    'insumo', i.nombre, 
                    'imagen', i.imagen, 
                    'medida', um.nombre,  
                    'abreviatura', um.abreviatura, 
                    'cantidad', dc.cantidad, 
                    'precio_unitario', dc.precio,
                    'precio_total', dc.preciototal
                )) as detalles
            FROM detallecompra dc 
            JOIN compra c ON dc.idcompra = c.idcompra 
            JOIN proveedor prov ON c.idproveedor = prov.idproveedor 
            JOIN persona p ON prov.idpersona = p.idpersona
            JOIN insumo i ON dc.idinsumo = i.idinsumo
            LEFT JOIN insumomedida im ON dc.idinsumomedida = im.idinsumomedida
            LEFT JOIN unidadmedida um ON im.idunidadmedida = um.idunidadmedida
            WHERE c.estado = 1 ${insumoCond} ${provCond} ${dateCond}
            GROUP BY c.idcompra, p.nombre, p.apellidopaterno, c.fechacompra, c.preciototal
            ORDER BY c.fechacompra ASC
        `;
        const data = await Compra_1.Compra.query(sqlPrecios, params);
        return res.json(data);
    }
    catch (error) {
        console.error("Error en historico precios:", error);
        return res.status(500).json({ message: "Error interno" });
    }
};
exports.getReportePreciosHistorico = getReportePreciosHistorico;
