import { Request, Response } from "express";
import { Brackets } from "typeorm";
import { Detalleventa } from "../entities/DetalleVenta";
import { Venta } from "../entities/Venta";
import { Pedido } from "../entities/Pedido";
import { Persona } from "../entities/Persona";
import { Pago } from "../entities/Pago";
import { AppDataSource } from "../db";
import { Compra } from "../entities/Compra";
import { Detallecompra } from "../entities/DetalleCompra";
import { Producto } from "../entities/Producto";
import { Promocion } from "../entities/Promocion";
import { Inventario } from "../entities/Inventario";
import { Subcategoria } from "../entities/SubCategoria";
import { Tipopedido } from "../entities/TipoPedido";
import { Produccion } from "../entities/Produccion";
import { DetalleProduccion } from "../entities/Detalleproduccuin";

export const getCube = async (req: Request, res: Response) => {
    return res.status(501).json({ message: "Not implemented" });
};

export const getDailySummary = async (req: Request, res: Response) => {
    return res.status(501).json({ message: "Not implemented" });
};

export const testDetalleVenta = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = req.query;

        let query = AppDataSource.getRepository(Detalleventa)
            .createQueryBuilder("detalle")
            .select("detalle.IdDetalleVenta", "detalleId")
            .addSelect("promocion.IdPromocion", "promotionId")
            .addSelect("promocion.Nombre", "promotionName")
            .addSelect("productomedida.IdProductoMedida", "packageId")
            .addSelect("productomedida.Cantidad", "packageCantidad")
            .leftJoin("detalle.Promocion", "promocion")
            .leftJoin("detalle.Productomedida", "productomedida");

        if (startDate && endDate) {
            query = query
                .innerJoin("detalle.Venta", "venta")
                .where("venta.FechaVenta BETWEEN :startDate AND :endDate", { startDate, endDate });
        } else {
            query = query.where("promocion.IdPromocion IS NOT NULL OR productomedida.IdProductoMedida IS NOT NULL");
        }

        const detalleVentaWithRelations = await query.getRawMany();
        res.json(detalleVentaWithRelations);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
    }
};

export const getOlapDataForDateAndBranch = async (req: Request, res: Response) => {
    return res.status(501).json({ message: "Not implemented" });
};

