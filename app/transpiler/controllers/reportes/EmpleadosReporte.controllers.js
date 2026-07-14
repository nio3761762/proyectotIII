"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReporteVendedoresLiquidacion = exports.getReporteEmpleadosOperativo = void 0;
const Empleado_1 = require("../../entities/Empleado");
const Venta_1 = require("../../entities/Venta");
/**
 * REPORTE OPERATIVO DE EMPLEADOS (Horas y Producción)
 */
const getReporteEmpleadosOperativo = async (req, res) => {
    try {
        const { fechadesde, fechahasta, idempleado } = req.query;
        if (!fechadesde || !fechahasta)
            return res.status(400).json({ message: "Fechas obligatorias." });
        const params = [fechadesde, fechahasta];
        let filterIdx = 3;
        let empCond = "";
        if (idempleado && idempleado !== 'TODOS') {
            empCond = ` AND pe.idempleado = $${filterIdx++}`;
            params.push(idempleado);
        }
        const sqlProduccion = `
            SELECT p.nombre || ' ' || COALESCE(p.apellidopaterno, '') as empleado, SUM(pe.horas) as horas_totales, SUM(pe.costototal) as costo_mano_obra, COUNT(pe.idproduccion) as nro_producciones
            FROM produccion_empleado pe JOIN empleado e ON pe.idempleado = e.idempleado JOIN persona p ON e.idpersona = p.idpersona JOIN produccion prod ON pe.idproduccion = prod.idproduccion
            WHERE prod.fechaproduccion BETWEEN $1 AND $2 ${empCond}
            GROUP BY e.idempleado, p.nombre, p.apellidopaterno
        `;
        const data = await Empleado_1.Empleado.query(sqlProduccion, params);
        return res.json(data);
    }
    catch (error) {
        console.error("Error en reporte operativo:", error);
        return res.status(500).json({ message: "Error interno" });
    }
};
exports.getReporteEmpleadosOperativo = getReporteEmpleadosOperativo;
/**
 * REPORTE DE LIQUIDACIÓN Y RENTABILIDAD DE VENDEDORES
 */
const getReporteVendedoresLiquidacion = async (req, res) => {
    try {
        const { fechadesde, fechahasta, idempleado } = req.query;
        if (!fechadesde || !fechahasta)
            return res.status(400).json({ message: "Fechas obligatorias." });
        const params = [fechadesde, fechahasta];
        let filterIdx = 3;
        let empCondVenta = "";
        let empCondTransf = "";
        if (idempleado && idempleado !== 'TODOS') {
            empCondVenta = ` AND e.idempleado = $${filterIdx}`;
            empCondTransf = ` AND emp.idempleado = $${filterIdx}`;
            params.push(idempleado);
            filterIdx++;
        }
        const sqlVentas = `
            SELECT u.idusuario, p.nombre || ' ' || COALESCE(p.apellidopaterno, '') as vendedor, COUNT(v.idventa) as nro_ventas, SUM(v.preciototal) as monto_vendido,
                SUM((SELECT SUM(dv.cantidad * COALESCE(c.preciocomision, 0)) FROM detalleventa dv LEFT JOIN comision c ON dv.idproductomedida = c.idproductomedida AND c.estado = 1 WHERE dv.idventa = v.idventa)) as comisiones_totales
            FROM venta v JOIN usuario u ON v.idusuario = u.idusuario JOIN empleado e ON u.idpersona = e.idpersona JOIN persona p ON e.idpersona = p.idpersona
            WHERE v.fechaventa BETWEEN $1 AND $2 AND v.estado = 1 ${empCondVenta}
            GROUP BY u.idusuario, p.nombre, p.apellidopaterno
        `;
        const sqlBalance = `
            SELECT p.nombre as producto, SUM(dt.cantidad) as entregado,
                COALESCE((SELECT SUM(dv.cantidad) FROM detalleventa dv JOIN venta v ON dv.idventa = v.idventa WHERE dv.idproducto = p.idproducto 
                          AND v.fechaventa BETWEEN $1 AND $2 AND v.idusuario IN (SELECT idusuario FROM usuario WHERE idpersona = emp.idpersona) AND v.estado = 1), 0) as vendido
            FROM detalle_transferencia dt JOIN transferencia t ON dt.idtransferencia = t.idtransferencia JOIN producto p ON dt.idproducto = p.idproducto JOIN empleado emp ON t.idempleado = emp.idempleado
            WHERE t.tipo = 'VENDEDOR' AND t.fecha BETWEEN $1 AND $2 ${empCondTransf}
            GROUP BY p.idproducto, p.nombre, emp.idpersona
        `;
        const [ventas, balance] = await Promise.all([
            Venta_1.Venta.query(sqlVentas, params),
            Venta_1.Venta.query(sqlBalance, params)
        ]);
        return res.json({ ventas, balance, metadatos: { desde: fechadesde, hasta: fechahasta } });
    }
    catch (error) {
        console.error("Error en reporte liquidacion:", error);
        return res.status(500).json({ message: "Error interno" });
    }
};
exports.getReporteVendedoresLiquidacion = getReporteVendedoresLiquidacion;
