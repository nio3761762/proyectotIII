"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReporteVentasDetallado = exports.getReportePedidosDetallado = exports.getReportePedidosConsolidado = exports.getReporteVentasConsolidado = void 0;
const Pedido_1 = require("../../entities/Pedido");
const Venta_1 = require("../../entities/Venta");
/**
 * REPORTE CONSOLIDADO DE VENTAS (Requerimientos 1-6 de prompreporte.txt)
 * Incluye: Por período, por sucursal, productos top, promociones top, métodos de pago y usuarios.
 */
const getReporteVentasConsolidado = async (req, res) => {
    try {
        const { fechadesde, fechahasta, idsucursal, idusuario } = req.query;
        if (!fechadesde || !fechahasta) {
            return res.status(400).json({ message: "Fechas obligatorias (fechadesde, fechahasta)." });
        }
        // Parámetros para consultas
        const params = [fechadesde, fechahasta];
        let filterIdx = 3;
        let sucursalCond = "";
        if (idsucursal && idsucursal !== 'TODOS') {
            sucursalCond = ` AND v.idsucursal = $${filterIdx++}`;
            params.push(idsucursal);
        }
        let usuarioCond = "";
        if (idusuario && idusuario !== 'TODOS') {
            usuarioCond = ` AND v.idusuario = $${filterIdx++}`;
            params.push(idusuario);
        }
        const filterCond = `${sucursalCond} ${usuarioCond}`;
        const baseWhere = `WHERE v.fechaventa BETWEEN $1 AND $2 AND v.estado = 1`;
        // 1. Reporte por Período
        const sqlPeriodo = `
            SELECT v.fechaventa as fecha, COUNT(v.idventa) as cant_ventas, SUM(v.preciototal) as total
            FROM venta v ${baseWhere} ${filterCond} 
            GROUP BY v.fechaventa ORDER BY v.fechaventa ASC
        `;
        // 2. Reporte por Sucursal
        const sqlSucursal = `
            SELECT s.nombre, COUNT(v.idventa) as cant_ventas, SUM(v.preciototal) as total,
                   (SUM(v.preciototal) * 100.0 / NULLIF((SELECT SUM(preciototal) FROM venta v ${baseWhere} ${usuarioCond}), 0)) as participacion
            FROM venta v JOIN sucursal s ON v.idsucursal = s.idsucursal
            ${baseWhere} ${filterCond}
            GROUP BY s.idsucursal, s.nombre
        `;
        // 3. Productos Más Vendidos (CONSOLIDADO POR PRODUCTO, sumando todas las presentaciones)
        const sqlProductos = `
    WITH all_product_sales AS (

        -- Ventas directas (Unidad)
        SELECT
            p.idproducto,
            p.nombre,
            p.imagen,
            'UNIDAD' as presentacion,
            1 as unidades_por_presentacion,
            dv.cantidad as unidades_fisicas,
            dv.cantidad as total_unidades_base,
            (dv.cantidad * dv.precio) as ingresos,
            v.fechaventa,
            v.idsucursal,
            v.idusuario,
            v.estado
        FROM detalleventa dv
        JOIN venta v ON dv.idventa = v.idventa
        JOIN producto p ON dv.idproducto = p.idproducto
        WHERE dv.idproductomedida IS NULL
          AND dv.idpromocion IS NULL

        UNION ALL

        -- Ventas por presentación
        SELECT
            p.idproducto,
            p.nombre,
            p.imagen,
            pres.nombre as presentacion,
            pm.cantidad as unidades_por_presentacion,
            dv.cantidad as unidades_fisicas,
            (dv.cantidad * pm.cantidad) as total_unidades_base,
            (dv.cantidad * dv.precio) as ingresos,
            v.fechaventa,
            v.idsucursal,
            v.idusuario,
            v.estado
        FROM detalleventa dv
        JOIN venta v ON dv.idventa = v.idventa
        JOIN productomedida pm ON dv.idproductomedida = pm.idproductomedida
        JOIN producto p ON pm.idproducto = p.idproducto
        JOIN presentacion pres ON pm.idpresentacion = pres.idpresentacion
        WHERE dv.idpromocion IS NULL
    ),

    summary_per_presentation AS (
        SELECT
            idproducto,
            nombre,
            imagen,
            presentacion,
            unidades_por_presentacion,
            SUM(unidades_fisicas) as cant_fisica,
            SUM(total_unidades_base) as cant_base,
            SUM(ingresos) as total_ingresos
        FROM all_product_sales v
        ${baseWhere}
        ${filterCond}
        GROUP BY
            idproducto,
            nombre,
            imagen,
            presentacion,
            unidades_por_presentacion
    )

    SELECT
        idproducto,
        nombre,
        imagen,
        SUM(cant_base) as total_unidades_vendidas,
        SUM(total_ingresos) as ingresos_totales,

        json_agg(
            json_build_object(
                'presentacion', presentacion,
                'unidades_por_presentacion', unidades_por_presentacion,
                'cantidad_vendida', cant_fisica,
                'subtotal_ingresos', total_ingresos
            )
        ) as presentaciones

    FROM summary_per_presentation

    GROUP BY
        idproducto,
        nombre,
        imagen

    ORDER BY total_unidades_vendidas DESC

    LIMIT 20
`;
        // 4. Promociones Más Vendidas (Con detalle de productos)
        const sqlPromociones = `
            SELECT 
                pr.nombre, pr.imagen, 
                SUM(dv.cantidad) as cantidad, 
                SUM(dv.cantidad * dv.precio) as total,
                (
                    SELECT json_agg(json_build_object(
                        'producto', p.nombre,
                        'cantidad_por_promo', prp.cantidad,
                        'presentacion', COALESCE(pres.nombre, 'Unidad'),
                        'total_unidades', (prp.cantidad * COALESCE(pp.cantidad, 1))
                    ))
                    FROM promocionproducto prp
                    JOIN producto p ON prp.idproducto = p.idproducto
                    LEFT JOIN productomedida pp ON prp.idproductomedida = pp.idproductomedida
                    LEFT JOIN presentacion pres ON pp.idpresentacion = pres.idpresentacion
                    WHERE prp.idpromocion = pr.idpromocion
                ) as detalle_productos
            FROM detalleventa dv  
            JOIN venta v ON dv.idventa = v.idventa 
            JOIN promocion pr ON dv.idpromocion = pr.idpromocion
            ${baseWhere} ${filterCond}
            GROUP BY pr.idpromocion, pr.nombre, pr.imagen 
            ORDER BY cantidad DESC
        `;
        // 5. Métodos de Pago
        const sqlPagos = `
            SELECT mp.nombre, COUNT(p.idpago) as cantidad, SUM(p.monto - p.cambio) as total
            FROM pago p JOIN venta v ON p.idventa = v.idventa JOIN metodopago mp ON p.idmetodopago = mp.idmetodopago
            ${baseWhere} ${filterCond}
            GROUP BY mp.idmetodopago, mp.nombre
        `;
        // 6. Por Usuario/Vendedor
        const sqlUsuario = `
            SELECT per.nombre || ' ' || COALESCE(per.apellidopaterno, '') as usuario, COUNT(v.idventa) as cant_ventas, SUM(v.preciototal) as total
            FROM venta v JOIN usuario u ON v.idusuario = u.idusuario JOIN persona per ON u.idpersona = per.idpersona
            ${baseWhere} ${filterCond}
            GROUP BY u.idusuario, per.nombre, per.apellidopaterno ORDER BY total DESC
        `;
        const [periodo, sucursales, productos, promociones, pagos, usuarios] = await Promise.all([
            Venta_1.Venta.query(sqlPeriodo, params),
            Venta_1.Venta.query(sqlSucursal, params),
            Venta_1.Venta.query(sqlProductos, params),
            Venta_1.Venta.query(sqlPromociones, params),
            Venta_1.Venta.query(sqlPagos, params),
            Venta_1.Venta.query(sqlUsuario, params)
        ]);
        // Nota: Los ajustes manuales de params arriba son para asegurar que coincidan con los indices $N. 
        // Refactorizar a un constructor de query params más robusto si es necesario.
        return res.json({
            metadatos: { desde: fechadesde, hasta: fechahasta, sucursal: idsucursal, usuario: idusuario },
            ventasPorPeriodo: periodo,
            ventasPorSucursal: sucursales,
            productosTop: productos,
            promocionesTop: promociones,
            metodosPago: pagos,
            ventasPorUsuario: usuarios
        });
    }
    catch (error) {
        console.error("Error en reporte consolidado de ventas:", error);
        return res.status(500).json({ message: "Error al generar el reporte." });
    }
};
exports.getReporteVentasConsolidado = getReporteVentasConsolidado;
/**
 * REPORTE CONSOLIDADO DE PEDIDOS
 * Incluye: Por período, sucursal, estado, tipo de pedido, productos top y clientes top.
 */