export const getLatestMovements = async (req: Request, res: Response) => {
    try {
        const { limit = 5, sucursalId } = req.query;

        let salesQuery = Venta.createQueryBuilder("venta")
            .leftJoinAndSelect("venta.Persona", "persona")
            .leftJoinAndSelect("venta.Pago", "pago")
            .orderBy("venta.FechaVenta", "DESC")
            .addOrderBy("venta.HoraVenta", "DESC")
            .take(10);

        if (sucursalId) {
            salesQuery = salesQuery.andWhere("venta.Sucursal.IdSucursal = :sucursalId", { sucursalId });
        }

        const latestSalesResult = await salesQuery.getMany();

        const latestSales = await Promise.all(latestSalesResult.map(async (venta) => {
            const detalle = await Detalleventa.findOne({
                where: { Venta: { IdVenta: venta.IdVenta } },
                relations: ["Producto", "Productomedida", "Promocion"]
            });

            const profit = venta.Pago?.reduce((sum, p) => sum + (p.Monto - p.Cambio), 0) || 0;

            let description = `Venta #${venta.IdVenta}`;
            if (detalle) {
                if (detalle.Producto) {
                    description += `: ${detalle.Producto.Nombre}`;
                } else if (detalle.Productomedida) {
                    description += `: ${detalle.Productomedida.Producto?.Nombre || 'Producto'} (Presentación)`;
                } else if (detalle.Promocion) {
                    description += `: ${detalle.Promocion.Nombre}`;
                }
            }

            return {
                type: 'Venta',
                id: venta.IdVenta,
                description,
                date: venta.FechaVenta,
                time: venta.HoraVenta || '00:00:00',
                profit: parseFloat(profit.toFixed(2))
            };
        }));

        let ordersQuery = Pedido.createQueryBuilder("pedido")
            .innerJoin("pedido.Persona", "persona")
            .select([
                "'Pedido' as type",
                "pedido.IdPedido as id",
                "CONCAT('Pedido #', pedido.IdPedido, ' a nombre de ', persona.Nombre, ' ', COALESCE(persona.ApellidoPaterno, '')) as description",
                "TO_CHAR(pedido.FechaRegistro, 'YYYY-MM-DD') as date",
                "pedido.Hora as time",
            ])
            .orderBy("pedido.FechaRegistro", "DESC")
            .addOrderBy("pedido.Hora", "DESC")
            .take(10);

        if (sucursalId) {
            ordersQuery = ordersQuery.andWhere("pedido.Sucursal.IdSucursal = :sucursalId", { sucursalId });
        }

        const latestOrders = await ordersQuery.getRawMany();

        const latestCustomersQuery = Persona.createQueryBuilder("persona")
            .leftJoinAndSelect("persona.Usuario", "usuario")
            .leftJoinAndSelect("persona.Proveedor", "proveedor")
            .orderBy("persona.FechaRegistro", "DESC")
            .take(10);

        const latestCustomersResult = await latestCustomersQuery.getMany();

        const latestCustomers = latestCustomersResult.map((persona) => {
            let type = 'Cliente';
            let description = `Nuevo cliente: ${persona.Nombre} ${persona.ApellidoPaterno || ''}`;

            if (persona.Usuario) {
                type = 'Usuario';
                description = `Nuevo usuario: ${persona.Nombre} ${persona.ApellidoPaterno || ''}`;
            }
            if (persona.Proveedor) {
                type = 'Proveedor';
                description = `Nuevo proveedor: ${persona.Nombre} ${persona.ApellidoPaterno || ''}`;
            }

            const formattedDate = new Date(persona.FechaRegistro).toISOString().slice(0, 10);

            return {
                type,
                id: persona.IdPersona,
                description,
                date: formattedDate,
                time: persona.HoraRegistro || '00:00:00',
            };
        });

        const latestPurchasesQuery = Compra.createQueryBuilder("compra")
            .innerJoin("compra.Proveedor", "proveedor")
            .innerJoin("proveedor.Persona", "persona")
            .innerJoin("compra.Detallecompra", "detalle")
            .select([
                "'Compra' as type",
                "compra.IdCompra as id",
                "CONCAT('Compra #', compra.IdCompra, ' a ', persona.Nombre, ' ', COALESCE(persona.ApellidoPaterno, '')) as description",
                "TO_CHAR(compra.FechaCompra, 'YYYY-MM-DD') as date",
                "COALESCE(compra.HoraCompra::text, '00:00:00') as time",
                "SUM(detalle.Precio * detalle.Cantidad) as total"
            ])
            .orderBy("compra.FechaCompra", "DESC")
            .addOrderBy("compra.HoraCompra", "DESC")
            .groupBy("compra.IdCompra, persona.Nombre, persona.ApellidoPaterno")
            .take(10);

        const latestPurchases = await latestPurchasesQuery.getRawMany();

        const latestProductsQuery = Producto.createQueryBuilder("producto")
            .select([
                "'Producto' as type",
                "producto.IdProducto as id",
                "CONCAT('Nuevo producto: ', producto.Nombre) as description",
                "TO_CHAR(producto.FechaRegistro, 'YYYY-MM-DD') as date",
                "COALESCE(producto.HoraRegistro::text, '00:00:00') as time",
            ])
            .orderBy("producto.FechaRegistro", "DESC")
            .addOrderBy("producto.HoraRegistro", "DESC")
            .take(10);

        const latestProducts = await latestProductsQuery.getRawMany();

        const latestProductionsQuery = Produccion.createQueryBuilder("produccion")
            .leftJoinAndSelect("produccion.Sucursal", "sucursal")
            .leftJoinAndSelect("produccion.Detalle", "detalle")
            .leftJoinAndSelect("detalle.Producto", "producto")
            .select([
                "'Produccion' as type",
                "produccion.IdProduccion as id",
                "COALESCE(CONCAT('Producción: ', producto.Nombre, ' (', detalle.Cantidad, ' uds)'), CONCAT('Producción #', produccion.IdProduccion)) as description",
                "TO_CHAR(produccion.FechaProduccion, 'YYYY-MM-DD') as date",
                "COALESCE(produccion.HoraInicio::text, '00:00:00') as time",
                "ROUND(CAST((detalle.Cantidad * detalle.CostoUnitario) AS numeric), 2) as total"
            ])
            .orderBy("produccion.FechaProduccion", "DESC")
            .addOrderBy("produccion.HoraInicio", "DESC")
            .take(10);

        if (sucursalId) {
            latestProductionsQuery.andWhere("sucursal.IdSucursal = :sucursalId", { sucursalId });
        }

        const latestProductions = await latestProductionsQuery.getRawMany();

        const allActivities = [...latestSales, ...latestOrders, ...latestCustomers, ...latestPurchases, ...latestProducts, ...latestProductions];

        const sortedActivities = allActivities.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);

            const timeA = a.time ? a.time.toString().split(':') : [0, 0, 0];
            const timeB = b.time ? b.time.toString().split(':') : [0, 0, 0];

            const dateTimeA = new Date(dateA.getFullYear(), dateA.getMonth(), dateA.getDate(), timeA[0], timeA[1], timeA[2]);
            const dateTimeB = new Date(dateB.getFullYear(), dateB.getMonth(), dateB.getDate(), timeB[0], timeB[1], timeB[2]);

            return dateTimeB.getTime() - dateTimeA.getTime();
        });

        const recentActivities = sortedActivities.slice(0, Number(limit));

        return res.json(recentActivities);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