const getReportePedidosConsolidado = async (req, res) => {
    try {
        const { fechadesde, fechahasta, idsucursal, idtipopedido } = req.query;
        if (!fechadesde || !fechahasta) {
            return res.status(400).json({ message: "Fechas obligatorias (fechadesde, fechahasta)." });
        }
        const params = [fechadesde, fechahasta];
        let filterIdx = 3;
        let filterCond = "";
        if (idsucursal && idsucursal !== 'TODOS') {
            filterCond += ` AND p.idsucursal = $${filterIdx++}`;
            params.push(idsucursal);
        }
        if (idtipopedido && idtipopedido !== 'TODOS') {
            filterCond += ` AND p.idtipopedido = $${filterIdx++}`;
            params.push(idtipopedido);
        }
        const baseWhere = `WHERE p.fecharegistro BETWEEN $1 AND $2`;
        // 1. Por Período
        const sqlPeriodo = `
            SELECT p.fecharegistro as fecha, COUNT(p.idpedido) as cant_pedidos, SUM(p.total) as total
            FROM pedido p ${baseWhere} ${filterCond}
            GROUP BY p.fecharegistro ORDER BY p.fecharegistro ASC
        `;
        // 2. Por Sucursal
        const sqlSucursal = `
            SELECT s.nombre, COUNT(p.idpedido) as cant_pedidos, SUM(p.total) as total
            FROM pedido p JOIN sucursal s ON p.idsucursal = s.idsucursal
            ${baseWhere} ${filterCond}
            GROUP BY s.idsucursal, s.nombre
        `;
        // 3. Por Estado
        const sqlEstado = `
            SELECT 
                p.estado,
                CASE 
                    WHEN p.estado = 1 THEN 'PENDIENTE'
                    WHEN p.estado = 2 THEN 'ENVIADO'
                    WHEN p.estado = 3 THEN 'FINALIZADO'
                    WHEN p.estado = 0 THEN 'ANULADO'
                    ELSE 'DESCONOCIDO'
                END as estado_nombre,
                COUNT(p.idpedido) as cant_pedidos, 
                SUM(p.total) as total
            FROM pedido p
            ${baseWhere} ${filterCond}
            GROUP BY p.estado, 2
        `;
        // 4. Por Tipo de Pedido
        const sqlTipo = `
            SELECT tp.nombre, COUNT(p.idpedido) as cant_pedidos, SUM(p.total) as total
            FROM pedido p JOIN tipopedido tp ON p.idtipopedido = tp.idtipopedido
            ${baseWhere} ${filterCond}
            GROUP BY tp.idtipopedido, tp.nombre
        `;
        // 5. Productos Top en Pedidos
        const sqlProductos = `
            WITH all_pedido_sales AS (
                -- Pedidos directos (Unidad)
                SELECT
                    prod.idproducto,
                    prod.nombre,
                    prod.imagen,
                    'UNIDAD' as presentacion,
                    1 as unidades_por_presentacion,
                    dp.cantidad as unidades_fisicas,
                    dp.cantidad as total_unidades_base,
                    (dp.cantidad * dp.precio) as ingresos
                FROM detallepedido dp
                JOIN pedido p ON dp.idpedido = p.idpedido
                JOIN producto prod ON dp.idproducto = prod.idproducto
                ${baseWhere} ${filterCond}
                  AND dp.idproductomedida IS NULL
                  AND dp.idpromocion IS NULL

                UNION ALL

                -- Pedidos por presentación
                SELECT
                    prod.idproducto,
                    prod.nombre,
                    prod.imagen,
                    pres.nombre as presentacion,
                    pm.cantidad as unidades_por_presentacion,
                    dp.cantidad as unidades_fisicas,
                    (dp.cantidad * pm.cantidad) as total_unidades_base,
                    (dp.cantidad * dp.precio) as ingresos
                FROM detallepedido dp
                JOIN pedido p ON dp.idpedido = p.idpedido
                JOIN productomedida pm ON dp.idproductomedida = pm.idproductomedida
                JOIN producto prod ON pm.idproducto = prod.idproducto
                JOIN presentacion pres ON pm.idpresentacion = pres.idpresentacion
                ${baseWhere} ${filterCond}
                  AND dp.idpromocion IS NULL
            ),
            summary_per_presentation AS (
                SELECT
                    idproducto,
                    nombre,
                    imagen,
                    presentacion,
                    unidades_por_presentacion,
                    SUM(unidades_fisicas) as cant_fisica,
                    SUM(total_unidades_base) as cant_base,
                    SUM(ingresos) as total_ingresos
                FROM all_pedido_sales
                GROUP BY
                    idproducto, nombre, imagen, presentacion, unidades_por_presentacion
            )
            SELECT 
                idproducto,
                nombre, 
                imagen,
                SUM(cant_base) as total_unidades_vendidas, 
                SUM(total_ingresos) as ingresos_totales,
                json_agg(
                    json_build_object(
                        'presentacion', presentacion,
                        'unidades_por_presentacion', unidades_por_presentacion,
                        'cantidad_vendida', cant_fisica,
                        'subtotal_ingresos', total_ingresos
                    )
                ) as presentaciones
            FROM summary_per_presentation
            GROUP BY idproducto, nombre, imagen
            ORDER BY total_unidades_vendidas DESC
            LIMIT 20
        `;
        // 6. Clientes Top en Pedidos
        const sqlClientes = `
            SELECT 
                pers.nombre || ' ' || COALESCE(pers.apellidopaterno, '') as cliente,
                COUNT(p.idpedido) as total_pedidos,
                SUM(p.total) as monto_total
            FROM pedido p
            JOIN persona pers ON p.idpersona = pers.idpersona
            ${baseWhere} ${filterCond}
            GROUP BY pers.idpersona, pers.nombre, pers.apellidopaterno
            ORDER BY monto_total DESC
            LIMIT 10
        `;
        const [periodo, sucursales, estados, tipos, productos, clientes] = await Promise.all([
            Pedido_1.Pedido.query(sqlPeriodo, params),
            Pedido_1.Pedido.query(sqlSucursal, params),
            Pedido_1.Pedido.query(sqlEstado, params),
            Pedido_1.Pedido.query(sqlTipo, params),
            Pedido_1.Pedido.query(sqlProductos, params),
            Pedido_1.Pedido.query(sqlClientes, params)
        ]);
        return res.json({
            metadatos: { desde: fechadesde, hasta: fechahasta, sucursal: idsucursal, tipoPedido: idtipopedido },
            pedidosPorPeriodo: periodo,
            pedidosPorSucursal: sucursales,
            pedidosPorEstado: estados,
            pedidosPorTipo: tipos,
            productosTop: productos,
            clientesTop: clientes
        });
    }
    catch (error) {
        console.error("Error en reporte consolidado de pedidos:", error);
        return res.status(500).json({ message: "Error al generar el reporte." });
    }
};
exports.getReportePedidosConsolidado = getReportePedidosConsolidado;
/**
 * Reporte detallado de pedidos (MÁS DETALLADO)
 */
const getReportePedidosDetallado = async (req, res) => {
    try {
        const { fechadesde, fechahasta, idsucursal, idestado, idtipopedido, idcliente } = req.query;
        if (!fechadesde || !fechahasta) {
            return res.status(400).json({ message: "Fechas obligatorias." });
        }
        const params = [fechadesde, fechahasta];
        let filterIdx = 3;
        let filterCond = "";
        if (idsucursal && idsucursal !== 'TODOS') {
            filterCond += ` AND p.idsucursal = $${filterIdx++}`;
            params.push(idsucursal);
        }
        if (idestado && idestado !== 'TODOS') {
            filterCond += ` AND p.estado = $${filterIdx++}`;
            params.push(idestado);
        }
        if (idtipopedido && idtipopedido !== 'TODOS') {
            filterCond += ` AND p.idtipopedido = $${filterIdx++}`;
            params.push(idtipopedido);
        }
        if (idcliente && idcliente !== 'TODOS') {
            filterCond += ` AND p.idpersona = $${filterIdx++}`;
            params.push(idcliente);
        }
        const sqlListado = `
            SELECT 
                p.idpedido, p.fecharegistro, p.hora, p.total, p.adelanto, 
                (p.total - p.adelanto) as saldo,
                p.estado,
                CASE 
                    WHEN p.estado = 1 THEN 'PENDIENTE'
                    WHEN p.estado = 2 THEN 'ENVIADO'
                    WHEN p.estado = 3 THEN 'FINALIZADO'
                    WHEN p.estado = 0 THEN 'ANULADO'
                    ELSE 'DESCONOCIDO'
                END as estado_nombre,
                p.direccionentrega, p.referenciaentrega, p.linkubicacion,
                tp.nombre as tipo_pedido, 
                pers.nombre || ' ' || COALESCE(pers.apellidopaterno, '') as cliente,
                (SELECT c.numero FROM celular c WHERE c.idpersona = pers.idpersona AND c.estado = 1 LIMIT 1) as cliente_telefono,
                s.nombre as sucursal,
                (
                    SELECT json_agg(grouped_items) FROM (
                        SELECT 
                            COALESCE(prod.nombre, prom.nombre) as item_nombre,
                            COALESCE(prod.imagen, prom.imagen) as item_imagen,
                            json_agg(json_build_object(
                                'iddetallepedido', dp.iddetallepedido,
                                'cantidad', dp.cantidad,
                                'precio', dp.precio,
                                'subtotal', dp.subtotal,
                                'cantidad_presentacion', pm.cantidad,
                                'presentacion', CASE 
                                    WHEN dp.idpromocion IS NOT NULL THEN 'PROMOCIÓN'
                                    WHEN pres.nombre IS NOT NULL THEN pres.nombre
                                    ELSE 'UNIDAD'
                                END,
                                'productos_de_promocion', CASE 
                                    WHEN dp.idpromocion IS NOT NULL THEN (
                                        SELECT json_agg(promo_items) FROM (
                                            SELECT 
                                                p_sub.nombre as producto_nombre,
                                                prp.cantidad as cantidad_en_promo,
                                                COALESCE(pres_sub.nombre, 'UNIDAD') as presentacion_producto,
                                                pm_sub.cantidad as cantidad_presentacion
                                            FROM promocionproducto prp
                                            JOIN producto p_sub ON prp.idproducto = p_sub.idproducto
                                            LEFT JOIN productomedida pm_sub ON prp.idproductomedida = pm_sub.idproductomedida
                                            LEFT JOIN presentacion pres_sub ON pm_sub.idpresentacion = pres_sub.idpresentacion
                                            WHERE prp.idpromocion = dp.idpromocion
                                        ) promo_items
                                    )
                                    ELSE NULL
                                END
                            )) as presentaciones
                        FROM detallepedido dp
                        LEFT JOIN producto prod ON dp.idproducto = prod.idproducto
                        LEFT JOIN promocion prom ON dp.idpromocion = prom.idpromocion
                        LEFT JOIN productomedida pm ON dp.idproductomedida = pm.idproductomedida
                        LEFT JOIN presentacion pres ON pm.idpresentacion = pres.idpresentacion
                        WHERE dp.idpedido = p.idpedido
                        GROUP BY COALESCE(prod.nombre, prom.nombre), COALESCE(prod.imagen, prom.imagen)
                    ) grouped_items
                ) as detalles
            FROM pedido p
            INNER JOIN sucursal s ON p.idsucursal = s.idsucursal
            INNER JOIN tipopedido tp ON p.idtipopedido = tp.idtipopedido
            LEFT JOIN persona pers ON p.idpersona = pers.idpersona
            WHERE p.fecharegistro BETWEEN $1 AND $2 ${filterCond}
            ORDER BY p.fecharegistro DESC, p.hora DESC
        `;
        const listado = await Pedido_1.Pedido.query(sqlListado, params);
        return res.json({
            metadatos: {
                desde: fechadesde,
                hasta: fechahasta,
                sucursal: idsucursal || "TODAS",
                estado: idestado || "TODOS",
                tipoPedido: idtipopedido || "TODOS",
                cliente: idcliente || "TODOS"
            },
            pedidos: listado
        });
    }
    catch (error) {
        console.error("Error en reporte detallado pedidos:", error);
        return res.status(500).json({ message: "Error interno" });
    }
};
exports.getReportePedidosDetallado = getReportePedidosDetallado;
/**
 * Reporte detallado de ventas
 */