const calculateExistingStock = async (idSucursal: string | undefined, fechaFin: Date) => {
    let query = AppDataSource.getRepository(Inventario)
        .createQueryBuilder("inv")
        .leftJoinAndSelect("inv.Producto", "producto")
        .leftJoinAndSelect("inv.Sucursal", "sucursal")
        .where("inv.FechaIngreso <= :fechaFin", { fechaFin });

    if (idSucursal) {
        query.andWhere("sucursal.IdSucursal = :idSucursal", { idSucursal });
    }

    const stockRecords = await query.getMany();

    const latestRecordMap = new Map<string, Inventario>();

    for (const record of stockRecords) {
        const uniqueKey = `${record.IdInventario}`;
        const existing = latestRecordMap.get(uniqueKey);

        if (!existing || (record.FechaIngreso && existing.FechaIngreso && record.FechaIngreso > existing.FechaIngreso)) {
            latestRecordMap.set(uniqueKey, record);
        }
    }

    let stockTotal = 0;
    let stockMinimo = Infinity;
    let stockCritico = 0;

    if (latestRecordMap.size === 0) {
        stockMinimo = 0;
    }

    for (const record of latestRecordMap.values()) {
        stockTotal += record.Cantidad || 0;
        if (record.Producto?.StockMinimo !== undefined && record.Producto.StockMinimo < stockMinimo) {
            stockMinimo = record.Producto.StockMinimo;
        }
        if ((record.Cantidad || 0) <= 20) {
            stockCritico++;
        }
    }

    if (stockMinimo === Infinity) {
        stockMinimo = 0;
    }

    return { stockTotal, stockMinimo, stockCritico };
};

export const getOlapData = async (req: Request, res: Response) => {
    try {
        const { idSucursal, anio, mes, semana, fechaInicio, fechaFin, depurar, idSubcategoria } = req.query;

        if (!anio && !(fechaInicio && fechaFin)) {
            return res.status(400).json({ message: "Se requiere el año o un rango de fechas (fechaInicio y fechaFin)." });
        }

        let objetoFechaInicio: Date, objetoFechaFin: Date;

        if (fechaInicio && fechaFin) {
            objetoFechaInicio = new Date(fechaInicio as string);
            objetoFechaFin = new Date(fechaFin as string);

            if (objetoFechaInicio.toISOString().slice(0, 10) === objetoFechaFin.toISOString().slice(0, 10)) {
                objetoFechaFin.setHours(23, 59, 59, 999);
            }
        } else {
            const anioNum = Number(anio);
            if (mes && semana) {
                const fechaSemana = new Date(anioNum, Number(mes) - 1, (Number(semana) - 1) * 7 + 1);
                const diaDeLaSemana = fechaSemana.getDay();
                const diff = fechaSemana.getDate() - diaDeLaSemana + (diaDeLaSemana === 0 ? -6 : 1);
                objetoFechaInicio = new Date(fechaSemana.setDate(diff));
                objetoFechaFin = new Date(fechaSemana.setDate(diff + 6));
            } else if (mes) {
                objetoFechaInicio = new Date(anioNum, Number(mes) - 1, 1);
                objetoFechaFin = new Date(anioNum, Number(mes), 0);
            } else {
                objetoFechaInicio = new Date(anioNum, 0, 1);
                objetoFechaFin = new Date(anioNum, 11, 31);
            }
        }

        const fechaInicioFormateada = objetoFechaInicio.toISOString().slice(0, 10);
        const fechaFinFormateada = objetoFechaFin.toISOString().slice(0, 10);

        let resumenStock;
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const hoyFormateado = hoy.toISOString().slice(0, 10);

        const isTodayOrFuture = (date: Date) => date.toISOString().slice(0, 10) >= hoyFormateado;

        if (fechaInicioFormateada === hoyFormateado && fechaFinFormateada === hoyFormateado) {
            resumenStock = await calculateExistingStock(idSucursal as string | undefined, objetoFechaFin);
        } else if (fechaInicioFormateada === fechaFinFormateada) {
            const existingStockAtEndDate = await calculateExistingStock(idSucursal as string | undefined, objetoFechaFin);
            resumenStock = {
                stockTotal: 0,
                stockMinimo: existingStockAtEndDate.stockMinimo,
                stockCritico: existingStockAtEndDate.stockCritico
            };
        } else if (isTodayOrFuture(objetoFechaFin)) {
            const existingStock = await calculateExistingStock(idSucursal as string | undefined, objetoFechaFin);
            resumenStock = {
                stockTotal: existingStock.stockTotal,
                stockMinimo: existingStock.stockMinimo,
                stockCritico: existingStock.stockCritico
            };
        } else {
            const existingStockAtEndDate = await calculateExistingStock(idSucursal as string | undefined, objetoFechaFin);
            resumenStock = {
                stockTotal: 0,
                stockMinimo: existingStockAtEndDate.stockMinimo,
                stockCritico: existingStockAtEndDate.stockCritico
            };
        }

        const consultaPrincipal = AppDataSource.getRepository(Detalleventa)
            .createQueryBuilder("detalle")
            .leftJoinAndSelect("detalle.Venta", "venta")
            .leftJoinAndSelect("venta.Sucursal", "sucursal")
            .leftJoinAndSelect("venta.Persona", "cliente")
            .leftJoinAndSelect("detalle.Producto", "producto")
            .leftJoinAndSelect("producto.Subcategoria", "subcategoria")
            .leftJoinAndSelect("detalle.Productomedida", "productomedida")
            .leftJoinAndSelect("productomedida.Producto", "producto_en_productomedida")
            .leftJoinAndSelect("detalle.Promocion", "promocion")
            .leftJoinAndSelect("promocion.Promocionproducto", "item_promocion")
            .leftJoinAndSelect("item_promocion.Producto", "producto_en_promocion")
            .leftJoinAndSelect("item_promocion.Productomedida", "productomedida_en_promocion")
            .where("venta.FechaVenta BETWEEN :fechaInicioFormateada AND :fechaFinFormateada", { fechaInicioFormateada, fechaFinFormateada });

        if (idSucursal) {
            consultaPrincipal.andWhere("venta.Sucursal.IdSucursal = :idSucursal", { idSucursal });
        }

        if (idSubcategoria) {
            const whereClause = `
              (subcategoria.IdSubcategoria = :idSubcategoria)
            `;
            consultaPrincipal.andWhere(whereClause, { idSubcategoria });
        }

        let promesaGanancias;
        if (depurar === 'true') {
            const consultaGananciasDepuracion = Venta.createQueryBuilder("venta")
                .innerJoin("venta.Pago", "pago")
                .where("venta.FechaVenta BETWEEN :fechaInicioFormateada AND :fechaFinFormateada", { fechaInicioFormateada, fechaFinFormateada })
                .select(["venta.IdVenta as saleId", "pago.Monto as amount", "pago.Cambio as change", "venta.FechaVenta as date"]);
            if (idSucursal) {
                consultaGananciasDepuracion.andWhere("venta.Sucursal.IdSucursal = :idSucursal", { idSucursal });
            }
            promesaGanancias = consultaGananciasDepuracion.getRawMany();
        } else {
            const consultaGanancias = Venta.createQueryBuilder("venta")
                .innerJoin("venta.Pago", "pago")
                .where("venta.FechaVenta BETWEEN :fechaInicioFormateada AND :fechaFinFormateada", { fechaInicioFormateada, fechaFinFormateada })
                .select("SUM(pago.Monto - pago.Cambio)", "gananciaTotal");
            if (idSucursal) {
                consultaGanancias.andWhere("venta.Sucursal.IdSucursal = :idSucursal", { idSucursal });
            }
            promesaGanancias = consultaGanancias.getRawOne();
        }

        const [ventasDetalladas, resultadoGanancias] = await Promise.all([
            consultaPrincipal.getMany(),
            promesaGanancias
        ]);

        const cubo: any = {};
        const resumen: any = {
            ingresoTotal: 0,
            totalItemsVendidos: 0,
            ventasDirectasProducto: 0,
            paquetesVendidos: 0,
            promocionesVendidas: 0,
            clientes: new Set<string>(),
            clientesNuevos: new Set<string>(),
            clientesRecurrentes: new Set<string>(),
            top5Productos: [] as { id: string, name: string, imageUrl: string | null, totalQuantity: number, totalPrice: number }[],
            top5Paquetes: [] as { id: string, name: string, imageUrl: string | null, totalQuantity: number, totalPrice: number }[],
            top5Promociones: [] as { id: string, name: string, imageUrl: string | null, totalQuantity: number, totalPrice: number }[],
            totalVentas: new Set<string>(),
            resumenStock: resumenStock
        };

        const productSalesAggregate: { [key: string]: { id: string, name: string, imageUrl: string | null, totalQuantity: number, totalPrice: number } } = {};
        const packageSalesAggregate: { [key: string]: { id: string, name: string, imageUrl: string | null, totalQuantity: number, totalPrice: number } } = {};
        const promotionSalesAggregate: { [key: string]: { id: string, name: string, imageUrl: string | null, totalQuantity: number, totalPrice: number } } = {};

        for (const detalleVenta of ventasDetalladas) {
            if (!detalleVenta.Venta) continue;

            const fecha = new Date(detalleVenta.Venta.FechaVenta).toISOString().slice(0, 10);
            const sucursal = detalleVenta.Venta.Sucursal?.Nombre ?? 'Sin Sucursal';
            const time = detalleVenta.Venta.HoraVenta;

            const nombreCliente = detalleVenta.Venta.Persona
                ? [detalleVenta.Venta.Persona.Nombre, detalleVenta.Venta.Persona.ApellidoPaterno, detalleVenta.Venta.Persona.ApellidoMaterno].filter(Boolean).join(' ')
                : 'Cliente Anónimo';

            const cantidadDetalle = detalleVenta.Cantidad;
            const precioDetalle = Number(detalleVenta.Precio);

            let tipoItem: string = 'desconocido';
            let nombreItem: string = 'N/A';
            let infoItem: { id: string; imageUrl: string | null } = { id: '', imageUrl: null };
            let ingresoItem = Number(detalleVenta.Precio);

            if (detalleVenta.Producto) {
                tipoItem = 'producto';
                nombreItem = detalleVenta.Producto.Nombre;
                const productId = `producto_${detalleVenta.Producto.IdProducto}`;
                infoItem = {
                    id: detalleVenta.Producto.IdProducto,
                    imageUrl: detalleVenta.Producto.Imagen || null
                };
                resumen.ventasDirectasProducto += cantidadDetalle;

                if (!productSalesAggregate[productId]) {
                    productSalesAggregate[productId] = { id: productId, name: nombreItem, imageUrl: infoItem.imageUrl, totalQuantity: 0, totalPrice: 0 };
                }
                productSalesAggregate[productId].totalQuantity += cantidadDetalle;
                productSalesAggregate[productId].totalPrice += cantidadDetalle * precioDetalle;

            } else if (detalleVenta.Productomedida) {
                tipoItem = 'paquete';
                nombreItem = detalleVenta.Productomedida.Producto?.Nombre || detalleVenta.Productomedida.IdProductoMedida;
                const paqueteId = `paquete_${detalleVenta.Productomedida.IdProductoMedida}`;
                infoItem = { id: detalleVenta.Productomedida.IdProductoMedida, imageUrl: detalleVenta.Productomedida.Imagen || null };
                resumen.paquetesVendidos += cantidadDetalle;

                if (!packageSalesAggregate[paqueteId]) {
                    packageSalesAggregate[paqueteId] = { id: paqueteId, name: nombreItem, imageUrl: infoItem.imageUrl, totalQuantity: 0, totalPrice: 0 };
                }
                packageSalesAggregate[paqueteId].totalQuantity += cantidadDetalle;
                packageSalesAggregate[paqueteId].totalPrice += cantidadDetalle * precioDetalle;

            } else if (detalleVenta.Promocion) {
                tipoItem = 'promocion';
                nombreItem = detalleVenta.Promocion.Nombre;
                const promocionId = `promocion_${detalleVenta.Promocion.IdPromocion}`;
                infoItem = { id: detalleVenta.Promocion.IdPromocion, imageUrl: detalleVenta.Promocion.Imagen || null };
                resumen.promocionesVendidas += cantidadDetalle;

                if (!promotionSalesAggregate[promocionId]) {
                    promotionSalesAggregate[promocionId] = { id: promocionId, name: nombreItem, imageUrl: infoItem.imageUrl, totalQuantity: 0, totalPrice: 0 };
                }
                promotionSalesAggregate[promocionId].totalQuantity += cantidadDetalle;
                promotionSalesAggregate[promocionId].totalPrice += cantidadDetalle * precioDetalle;
            }

            if (nombreItem === 'N/A') continue;

            resumen.totalItemsVendidos += cantidadDetalle;

            if (!cubo[fecha]) cubo[fecha] = {};
            if (!cubo[fecha][sucursal]) cubo[fecha][sucursal] = {};
            if (!cubo[fecha][sucursal][tipoItem]) cubo[fecha][sucursal][tipoItem] = {};
            if (!cubo[fecha][sucursal][tipoItem][nombreItem]) {
                cubo[fecha][sucursal][tipoItem][nombreItem] = {
                    ...infoItem,
                    cantidad: 0,
                    ingreso: 0,
                    time: [],
                    clientes: new Set<string>()
                };
            }

            cubo[fecha][sucursal][tipoItem][nombreItem].cantidad += cantidadDetalle;
            cubo[fecha][sucursal][tipoItem][nombreItem].ingreso += ingresoItem;
            cubo[fecha][sucursal][tipoItem][nombreItem].time.push(time);
            if (nombreCliente) {
                cubo[fecha][sucursal][tipoItem][nombreItem].clientes.add(nombreCliente);
            }

            if (detalleVenta.Venta.Persona) {
                resumen.ingresoTotal += ingresoItem * cantidadDetalle;
                resumen.totalVentas.add(detalleVenta.Venta.IdVenta);

                const fechaRegistroCliente = new Date(detalleVenta.Venta.Persona.FechaRegistro);
                if (!resumen.clientes.has(detalleVenta.Venta.Persona.IdPersona)) {
                    resumen.clientes.add(detalleVenta.Venta.Persona.IdPersona);
                    if (fechaRegistroCliente >= objetoFechaInicio && fechaRegistroCliente <= objetoFechaFin) {
                        resumen.clientesNuevos.add(detalleVenta.Venta.Persona.IdPersona);
                    } else {
                        resumen.clientesRecurrentes.add(detalleVenta.Venta.Persona.IdPersona);
                    }
                }
            }
        }

        for (const fecha in cubo) {
            for (const sucursal in cubo[fecha]) {
                for (const tipoItem in cubo[fecha][sucursal]) {
                    for (const nombreItem in cubo[fecha][sucursal][tipoItem]) {
                        const valor = cubo[fecha][sucursal][tipoItem][nombreItem];
                        if (tipoItem === 'promocion') {
                            valor.ingreso = Math.round(valor.ingreso * 10) / 10;
                        } else {
                            valor.ingreso = Math.round(valor.ingreso * 100) / 100;
                        }
                        valor.clientes = Array.from(valor.clientes);
                        valor.time = Array.from(new Set(valor.time));
                    }
                }
            }
        }

        resumen.top5Productos = Object.values(productSalesAggregate)
            .sort((a, b) => b.totalPrice - a.totalPrice)
            .slice(0, 5)
            .map(p => ({ ...p, totalPrice: Math.round(p.totalPrice * 10) / 10 }));

        resumen.top5Paquetes = Object.values(packageSalesAggregate)
            .sort((a, b) => b.totalPrice - a.totalPrice)
            .slice(0, 5)
            .map(p => ({ ...p, totalPrice: Math.round(p.totalPrice * 10) / 10 }));

        resumen.top5Promociones = Object.values(promotionSalesAggregate)
            .sort((a, b) => b.totalPrice - a.totalPrice)
            .slice(0, 5)
            .map(p => ({ ...p, totalPrice: Math.round(p.totalPrice * 10) / 10 }));

        const respuestaJson: any = {
            dimensiones: {
                idSucursal: idSucursal || "Todas",
                periodo: {
                    anio: anio || null,
                    mes: mes || null,
                    semana: semana || null,
                    fechaInicio: fechaInicioFormateada,
                    fechaFin: fechaFinFormateada,
                },
            },
            resumen: {
                ingresoTotal: Math.round(resumen.ingresoTotal * 10) / 10,
                totalVentas: resumen.totalVentas.size,
                totalItemsVendidos: resumen.totalItemsVendidos,
                desglose: {
                    ventasDirectasProducto: resumen.ventasDirectasProducto,
                    paquetesVendidos: resumen.paquetesVendidos,
                    promocionesVendidas: resumen.promocionesVendidas,
                },
                resumenClientes: {
                    totalClientes: resumen.clientes.size,
                    clientesNuevos: resumen.clientesNuevos.size,
                    clientesRecurrentes: resumen.clientesRecurrentes.size,
                },
                top5Productos: resumen.top5Productos,
                top5Paquetes: resumen.top5Paquetes,
                top5Promociones: resumen.top5Promociones,
                resumenStock: resumen.resumenStock
            },
            cubo: cubo
        };

        if (depurar === 'true') {
            const datosDepuracion = resultadoGanancias as Array<any>;
            const totalCalculado = datosDepuracion.reduce((acc, item) => acc + (parseFloat(item.amount) - parseFloat(item.change)), 0);
            const totalCalculadoRedondeado = Math.round(totalCalculado * 10) / 10;
            respuestaJson.infoDepuracion = {
                calculoGanancias: {
                    pagosComponentes: datosDepuracion,
                    totalCalculado: totalCalculadoRedondeado
                },
                muestraDatosCrudos: ventasDetalladas.slice(0, 2)
            };
            respuestaJson.resumen.gananciaTotal = totalCalculadoRedondeado;
        } else {
            const gananciaTotal = parseFloat((resultadoGanancias as any)?.gananciaTotal) || 0;
            respuestaJson.resumen.gananciaTotal = Math.round(gananciaTotal * 10) / 10;
        }

        return res.json(respuestaJson);
    } catch (error) {
        if (error instanceof Error) {
            console.error(error);
            return res.status(500).json({ message: error.message });
        }
    }
};