const getReporteVentasDetallado = async (req, res) => {
    try {
        const { fechadesde, fechahasta, idsucursal, idusuario, estado, idmetodopago, idcliente } = req.query;
        if (!fechadesde || !fechahasta)
            return res.status(400).json({ message: "Fechas obligatorias." });
        const params = [fechadesde, fechahasta];
        let filterIdx = 3;
        let filterCond = "";
        if (idsucursal && idsucursal !== 'TODOS') {
            filterCond += ` AND v.idsucursal = $${filterIdx++}`;
            params.push(idsucursal);
        }
        if (idusuario && idusuario !== 'TODOS') {
            filterCond += ` AND v.idusuario = $${filterIdx++}`;
            params.push(idusuario);
        }
        if (estado && estado !== 'TODOS') {
            filterCond += ` AND v.estado = $${filterIdx++}`;
            params.push(estado);
        }
        if (idmetodopago && idmetodopago !== 'TODOS') {
            filterCond += ` AND EXISTS (SELECT 1 FROM pago pg WHERE pg.idventa = v.idventa AND pg.idmetodopago = $${filterIdx++})`;
            params.push(idmetodopago);
        }
        if (idcliente && idcliente !== 'TODOS') {
            filterCond += ` AND v.idpersona = $${filterIdx++}`;
            params.push(idcliente);
        }
        // 1. Listado de Ventas con detalles y factura
        const sqlVentas = `
            SELECT 
                v.idventa, v.fechaventa, v.horaventa, v.preciototal, v.estado,
                pers.nombre || ' ' || COALESCE(pers.apellidopaterno, '') as cliente,
                s.nombre as sucursal,
                u_pers.nombre || ' ' || COALESCE(u_pers.apellidopaterno, '') as vendedor,
                f.nrofactura as nro_factura,
                e.enlace as factura_url,
                CASE WHEN f.idfactura IS NOT NULL THEN true ELSE false END as tiene_factura,
                (
                    SELECT json_agg(detalle) FROM (
                        SELECT 
                            dv.iddetalleventa, dv.cantidad, dv.precio, dv.descuento,
                            COALESCE(prod.nombre, prom.nombre) as item_nombre,
                            COALESCE(prod.imagen, prom.imagen) as item_imagen,
                            CASE 
                                WHEN dv.idpromocion IS NOT NULL THEN 'PROMOCIÓN'
                                WHEN pres.nombre IS NOT NULL THEN pres.nombre
                                ELSE 'UNIDAD'
                            END as presentacion,
                            COALESCE(pm.cantidad, 1) as unidades_por_presentacion,
                            CASE 
                                WHEN dv.idpromocion IS NOT NULL THEN (
                                    SELECT json_agg(promo_items) FROM (
                                        SELECT 
                                            p_sub.nombre as producto_nombre,
                                            prp.cantidad as cantidad_en_promo,
                                            COALESCE(pres_sub.nombre, 'UNIDAD') as presentacion_producto,
                                            pm_sub.cantidad as cantidad_presentacion
                                        FROM promocionproducto prp
                                        JOIN producto p_sub ON prp.idproducto = p_sub.idproducto
                                        LEFT JOIN productomedida pm_sub ON prp.idproductomedida = pm_sub.idproductomedida
                                        LEFT JOIN presentacion pres_sub ON pm_sub.idpresentacion = pres_sub.idpresentacion
                                        WHERE prp.idpromocion = dv.idpromocion
                                    ) promo_items
                                )
                                ELSE NULL
                            END as productos_de_promocion
                        FROM detalleventa dv
                        LEFT JOIN producto prod ON dv.idproducto = prod.idproducto
                        LEFT JOIN promocion prom ON dv.idpromocion = prom.idpromocion
                        LEFT JOIN productomedida pm ON dv.idproductomedida = pm.idproductomedida
                        LEFT JOIN presentacion pres ON pm.idpresentacion = pres.idpresentacion
                        WHERE dv.idventa = v.idventa
                    ) detalle
                ) as detalles
            FROM venta v
            LEFT JOIN persona pers ON v.idpersona = pers.idpersona
            LEFT JOIN sucursal s ON v.idsucursal = s.idsucursal
            LEFT JOIN usuario u ON v.idusuario = u.idusuario
            LEFT JOIN persona u_pers ON u.idpersona = u_pers.idpersona
            LEFT JOIN factura f ON v.idventa = f.idventa
            LEFT JOIN enlace e ON f.idenlace = e.idenlace
            WHERE v.fechaventa BETWEEN $1 AND $2 ${filterCond}
            ORDER BY v.fechaventa DESC, v.horaventa DESC
        `;
        // 2. Cliente que más compró
        const sqlTopCliente = `
            SELECT 
                p.nombre || ' ' || COALESCE(p.apellidopaterno, '') as cliente,
                COUNT(v.idventa) as total_compras,
                SUM(v.preciototal) as monto_total
            FROM venta v
            JOIN persona p ON v.idpersona = p.idpersona
            WHERE v.fechaventa BETWEEN $1 AND $2 ${filterCond} AND v.estado = 1
            GROUP BY p.idpersona, p.nombre, p.apellidopaterno
            ORDER BY monto_total DESC
            LIMIT 1
        `;
        // 3. Usuario (Vendedor) que más vendió
        const sqlTopVendedor = `
            SELECT 
                per.nombre || ' ' || COALESCE(per.apellidopaterno, '') as vendedor,
                COUNT(v.idventa) as total_ventas,
                SUM(v.preciototal) as monto_total
            FROM venta v
            JOIN usuario u ON v.idusuario = u.idusuario
            JOIN persona per ON u.idpersona = per.idpersona
            WHERE v.fechaventa BETWEEN $1 AND $2 ${filterCond} AND v.estado = 1
            GROUP BY u.idusuario, per.nombre, per.apellidopaterno
            ORDER BY monto_total DESC
            LIMIT 1
        `;
        const [ventas, topCliente, topVendedor] = await Promise.all([
            Venta_1.Venta.query(sqlVentas, params),
            Venta_1.Venta.query(sqlTopCliente, params),
            Venta_1.Venta.query(sqlTopVendedor, params)
        ]);
        return res.json({
            metadatos: {
                desde: fechadesde,
                hasta: fechahasta,
                sucursal: idsucursal || "TODAS",
                usuario: idusuario || "TODOS",
                cliente: idcliente || "TODOS",
                metodoPago: idmetodopago || "TODOS"
            },
            topCliente: topCliente[0] || null,
            topVendedor: topVendedor[0] || null,
            ventas: ventas
        });
    }
    catch (error) {
        console.error("Error en ventas detalladas:", error);
        return res.status(500).json({ message: "Error interno" });
    }
};
exports.getReporteVentasDetallado = getReporteVentasDetallado;