export const getRecentAlerts = async (req: Request, res: Response) => {
    try {
        const { sucursalId } = req.query;

        const pedidosQuery = Pedido.createQueryBuilder("pedido")
            .innerJoinAndSelect("pedido.Venta", "venta")
            .innerJoinAndSelect("venta.Sucursal", "sucursal")
            .innerJoinAndSelect("pedido.Tipopedido", "tipopedido")
            .innerJoinAndSelect("venta.Persona", "cliente")
            .leftJoinAndSelect("pedido.Detallepedido", "detallepedido")
            .leftJoinAndSelect("detallepedido.Producto", "producto")
            .leftJoinAndSelect("detallepedido.Productomedida", "productomedida")
            .leftJoinAndSelect("detallepedido.Promocion", "promocion")
            .where("tipopedido.IdTipoPedido IN (:...tipos)", { tipos: ['ITP-P1', 'ITP-P2'] });

        if (sucursalId) {
            pedidosQuery.andWhere("sucursal.IdSucursal = :sucursalId", { sucursalId });
        }

        const pedidos = await pedidosQuery.getMany();

        const stockQuery = Inventario.createQueryBuilder("inv")
            .leftJoinAndSelect("inv.Producto", "producto")
            .leftJoinAndSelect("inv.Sucursal", "sucursal");

        if (sucursalId) {
            stockQuery.andWhere("sucursal.IdSucursal = :sucursalId", { sucursalId });
        }

        const stockRecords = await stockQuery.getMany();

        const stockAlerts = stockRecords.filter(s =>
            s.Producto && s.Cantidad <= (s.Producto.StockMinimo || 0)
        );

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sevenDaysFromNow = new Date(today);
        sevenDaysFromNow.setDate(today.getDate() + 7);

        const expiringPromotionsQuery = Promocion.createQueryBuilder("promocion")
            .innerJoinAndSelect("promocion.Rango", "rango")
            .where("rango.FechaFin BETWEEN :today AND :sevenDaysFromNow", { today: today.toISOString().slice(0, 10), sevenDaysFromNow: sevenDaysFromNow.toISOString().slice(0, 10) });

        const expiringPromotions = await expiringPromotionsQuery.getMany();

        const alerts = [
            ...pedidos.map(p => {
                const customerName = `${p.Venta.Persona.Nombre} ${p.Venta.Persona.ApellidoPaterno || ''}`.trim();
                const itemsRequested = p.Detallepedido.map(dp => {
                    if (dp.Producto) return `${dp.Cantidad}x ${dp.Producto.Nombre}`;
                    if (dp.Productomedida) return `${dp.Cantidad}x ${dp.Productomedida.Producto?.Nombre || 'Presentación'}`;
                    if (dp.Promocion) return `${dp.Cantidad}x ${dp.Promocion.Nombre}`;
                    return `${dp.Cantidad}x Item Desconocido`;
                }).join(', ');

                return {
                    type: p.Tipopedido.IdTipoPedido === 'ITP-P1' ? 'Pedido' : 'Reserva',
                    id: p.IdPedido,
                    description: `Pedido #${p.IdPedido} para ${customerName}: ${itemsRequested}`,
                    date: p.FechaRegistro,
                    time: p.Hora,
                };
            }),
            ...stockAlerts.map(s => {
                const alertDate = new Date();
                return {
                    type: 'Stock',
                    id: s.IdInventario,
                    description: `Stock bajo para ${s.Producto?.Nombre || 'Producto'} en ${s.Sucursal.Nombre}: ${s.Cantidad} unidades (mínimo ${s.Producto?.StockMinimo || 0})`,
                    date: alertDate.toISOString().slice(0, 10),
                    time: alertDate.toLocaleTimeString('en-US', { hour12: false }),
                };
            }),
            ...expiringPromotions.map(p => {
                const rawFechaFin = new Date(p.Rango.FechaFin);
                const fechaFin = new Date(rawFechaFin.getFullYear(), rawFechaFin.getMonth(), rawFechaFin.getDate());
                const day = fechaFin.getDate().toString().padStart(2, '0');
                const month = (fechaFin.getMonth() + 1).toString().padStart(2, '0');
                const year = fechaFin.getFullYear();
                const formattedDate = `${day}/${month}/${year}`;
                return {
                    type: 'Promoción por vencer',
                    id: p.IdPromocion,
                    description: `La promoción "${p.Nombre}" esta por vencer`,
                    date: fechaFin.toISOString().slice(0, 10),
                    time: p.Rango.HoraFin,
                };
            }),
        ];

        const sortedAlerts = alerts.sort((a, b) => {
            const toDate = (date: any) => {
                if (date instanceof Date) {
                    return date;
                }
                if (typeof date === 'string' || typeof date === 'number') {
                    const d = new Date(date);
                    if (!isNaN(d.getTime())) {
                        return d;
                    }
                }
                return new Date(0);
            };

            const dateA = toDate(a.date);
            const dateB = toDate(b.date);

            const timeA = a.time ? a.time.toString().split(':').map(Number) : [0, 0, 0];
            const timeB = b.time ? b.time.toString().split(':').map(Number) : [0, 0, 0];

            while (timeA.length < 3) timeA.push(0);
            while (timeB.length < 3) timeB.push(0);

            const dateTimeA = new Date(dateA.getFullYear(), dateA.getMonth(), dateA.getDate(), timeA[0], timeA[1], timeA[2]);
            const dateTimeB = new Date(dateB.getFullYear(), dateB.getMonth(), dateB.getDate(), timeB[0], timeB[1], timeB[2]);

            return dateTimeB.getTime() - dateTimeA.getTime();
        });

        res.json(sortedAlerts.slice(0, 5));
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
