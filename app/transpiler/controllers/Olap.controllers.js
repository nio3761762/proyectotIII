"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentAlerts = exports.getOlapData = exports.getLatestMovements = exports.getOlapDataForDateAndBranch = exports.testDetalleVenta = exports.getDailySummary = exports.getCube = void 0;
const DetalleVenta_1 = require("../entities/DetalleVenta");
const Venta_1 = require("../entities/Venta"); // Import Venta entity
const Pedido_1 = require("../entities/Pedido");
const Persona_1 = require("../entities/Persona");
const Pago_1 = require("../entities/Pago");
const db_1 = require("../db");
const ProductoSucursal_1 = require("../entities/ProductoSucursal");
const Compra_1 = require("../entities/Compra");
const Producto_1 = require("../entities/Producto");
const getCube = async (req, res) => {
    try {
        let { dimensions, startDate, endDate, sucursalId, periodType, periodValue } = req.query;
        const getSinglePeriodDateRange = (periodType, periodValue) => {
            let startDate, endDate;
            switch (periodType) {
                case 'year':
                    const year = parseInt(periodValue);
                    startDate = new Date(year, 0, 1);
                    endDate = new Date(year, 11, 31);
                    break;
                case 'month':
                    const [mYear, month] = periodValue.split('-').map(Number);
                    startDate = new Date(mYear, month - 1, 1);
                    endDate = new Date(mYear, month, 0);
                    break;
                case 'week':
                    const [wYear, week] = periodValue.split('-W').map(Number);
                    const simple = new Date(wYear, 0, 1 + (week - 1) * 7);
                    const dayOfWeek = simple.getDay();
                    const weekStart = simple.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
                    startDate = new Date(simple.setDate(weekStart));
                    endDate = new Date(simple.setDate(weekStart + 6));
                    break;
                default:
                    throw new Error("Invalid periodType");
            }
            return { startDate, endDate };
        };
        if (periodType && periodValue) {
            const range = getSinglePeriodDateRange(periodType, periodValue);
            startDate = range.startDate.toISOString().slice(0, 10);
            endDate = range.endDate.toISOString().slice(0, 10);
        }
        const requestedDimensions = dimensions ? dimensions.split(',') : ['products', 'promotion', 'package', 'sales', 'most_sold'];
        const addFilters = (queryBuilder, entityAlias) => {
            if (startDate && endDate) {
                queryBuilder.andWhere(`${entityAlias}.FechaVenta BETWEEN :startDate AND :endDate`, { startDate, endDate });
            }
            if (sucursalId) {
                queryBuilder.andWhere(`${entityAlias}.Sucursal.IdSucursal = :sucursalId`, { sucursalId });
            }
            return queryBuilder;
        };
        const getSalesByProduct = async () => {
            const query = db_1.AppDataSource.getRepository(DetalleVenta_1.Detalleventa)
                .createQueryBuilder("detalle")
                .select("producto.IdProducto", "productId")
                .addSelect("producto.Nombre", "product")
                .addSelect("TO_CHAR(venta.FechaVenta, 'YYYY-MM-DD')", "date")
                .addSelect("SUM(detalle.Cantidad)", "quantity")
                .addSelect("SUM(detalle.Precio)", "total")
                .innerJoin("detalle.Venta", "venta")
                .innerJoin("detalle.Producto", "producto");
            if (startDate && endDate) {
                query.where("venta.FechaVenta BETWEEN :startDate AND :endDate", { startDate, endDate });
            }
            if (sucursalId) {
                query.andWhere("venta.Sucursal.IdSucursal = :sucursalId", { sucursalId });
            }
            const salesData = await query
                .groupBy("producto.IdProducto, producto.Nombre, TO_CHAR(venta.FechaVenta, 'YYYY-MM-DD')")
                .getRawMany();
            return salesData;
        };
        const getSalesByPromotion = async () => {
            const query = db_1.AppDataSource.getRepository(DetalleVenta_1.Detalleventa)
                .createQueryBuilder("detalle")
                .select("promocion.IdPromocion", "promotionId")
                .addSelect("promocion.Nombre", "promotion")
                .addSelect("TO_CHAR(venta.FechaVenta, 'YYYY-MM-DD')", "date")
                .addSelect("SUM(detalle.Cantidad)", "quantity")
                .addSelect("SUM(detalle.Precio)", "total")
                .innerJoin("detalle.Venta", "venta")
                .leftJoin("detalle.Promocion", "promocion")
                .where("promocion.IdPromocion IS NOT NULL");
            if (startDate && endDate) {
                query.andWhere("venta.FechaVenta BETWEEN :startDate AND :endDate", { startDate, endDate });
            }
            if (sucursalId) {
                query.andWhere("venta.Sucursal.IdSucursal = :sucursalId", { sucursalId });
            }
            const salesData = await query
                .groupBy("promocion.IdPromocion, promocion.Nombre, TO_CHAR(venta.FechaVenta, 'YYYY-MM-DD')")
                .getRawMany();
            return salesData;
        };
        const getSalesByPackage = async () => {
            const query = db_1.AppDataSource.getRepository(DetalleVenta_1.Detalleventa)
                .createQueryBuilder("detalle")
                .select("paquete.IdPaquete", "packageId")
                .addSelect("paquete.Nombre", "package")
                .addSelect("TO_CHAR(venta.FechaVenta, 'YYYY-MM-DD')", "date")
                .addSelect("SUM(detalle.Cantidad)", "quantity")
                .addSelect("SUM(detalle.Precio)", "total")
                .innerJoin("detalle.Venta", "venta")
                .leftJoin("detalle.Paquete", "paquete")
                .where("paquete.IdPaquete IS NOT NULL");
            if (startDate && endDate) {
                query.andWhere("venta.FechaVenta BETWEEN :startDate AND :endDate", { startDate, endDate });
            }
            if (sucursalId) {
                query.andWhere("venta.Sucursal.IdSucursal = :sucursalId", { sucursalId });
            }
            const salesData = await query
                .groupBy("paquete.IdPaquete, paquete.Nombre, TO_CHAR(venta.FechaVenta, 'YYYY-MM-DD')")
                .getRawMany();
            return salesData;
        };
        const getSalesOverview = async () => {
            const query = db_1.AppDataSource.getRepository(Venta_1.Venta)
                .createQueryBuilder("venta")
                .select("CONCAT(persona.Nombre, ' ', persona.ApellidoPaterno, ' ', persona.ApellidoMaterno)", "vendedor")
                .addSelect("cliente.Nombre", "cliente")
                .addSelect("sucursal.Nombre", "sucursal")
                .addSelect("producto.Nombre", "product")
                .addSelect("promocion.Nombre", "promotion")
                .addSelect("paquete.Nombre", "package")
                .addSelect("TO_CHAR(venta.FechaVenta, 'YYYY-MM-DD')", "date")
                .addSelect("COUNT(venta.IdVenta)", "cantidad_ventas")
                .addSelect("SUM(detalle.Precio)", "total_ventas")
                .addSelect("SUM(pago.Monto - pago.Cambio)", "total_ganancias")
                .innerJoin("venta.Usuario", "usuario")
                .innerJoin("usuario.Persona", "persona")
                .innerJoin("venta.Persona", "cliente")
                .innerJoin("venta.Sucursal", "sucursal")
                .innerJoin("venta.Detalleventa", "detalle")
                .leftJoin("detalle.Producto", "producto")
                .leftJoin("detalle.Promocion", "promocion")
                .leftJoin("detalle.Paquete", "paquete")
                .leftJoin("venta.Pago", "pago");
            if (startDate && endDate) {
                query.where("venta.FechaVenta BETWEEN :startDate AND :endDate", { startDate, endDate });
            }
            if (sucursalId) {
                query.andWhere("venta.Sucursal.IdSucursal = :sucursalId", { sucursalId });
            }
            const salesOverviewData = await query
                .groupBy("vendedor, cliente.Nombre, sucursal.Nombre, producto.Nombre, promocion.Nombre, paquete.Nombre, TO_CHAR(venta.FechaVenta, 'YYYY-MM-DD')")
                .getRawMany();
            return salesOverviewData;
        };
        const getMostSold = async () => {
            const getMostSoldProducts = async () => {
                const productsQuery = db_1.AppDataSource.getRepository(DetalleVenta_1.Detalleventa)
                    .createQueryBuilder("detalle")
                    .select("producto.IdProducto", "id")
                    .addSelect("producto.Nombre", "name")
                    .addSelect("imagen.Url", "imageUrl")
                    .addSelect("SUM(detalle.Cantidad)", "unitsSold")
                    .addSelect("SUM(detalle.Cantidad * detalle.Precio)", "totalPrice")
                    .innerJoin("detalle.Venta", "venta")
                    .innerJoin("detalle.Producto", "producto")
                    .leftJoin("producto.Imagen", "imagen")
                    .groupBy("producto.IdProducto, producto.Nombre, imagen.Url")
                    .orderBy("SUM(detalle.Cantidad)", "DESC")
                    .limit(10);
                const filteredQuery = addFilters(productsQuery, "venta");
                return await filteredQuery.getRawMany();
            };
            const getMostSoldPromotions = async () => {
                let promotionsQuery = db_1.AppDataSource.getRepository(DetalleVenta_1.Detalleventa)
                    .createQueryBuilder("detalle")
                    .select("promocion.IdPromocion", "id")
                    .addSelect("promocion.Nombre", "name")
                    .addSelect("imagen.Url", "imageUrl")
                    .addSelect("SUM(detalle.Cantidad)", "unitsSold")
                    .addSelect("SUM(detalle.Precio)", "totalPrice")
                    .innerJoin("detalle.Venta", "venta")
                    .innerJoin("detalle.Promocion", "promocion")
                    .leftJoin("promocion.Imagen", "imagen")
                    .where("promocion.IdPromocion IS NOT NULL")
                    .groupBy("promocion.IdPromocion, promocion.Nombre, imagen.Url")
                    .orderBy("SUM(detalle.Cantidad)", "DESC")
                    .limit(10);
                promotionsQuery = addFilters(promotionsQuery, "venta");
                return await promotionsQuery.getRawMany();
            };
            const getMostSoldPackages = async () => {
                let packagesQuery = db_1.AppDataSource.getRepository(DetalleVenta_1.Detalleventa)
                    .createQueryBuilder("detalle")
                    .select("paquete.IdPaquete", "id")
                    .addSelect("paquete.Nombre", "name")
                    .addSelect("imagen.Url", "imageUrl")
                    .addSelect("SUM(detalle.Cantidad)", "unitsSold")
                    .addSelect("SUM(detalle.Precio)", "totalPrice")
                    .innerJoin("detalle.Venta", "venta")
                    .innerJoin("detalle.Paquete", "paquete")
                    .leftJoin("paquete.Imagen", "imagen")
                    .where("paquete.IdPaquete IS NOT NULL")
                    .groupBy("paquete.IdPaquete, paquete.Nombre, imagen.Url")
                    .orderBy("SUM(detalle.Cantidad)", "DESC")
                    .limit(10);
                packagesQuery = addFilters(packagesQuery, "venta");
                return await packagesQuery.getRawMany();
            };
            const [products, promotions, packages] = await Promise.all([
                getMostSoldProducts(),
                getMostSoldPromotions(),
                getMostSoldPackages()
            ]);
            return { products, promotions, packages };
        };
        const promises = [];
        const dimensionExecutors = {
            products: getSalesByProduct,
            promotion: getSalesByPromotion,
            package: getSalesByPackage,
            sales: getSalesOverview,
            most_sold: getMostSold,
        };
        const response = {};
        for (const dimension of requestedDimensions) {
            const executor = dimensionExecutors[dimension];
            if (executor) {
                promises.push(executor().then(result => {
                    response[dimension] = result;
                }));
            }
        }
        await Promise.all(promises);
        const finalResponse = {
            dimensions: {
                periodType: periodType || null,
                period: (startDate && endDate) ? {
                    value: periodValue || null,
                    startDate: startDate,
                    endDate: endDate
                } : null,
                sucursalId: sucursalId || 'all'
            },
            measures: response
        };
        return res.json(finalResponse);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getCube = getCube;
const getDailySummary = async (req, res) => {
    try {
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        // 1. Total daily profit
        const profitResult = await db_1.AppDataSource.getRepository(Venta_1.Venta)
            .createQueryBuilder("venta")
            .select("SUM(pago.Monto - pago.Cambio)", "totalProfit")
            .leftJoin("venta.Pago", "pago")
            .where("venta.FechaVenta = :today", { today })
            .getRawOne();
        const totalProfit = profitResult?.totalProfit || 0;
        // 2. Number of customers served
        const customersResult = await db_1.AppDataSource.getRepository(Venta_1.Venta)
            .createQueryBuilder("venta")
            .select("COUNT(DISTINCT venta.Persona.IdPersona)", "customerCount")
            .where("venta.FechaVenta = :today", { today })
            .getRawOne();
        const customerCount = customersResult?.customerCount || 0;
        return res.json({
            date: today,
            totalProfit: parseFloat(totalProfit),
            customerCount: parseInt(customerCount),
            // Products sold and stock will be added here later
        });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getDailySummary = getDailySummary;
const testDetalleVenta = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = db_1.AppDataSource.getRepository(DetalleVenta_1.Detalleventa)
            .createQueryBuilder("detalle")
            .select("detalle.IdDetalleVenta", "detalleId")
            .addSelect("promocion.IdPromocion", "promotionId")
            .addSelect("promocion.Nombre", "promotionName")
            .addSelect("paquete.IdPaquete", "packageId")
            .addSelect("paquete.Nombre", "packageName")
            .leftJoin("detalle.Promocion", "promocion")
            .leftJoin("detalle.Paquete", "paquete");
        if (startDate && endDate) {
            query = query
                .innerJoin("detalle.Venta", "venta") // Need to join Venta to filter by date
                .where("venta.FechaVenta BETWEEN :startDate AND :endDate", { startDate, endDate });
        }
        else {
            query = query.where("promocion.IdPromocion IS NOT NULL OR paquete.IdPaquete IS NOT NULL");
        }
        const detalleVentaWithRelations = await query.getRawMany();
        res.json(detalleVentaWithRelations);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
    }
};
exports.testDetalleVenta = testDetalleVenta;
const getOlapDataForDateAndBranch = async (req, res) => {
    try {
        const { periodType, periodValue, startDate, endDate, sucursalId, dimensions } = req.query;
        let current;
        let previous;
        if (startDate && endDate) {
            const currentStartDate = new Date(startDate);
            const currentEndDate = new Date(endDate);
            const duration = currentEndDate.getTime() - currentStartDate.getTime();
            const previousEndDate = new Date(currentStartDate.getTime() - (24 * 60 * 60 * 1000));
            const previousStartDate = new Date(previousEndDate.getTime() - duration);
            current = { startDate: currentStartDate, endDate: currentEndDate };
            previous = { startDate: previousStartDate, endDate: previousEndDate };
        }
        else if (periodType && periodValue) {
            const getPeriodDateRanges = (periodType, periodValue) => {
                let currentStartDate, currentEndDate, previousStartDate, previousEndDate;
                switch (periodType) {
                    case 'year':
                        const year = parseInt(periodValue);
                        currentStartDate = new Date(year, 0, 1);
                        currentEndDate = new Date(year, 11, 31);
                        previousStartDate = new Date(year - 1, 0, 1);
                        previousEndDate = new Date(year - 1, 11, 31);
                        break;
                    case 'month':
                        const [mYear, month] = periodValue.split('-').map(Number);
                        currentStartDate = new Date(mYear, month - 1, 1);
                        currentEndDate = new Date(mYear, month, 0);
                        previousStartDate = new Date(new Date(currentStartDate).setMonth(currentStartDate.getMonth() - 1));
                        previousEndDate = new Date(previousStartDate.getFullYear(), previousStartDate.getMonth() + 1, 0);
                        break;
                    case 'week':
                        const [wYear, week] = periodValue.split('-W').map(Number);
                        const simple = new Date(wYear, 0, 1 + (week - 1) * 7);
                        const dayOfWeek = simple.getDay();
                        const weekStart = simple.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
                        currentStartDate = new Date(simple.setDate(weekStart));
                        currentEndDate = new Date(simple.setDate(weekStart + 6));
                        previousStartDate = new Date(new Date(currentStartDate).setDate(currentStartDate.getDate() - 7));
                        previousEndDate = new Date(new Date(currentEndDate).setDate(currentEndDate.getDate() - 7));
                        break;
                    default:
                        throw new Error("Invalid periodType");
                }
                return {
                    current: { startDate: currentStartDate, endDate: currentEndDate },
                    previous: { startDate: previousStartDate, endDate: previousEndDate }
                };
            };
            const ranges = getPeriodDateRanges(periodType, periodValue);
            current = ranges.current;
            previous = ranges.previous;
        }
        else {
            return res.status(400).json({ message: "Either (startDate and endDate) or (periodType and periodValue) are required." });
        }
        const formatForQuery = (date) => date.toISOString().slice(0, 10);
        const getEarningsAndSalesCount = async (startDate, endDate, sucursalId) => {
            let totalEarningsQuery = DetalleVenta_1.Detalleventa.createQueryBuilder("detalleventa")
                .innerJoin("detalleventa.Venta", "venta")
                .where("venta.FechaVenta BETWEEN :startDate AND :endDate", { startDate, endDate })
                .select("SUM(detalleventa.Cantidad * detalleventa.Precio)", "totalEarnings");
            if (sucursalId && sucursalId !== 'all') {
                totalEarningsQuery = totalEarningsQuery.andWhere("venta.Sucursal.IdSucursal = :sucursalId", { sucursalId });
            }
            const totalEarningsResult = await totalEarningsQuery.getRawOne();
            const totalEarnings = parseFloat(totalEarningsResult.totalEarnings) || 0;
            let salesCountQuery = Venta_1.Venta.createQueryBuilder("venta")
                .where("venta.FechaVenta BETWEEN :startDate AND :endDate", { startDate, endDate })
                .select("COUNT(venta.IdVenta)", "salesCount");
            if (sucursalId && sucursalId !== 'all') {
                salesCountQuery = salesCountQuery.andWhere("venta.Sucursal.IdSucursal = :sucursalId", { sucursalId });
            }
            const salesCountResult = await salesCountQuery.getRawOne();
            const salesCount = parseInt(salesCountResult.salesCount) || 0;
            return {
                totalEarnings,
                salesCount,
            };
        };
        const getTopSellingItems = async (startDate, endDate, sucursalId) => {
            let allDetalleVentaQuery = DetalleVenta_1.Detalleventa.createQueryBuilder("detalleventa")
                .innerJoin("detalleventa.Venta", "venta")
                .leftJoinAndSelect("detalleventa.Producto", "producto")
                .leftJoinAndSelect("detalleventa.Paquete", "paquete")
                .leftJoinAndSelect("paquete.Producto", "paqueteProducto")
                .leftJoinAndSelect("detalleventa.Promocion", "promocion")
                .leftJoinAndSelect("promocion.Promocionproducto", "promocionProducto")
                .leftJoinAndSelect("promocionProducto.Producto", "promoProducto")
                .leftJoinAndSelect("promocionProducto.Paquete", "promoPaquete")
                .leftJoinAndSelect("promoPaquete.Producto", "promoPaqueteProducto")
                .where("venta.FechaVenta BETWEEN :startDate AND :endDate", { startDate, endDate });
            if (sucursalId && sucursalId !== 'all') {
                allDetalleVentaQuery = allDetalleVentaQuery.andWhere("venta.Sucursal.IdSucursal = :sucursalId", { sucursalId });
            }
            const allDetalleVenta = await allDetalleVentaQuery.getMany();
            const productSales = {};
            allDetalleVenta.forEach(detalleventa => {
                if (detalleventa.Producto) {
                    const productName = detalleventa.Producto.Nombre;
                    productSales[productName] = productSales[productName] || { itemName: productName, totalQuantitySold: 0 };
                    productSales[productName].totalQuantitySold += detalleventa.Cantidad;
                }
                else if (detalleventa.Paquete) {
                    if (detalleventa.Paquete.Producto) {
                        const productName = detalleventa.Paquete.Producto.Nombre;
                        productSales[productName] = productSales[productName] || { itemName: productName, totalQuantitySold: 0 };
                        productSales[productName].totalQuantitySold += detalleventa.Cantidad * detalleventa.Paquete.Cantidad;
                    }
                }
                else if (detalleventa.Promocion) {
                    detalleventa.Promocion.Promocionproducto.forEach(promoProducto => {
                        if (promoProducto.Producto) {
                            const productName = promoProducto.Producto.Nombre;
                            productSales[productName] = productSales[productName] || { itemName: productName, totalQuantitySold: 0 };
                            productSales[productName].totalQuantitySold += promoProducto.Cantidad;
                        }
                        else if (promoProducto.Paquete) {
                            if (promoProducto.Paquete.Producto) {
                                const productName = promoProducto.Paquete.Producto.Nombre;
                                productSales[productName] = productSales[productName] || { itemName: productName, totalQuantitySold: 0 };
                                productSales[productName].totalQuantitySold += detalleventa.Cantidad * promoProducto.Cantidad * promoProducto.Paquete.Cantidad;
                            }
                        }
                    });
                }
            });
            const allProductSales = Object.values(productSales);
            const totalQuantityOfAllProductsSold = allProductSales.reduce((sum, product) => sum + product.totalQuantitySold, 0);
            const topSellingItems = allProductSales
                .sort((a, b) => b.totalQuantitySold - a.totalQuantitySold)
                .slice(0, 2);
            return {
                topSellingItems,
                totalQuantityOfAllProductsSold,
            };
        };
        const getCustomerSummary = async (startDate, endDate, sucursalId) => {
            let totalCustomersQuery = Venta_1.Venta.createQueryBuilder("venta")
                .innerJoin("venta.Persona", "persona")
                .where("venta.FechaVenta BETWEEN :startDate AND :endDate", { startDate, endDate })
                .select("COUNT(DISTINCT persona.IdPersona)", "totalCustomers");
            if (sucursalId && sucursalId !== 'all') {
                totalCustomersQuery = totalCustomersQuery.andWhere("venta.Sucursal.IdSucursal = :sucursalId", { sucursalId });
            }
            const totalCustomersResult = await totalCustomersQuery.getRawOne();
            const totalCustomers = parseInt(totalCustomersResult.totalCustomers) || 0;
            let newCustomersQuery = Venta_1.Venta.createQueryBuilder("venta")
                .innerJoin("venta.Persona", "persona")
                .where("venta.FechaVenta BETWEEN :startDate AND :endDate", { startDate, endDate })
                .andWhere("persona.FechaRegistro BETWEEN :startDate AND :endDate", { startDate, endDate })
                .select("COUNT(DISTINCT persona.IdPersona)", "newCustomersCount");
            if (sucursalId && sucursalId !== 'all') {
                newCustomersQuery = newCustomersQuery.andWhere("venta.Sucursal.IdSucursal = :sucursalId", { sucursalId });
            }
            const newCustomersResult = await newCustomersQuery.getRawOne();
            const newCustomers = parseInt(newCustomersResult.newCustomersCount) || 0;
            let recurrentCustomersQuery = Venta_1.Venta.createQueryBuilder("venta")
                .innerJoin("venta.Persona", "persona")
                .where("venta.FechaVenta BETWEEN :startDate AND :endDate", { startDate, endDate })
                .andWhere("persona.FechaRegistro < :startDate", { startDate })
                .select("COUNT(DISTINCT persona.IdPersona)", "recurrentCustomersCount");
            if (sucursalId && sucursalId !== 'all') {
                recurrentCustomersQuery = recurrentCustomersQuery.andWhere("venta.Sucursal.IdSucursal = :sucursalId", { sucursalId });
            }
            const recurrentCustomersResult = await recurrentCustomersQuery.getRawOne();
            const recurrentCustomers = parseInt(recurrentCustomersResult.recurrentCustomersCount) || 0;
            return {
                totalCustomers,
                newCustomers,
                recurrentCustomers,
            };
        };
        const getSalesBySeller = async (startDate, endDate, sucursalId) => {
            let query = Venta_1.Venta.createQueryBuilder("venta")
                .innerJoin("venta.Usuario", "usuario")
                .innerJoin("usuario.Persona", "persona")
                .leftJoin("persona.Imagen", "imagen")
                .where("venta.FechaVenta BETWEEN :startDate AND :endDate", { startDate, endDate })
                .select("persona.IdPersona", "sellerId")
                .addSelect("CONCAT(persona.Nombre, ' ', persona.ApellidoPaterno)", "sellerName")
                .addSelect("imagen.Url", "sellerImage")
                .addSelect("COUNT(venta.IdVenta)", "salesCount")
                .addSelect("SUM(detalle.Precio)", "totalSales")
                .innerJoin("venta.Detalleventa", "detalle")
                .groupBy("persona.IdPersona, sellerName, imagen.Url");
            if (sucursalId && sucursalId !== 'all') {
                query = query.andWhere("venta.Sucursal.IdSucursal = :sucursalId", { sucursalId });
            }
            const salesBySeller = await query.getRawMany();
            return salesBySeller.map(seller => ({
                ...seller,
                salesCount: parseInt(seller.salesCount),
                totalSales: parseFloat(seller.totalSales),
            }));
        };
        const requestedDimensions = dimensions ? dimensions.split(',') : ['productos', 'cliente', 'ganancias', 'vendedor'];
        const promises = [];
        if (requestedDimensions.includes('ganancias')) {
            promises.push(getEarningsAndSalesCount(formatForQuery(current.startDate), formatForQuery(current.endDate), sucursalId));
            promises.push(getEarningsAndSalesCount(formatForQuery(previous.startDate), formatForQuery(previous.endDate), sucursalId));
        }
        if (requestedDimensions.includes('productos')) {
            promises.push(getTopSellingItems(formatForQuery(current.startDate), formatForQuery(current.endDate), sucursalId));
            promises.push(getTopSellingItems(formatForQuery(previous.startDate), formatForQuery(previous.endDate), sucursalId));
        }
        if (requestedDimensions.includes('cliente')) {
            promises.push(getCustomerSummary(formatForQuery(current.startDate), formatForQuery(current.endDate), sucursalId));
            promises.push(getCustomerSummary(formatForQuery(previous.startDate), formatForQuery(previous.endDate), sucursalId));
        }
        if (requestedDimensions.includes('vendedor')) {
            promises.push(getSalesBySeller(formatForQuery(current.startDate), formatForQuery(current.endDate), sucursalId));
            promises.push(getSalesBySeller(formatForQuery(previous.startDate), formatForQuery(previous.endDate), sucursalId));
        }
        const results = await Promise.all(promises);
        let currentPeriodMeasures = {};
        let previousPeriodMeasures = {};
        let resultIndex = 0;
        if (requestedDimensions.includes('ganancias')) {
            currentPeriodMeasures.ganancias = results[resultIndex++];
            previousPeriodMeasures.ganancias = results[resultIndex++];
        }
        if (requestedDimensions.includes('productos')) {
            currentPeriodMeasures.productos = results[resultIndex++];
            previousPeriodMeasures.productos = results[resultIndex++];
        }
        if (requestedDimensions.includes('cliente')) {
            currentPeriodMeasures.cliente = results[resultIndex++];
            previousPeriodMeasures.cliente = results[resultIndex++];
        }
        if (requestedDimensions.includes('vendedor')) {
            currentPeriodMeasures.vendedor = results[resultIndex++];
            previousPeriodMeasures.vendedor = results[resultIndex++];
        }
        const response = {
            dimensions: {
                periodType: periodType || 'custom',
                currentPeriod: {
                    value: periodValue || null,
                    startDate: formatForQuery(current.startDate),
                    endDate: formatForQuery(current.endDate),
                },
                previousPeriod: {
                    startDate: formatForQuery(previous.startDate),
                    endDate: formatForQuery(previous.endDate),
                },
                sucursalId: sucursalId === 'all' ? 'All Branches' : sucursalId,
            },
            measures: {
                currentPeriod: currentPeriodMeasures,
                previousPeriod: previousPeriodMeasures
            }
        };
        return res.json(response);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getOlapDataForDateAndBranch = getOlapDataForDateAndBranch;
const getLatestMovements = async (req, res) => {
    try {
        const { limit = 5, sucursalId } = req.query;
        let salesQuery = Venta_1.Venta.createQueryBuilder("venta")
            .orderBy("venta.FechaVenta", "DESC")
            .addOrderBy("venta.HoraVenta", "DESC")
            .limit(10);
        if (sucursalId) {
            salesQuery = salesQuery.where("venta.Sucursal.IdSucursal = :sucursalId", { sucursalId });
        }
        const latestSalesResult = await salesQuery.getMany();
        const latestSales = await Promise.all(latestSalesResult.map(async (venta) => {
            const detalle = await DetalleVenta_1.Detalleventa.findOne({
                where: { Venta: { IdVenta: venta.IdVenta } },
                relations: ["Producto", "Paquete", "Promocion"]
            });
            const profitResult = await Pago_1.Pago.createQueryBuilder("pago")
                .select("SUM(pago.Monto - pago.Cambio)", "profit")
                .where("pago.Venta.IdVenta = :ventaId", { ventaId: venta.IdVenta })
                .getRawOne();
            const profit = profitResult ? profitResult.profit : 0;
            let description = `Venta #${venta.IdVenta}`;
            if (detalle) {
                if (detalle.Producto) {
                    description += `: ${detalle.Producto.Nombre}`;
                }
                else if (detalle.Paquete) {
                    description += `: ${detalle.Paquete.Nombre}`;
                }
                else if (detalle.Promocion) {
                    description += `: ${detalle.Promocion.Nombre}`;
                }
            }
            return {
                type: 'Venta',
                id: venta.IdVenta,
                description,
                date: venta.FechaVenta,
                time: venta.HoraVenta || '00:00:00',
                profit: parseFloat(profit)
            };
        }));
        let ordersQuery = Pedido_1.Pedido.createQueryBuilder("pedido")
            .innerJoin("pedido.Venta", "venta")
            .innerJoin("venta.Persona", "persona")
            .select([
            "'Pedido' as type",
            "pedido.IdPedido as id",
            "CONCAT('Pedido #', pedido.IdPedido, ' a nombre de ', persona.Nombre, ' ', persona.ApellidoPaterno) as description",
            "TO_CHAR(pedido.FechaRegistro, 'YYYY-MM-DD') as date",
            "pedido.Hora as time",
        ])
            .orderBy("pedido.FechaRegistro", "DESC")
            .addOrderBy("pedido.Hora", "DESC")
            .limit(10);
        if (sucursalId) {
            ordersQuery = ordersQuery.where("venta.Sucursal.IdSucursal = :sucursalId", { sucursalId });
        }
        const latestOrders = await ordersQuery.getRawMany();
        const latestCustomersQuery = Persona_1.Persona.createQueryBuilder("persona")
            .leftJoinAndSelect("persona.Usuario", "usuario")
            .leftJoinAndSelect("persona.Proveedor", "proveedor")
            .orderBy("persona.FechaRegistro", "DESC")
            .limit(10);
        const latestCustomersResult = await latestCustomersQuery.getMany();
        const latestCustomers = await Promise.all(latestCustomersResult.map(async (persona) => {
            let type = 'Cliente';
            let description = `Nuevo cliente: ${persona.Nombre} ${persona.ApellidoPaterno}`;
            if (persona.Usuario) {
                type = 'Usuario';
                description = `Nuevo usuario: ${persona.Nombre} ${persona.ApellidoPaterno}`;
            }
            if (persona.Proveedor) {
                type = 'Proveedor';
                description = `Nuevo proveedor: ${persona.Nombre} ${persona.ApellidoPaterno}`;
            }
            const formattedDate = new Date(persona.FechaRegistro).toISOString().slice(0, 10);
            return {
                type,
                id: persona.IdPersona,
                description,
                date: formattedDate,
                time: persona.HoraRegistro || '00:00:00',
            };
        }));
        const latestPurchasesQuery = Compra_1.Compra.createQueryBuilder("compra")
            .innerJoin("compra.Proveedor", "proveedor")
            .innerJoin("proveedor.Persona", "persona")
            .innerJoin("compra.Detallecompra", "detalle")
            .select([
            "'Compra' as type",
            "compra.IdCompra as id",
            "CONCAT('Compra #', compra.IdCompra, ' a ', persona.Nombre, ' ', persona.ApellidoPaterno) as description",
            "TO_CHAR(compra.FechaCompra, 'YYYY-MM-DD') as date",
            "COALESCE(compra.HoraCompra, '00:00:00') as time",
            "SUM(detalle.Precio * detalle.Cantidad) as total"
        ])
            .orderBy("compra.FechaCompra", "DESC")
            .addOrderBy("compra.HoraCompra", "DESC")
            .groupBy("compra.IdCompra, persona.Nombre, persona.ApellidoPaterno")
            .limit(10);
        const latestPurchases = await latestPurchasesQuery.getRawMany();
        const latestProductsQuery = Producto_1.Producto.createQueryBuilder("producto")
            .select([
            "'Producto' as type",
            "producto.IdProducto as id",
            "CONCAT('Nuevo producto: ', producto.Nombre) as description",
            "TO_CHAR(producto.FechaRegistro, 'YYYY-MM-DD') as date",
            "COALESCE(producto.HoraRegistro, '00:00:00') as time",
        ])
            .orderBy("producto.FechaRegistro", "DESC")
            .addOrderBy("producto.HoraRegistro", "DESC")
            .limit(10);
        const latestProducts = await latestProductsQuery.getRawMany();
        const allActivities = [...latestSales, ...latestOrders, ...latestCustomers, ...latestPurchases, ...latestProducts];
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
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getLatestMovements = getLatestMovements;
const getTotalStock = async (idSucursal) => {
    const result = await ProductoSucursal_1.Productosucursal.createQueryBuilder("productoSucursal")
        .leftJoin("productoSucursal.Sucursal", "sucursal")
        .where("sucursal.IdSucursal = :idSucursal", { idSucursal })
        .select("SUM(productoSucursal.Cantidad)", "totalStock")
        .getRawOne();
    return result.totalStock || 0;
};
const calculateExistingStock = async (idSucursal, fechaFin) => {
    let query = db_1.AppDataSource.getRepository(ProductoSucursal_1.Productosucursal)
        .createQueryBuilder("ps")
        .leftJoinAndSelect("ps.Sucursal", "sucursal")
        .where("ps.Fecha <= :fechaFin", { fechaFin });
    if (idSucursal) {
        query.andWhere("sucursal.IdSucursal = :idSucursal", { idSucursal });
    }
    const stockRecords = await query.getMany();
    const latestRecordMap = new Map();
    for (const record of stockRecords) {
        const uniqueKey = `${record.IdProductoSucursal}`;
        const existing = latestRecordMap.get(uniqueKey);
        if (!existing || record.Fecha > existing.Fecha) {
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
        if (record.StockMinimo !== null && record.StockMinimo < stockMinimo) {
            stockMinimo = record.StockMinimo;
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
const calculateSoldItems = async (idSucursal, fechaInicio, fechaFin) => {
    let query = DetalleVenta_1.Detalleventa.createQueryBuilder("detalleventa")
        .innerJoin("detalleventa.Venta", "venta")
        .leftJoinAndSelect("detalleventa.Producto", "producto")
        .leftJoinAndSelect("detalleventa.Paquete", "paquete")
        .leftJoinAndSelect("paquete.Producto", "paqueteProducto")
        .leftJoinAndSelect("detalleventa.Promocion", "promocion")
        .leftJoinAndSelect("promocion.Promocionproducto", "promocionProducto")
        .leftJoinAndSelect("promocionProducto.Producto", "promoProducto")
        .leftJoinAndSelect("promocionProducto.Paquete", "promoPaquete")
        .leftJoinAndSelect("promoPaquete.Producto", "promoPaqueteProducto")
        .where("venta.FechaVenta BETWEEN :fechaInicio AND :fechaFin", { fechaInicio, fechaFin });
    if (idSucursal) {
        query = query.andWhere("venta.Sucursal.IdSucursal = :idSucursal", { idSucursal });
    }
    const allDetalleVenta = await query.getMany();
    let totalSold = 0;
    for (const detalleventa of allDetalleVenta) {
        if (detalleventa.Producto) {
            totalSold += detalleventa.Cantidad;
        }
        else if (detalleventa.Paquete) {
            totalSold += (detalleventa.Cantidad || 0);
        }
        else if (detalleventa.Promocion) {
            for (const promoItem of detalleventa.Promocion.Promocionproducto) {
                if (promoItem.Producto) {
                    totalSold += (detalleventa.Cantidad || 0) * promoItem.Cantidad;
                }
                else if (promoItem.Paquete) {
                    totalSold += (detalleventa.Cantidad || 0) * promoItem.Cantidad;
                }
            }
        }
    }
    return {
        stockTotal: totalSold,
        stockMinimo: 0 // Not applicable for sold items
    };
};
const getOlapData = async (req, res) => {
    try {
        const { idSucursal, anio, mes, semana, fechaInicio, fechaFin, depurar, idSubcategoria } = req.query;
        if (!anio && !(fechaInicio && fechaFin)) {
            return res.status(400).json({ message: "Se requiere el año o un rango de fechas (fechaInicio y fechaFin)." });
        }
        ///wwwwen e rr
        let objetoFechaInicio, objetoFechaFin;
        if (fechaInicio && fechaFin) {
            objetoFechaInicio = new Date(fechaInicio);
            objetoFechaFin = new Date(fechaFin);
            // If it's a single day, set objetoFechaFin to the end of the day
            if (objetoFechaInicio.toISOString().slice(0, 10) === objetoFechaFin.toISOString().slice(0, 10)) {
                objetoFechaFin.setHours(23, 59, 59, 999);
            }
        }
        else {
            const anioNum = Number(anio);
            if (mes && semana) {
                const fechaSemana = new Date(anioNum, Number(mes) - 1, (Number(semana) - 1) * 7 + 1);
                const diaDeLaSemana = fechaSemana.getDay();
                const diff = fechaSemana.getDate() - diaDeLaSemana + (diaDeLaSemana === 0 ? -6 : 1);
                objetoFechaInicio = new Date(fechaSemana.setDate(diff));
                objetoFechaFin = new Date(fechaSemana.setDate(diff + 6));
            }
            else if (mes) {
                objetoFechaInicio = new Date(anioNum, Number(mes) - 1, 1);
                objetoFechaFin = new Date(anioNum, Number(mes), 0);
            }
            else {
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
        const isTodayOrFuture = (date) => date.toISOString().slice(0, 10) >= hoyFormateado;
        if (fechaInicioFormateada === hoyFormateado && fechaFinFormateada === hoyFormateado) {
            // Condition 1: Single day, today. Show existing stock.
            resumenStock = await calculateExistingStock(idSucursal, objetoFechaFin);
        }
        else if (fechaInicioFormateada === fechaFinFormateada) {
            // Condition 3: Single day, but not today (past or future). Show sold stock.
            const soldItems = await calculateSoldItems(idSucursal, objetoFechaInicio.toISOString().slice(0, 10), objetoFechaFin.toISOString().slice(0, 10));
            const existingStockAtEndDate = await calculateExistingStock(idSucursal, objetoFechaFin);
            resumenStock = {
                stockTotal: soldItems.stockTotal,
                stockMinimo: existingStockAtEndDate.stockMinimo,
                stockCritico: existingStockAtEndDate.stockCritico
            };
        }
        else if (isTodayOrFuture(objetoFechaFin)) {
            // Condition 2: Range ending today or future. Combine existing and sold stock.
            const existingStock = await calculateExistingStock(idSucursal, objetoFechaFin);
            const soldItems = await calculateSoldItems(idSucursal, objetoFechaInicio.toISOString().slice(0, 10), objetoFechaFin.toISOString().slice(0, 10));
            resumenStock = {
                stockTotal: existingStock.stockTotal + soldItems.stockTotal,
                stockMinimo: existingStock.stockMinimo,
                stockCritico: existingStock.stockCritico
            };
        }
        else {
            // Condition 4: Range entirely in the past. Show sold stock.
            const soldItems = await calculateSoldItems(idSucursal, objetoFechaInicio.toISOString().slice(0, 10), objetoFechaFin.toISOString().slice(0, 10));
            const existingStockAtEndDate = await calculateExistingStock(idSucursal, objetoFechaFin);
            resumenStock = {
                stockTotal: soldItems.stockTotal,
                stockMinimo: existingStockAtEndDate.stockMinimo,
                stockCritico: existingStockAtEndDate.stockCritico
            };
        }
        const consultaPrincipal = DetalleVenta_1.Detalleventa.createQueryBuilder("detalle")
            .leftJoinAndSelect("detalle.Venta", "venta")
            .leftJoinAndSelect("venta.Sucursal", "sucursal")
            .leftJoinAndSelect("venta.Persona", "cliente")
            .leftJoinAndSelect("detalle.Producto", "producto")
            .leftJoinAndSelect("producto.Imagen", "producto_imagen")
            .leftJoinAndSelect("producto.Subcategoria", "subcategoria")
            .leftJoinAndSelect("detalle.Paquete", "paquete")
            .leftJoinAndSelect("paquete.Producto", "producto_en_paquete")
            .leftJoinAndSelect("producto_en_paquete.Subcategoria", "subcategoria_en_paquete")
            .leftJoinAndSelect("paquete.Imagen", "paquete_imagen")
            .leftJoinAndSelect("detalle.Promocion", "promocion")
            .leftJoinAndSelect("promocion.Imagen", "promocion_imagen")
            .leftJoinAndSelect("promocion.Promocionproducto", "item_promocion")
            .leftJoinAndSelect("item_promocion.Producto", "producto_en_promocion")
            .leftJoinAndSelect("producto_en_promocion.Subcategoria", "subcategoria_en_promocion")
            .leftJoinAndSelect("item_promocion.Paquete", "paquete_en_promocion")
            .leftJoinAndSelect("paquete_en_promocion.Producto", "producto_en_paquete_promocion")
            .leftJoinAndSelect("producto_en_paquete_promocion.Subcategoria", "subcategoria_en_paquete_promocion")
            .where("venta.FechaVenta BETWEEN :fechaInicioFormateada AND :fechaFinFormateada", { fechaInicioFormateada, fechaFinFormateada });
        if (idSucursal) {
            consultaPrincipal.andWhere("venta.Sucursal.IdSucursal = :idSucursal", { idSucursal });
        }
        if (idSubcategoria) {
            const whereClause = `
              (subcategoria.IdSubcategoria = :idSubcategoria )
            `;
            consultaPrincipal.andWhere(whereClause, { idSubcategoria });
        }
        let promesaGanancias; //sssi 
        if (depurar === 'true') {
            const consultaGananciasDepuracion = Venta_1.Venta.createQueryBuilder("venta")
                .innerJoin("venta.Pago", "pago")
                .where("venta.FechaVenta BETWEEN :fechaInicioFormateada AND :fechaFinFormateada", { fechaInicioFormateada, fechaFinFormateada })
                .select(["venta.IdVenta as saleId", "pago.Monto as amount", "pago.Cambio as change", "venta.FechaVenta as date"]);
            if (idSucursal) {
                consultaGananciasDepuracion.andWhere("venta.Sucursal.IdSucursal = :idSucursal", { idSucursal });
            }
            promesaGanancias = consultaGananciasDepuracion.getRawMany();
        }
        else {
            const consultaGanancias = Venta_1.Venta.createQueryBuilder("venta")
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
        const cubo = {};
        const resumen = {
            ingresoTotal: 0,
            totalItemsVendidos: 0,
            ventasDirectasProducto: 0,
            paquetesVendidos: 0,
            promocionesVendidas: 0,
            clientes: new Set(),
            clientesNuevos: new Set(),
            clientesRecurrentes: new Set(),
            top5Productos: [],
            top5Paquetes: [],
            top5Promociones: [],
            totalVentas: new Set(),
            resumenStock: resumenStock
        };
        const productSalesAggregate = {};
        const packageSalesAggregate = {};
        const promotionSalesAggregate = {};
        for (const detalleVenta of ventasDetalladas) {
            const fecha = new Date(detalleVenta.Venta.FechaVenta).toISOString().slice(0, 10);
            const sucursal = detalleVenta.Venta.Sucursal.Nombre;
            const time = detalleVenta.Venta.HoraVenta;
            const nombreCliente = [detalleVenta.Venta.Persona.Nombre, detalleVenta.Venta.Persona.ApellidoPaterno, detalleVenta.Venta.Persona.ApellidoMaterno].filter(Boolean).join(' ');
            const cantidadDetalle = detalleVenta.Cantidad;
            let tipoItem = 'desconocido';
            let nombreItem = 'N/A';
            let infoItem = { id: '', imageUrl: null };
            let ingresoItem = Number(detalleVenta.Precio);
            const precioDetalle = Number(detalleVenta.Precio);
            if (detalleVenta.Producto) {
                tipoItem = 'producto';
                nombreItem = detalleVenta.Producto.Nombre;
                const productId = `producto_${detalleVenta.Producto.IdProducto}`;
                infoItem = {
                    id: detalleVenta.Producto.IdProducto,
                    imageUrl: detalleVenta.Producto.Imagen?.Url || null,
                    subcategoria: detalleVenta.Producto.Subcategoria?.Nombre
                };
                resumen.ventasDirectasProducto += cantidadDetalle;
                if (!productSalesAggregate[productId]) {
                    productSalesAggregate[productId] = { id: productId, name: nombreItem, imageUrl: infoItem.imageUrl, totalQuantity: 0, totalPrice: 0 };
                }
                productSalesAggregate[productId].totalQuantity += cantidadDetalle;
                productSalesAggregate[productId].totalPrice += cantidadDetalle * precioDetalle;
            }
            else if (detalleVenta.Paquete) {
                tipoItem = 'paquete';
                nombreItem = detalleVenta.Paquete.Nombre;
                const paqueteId = `paquete_${detalleVenta.Paquete.IdPaquete}`;
                infoItem = { id: detalleVenta.Paquete.IdPaquete, imageUrl: detalleVenta.Paquete.Imagen?.Url || null };
                resumen.paquetesVendidos += cantidadDetalle;
                if (!packageSalesAggregate[paqueteId]) {
                    packageSalesAggregate[paqueteId] = { id: paqueteId, name: nombreItem, imageUrl: infoItem.imageUrl, totalQuantity: 0, totalPrice: 0 };
                }
                packageSalesAggregate[paqueteId].totalQuantity += cantidadDetalle;
                packageSalesAggregate[paqueteId].totalPrice += cantidadDetalle * precioDetalle;
                ///hhgug
            }
            else if (detalleVenta.Promocion) {
                tipoItem = 'promocion';
                nombreItem = detalleVenta.Promocion.Nombre;
                const promocionId = `promocion_${detalleVenta.Promocion.IdPromocion}`;
                infoItem = { id: detalleVenta.Promocion.IdPromocion, imageUrl: detalleVenta.Promocion.Imagen?.Url || null };
                resumen.promocionesVendidas += cantidadDetalle;
                if (!promotionSalesAggregate[promocionId]) {
                    promotionSalesAggregate[promocionId] = { id: promocionId, name: nombreItem, imageUrl: infoItem.imageUrl, totalQuantity: 0, totalPrice: 0 };
                }
                promotionSalesAggregate[promocionId].totalQuantity += cantidadDetalle;
                promotionSalesAggregate[promocionId].totalPrice += cantidadDetalle * precioDetalle;
            }
            if (nombreItem === 'N/A')
                continue;
            resumen.totalItemsVendidos += cantidadDetalle;
            if (!cubo[fecha])
                cubo[fecha] = {};
            if (!cubo[fecha][sucursal])
                cubo[fecha][sucursal] = {};
            if (!cubo[fecha][sucursal][tipoItem])
                cubo[fecha][sucursal][tipoItem] = {};
            if (!cubo[fecha][sucursal][tipoItem][nombreItem]) {
                cubo[fecha][sucursal][tipoItem][nombreItem] = {
                    ...infoItem,
                    cantidad: 0,
                    ingreso: 0,
                    time: [],
                    clientes: new Set()
                };
            }
            cubo[fecha][sucursal][tipoItem][nombreItem].cantidad += cantidadDetalle;
            cubo[fecha][sucursal][tipoItem][nombreItem].ingreso += ingresoItem;
            cubo[fecha][sucursal][tipoItem][nombreItem].time.push(time);
            if (nombreCliente) {
                cubo[fecha][sucursal][tipoItem][nombreItem].clientes.add(nombreCliente);
            }
            resumen.ingresoTotal += ingresoItem * cantidadDetalle;
            resumen.totalVentas.add(detalleVenta.Venta.IdVenta);
            const fechaRegistroCliente = new Date(detalleVenta.Venta.Persona.FechaRegistro);
            if (!resumen.clientes.has(detalleVenta.Venta.Persona.IdPersona)) {
                resumen.clientes.add(detalleVenta.Venta.Persona.IdPersona);
                if (fechaRegistroCliente >= objetoFechaInicio && fechaRegistroCliente <= objetoFechaFin) {
                    resumen.clientesNuevos.add(detalleVenta.Venta.Persona.IdPersona);
                }
                else {
                    resumen.clientesRecurrentes.add(detalleVenta.Venta.Persona.IdPersona);
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
                        }
                        else {
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
        const respuestaJson = {
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
            const datosDepuracion = resultadoGanancias;
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
        }
        else {
            const gananciaTotal = parseFloat(resultadoGanancias.gananciaTotal) || 0;
            respuestaJson.resumen.gananciaTotal = Math.round(gananciaTotal * 10) / 10;
        }
        return res.json(respuestaJson);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error);
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getOlapData = getOlapData;
////ssss
// export const getLatestMovements = async (req: Request, res: Response) => {
//     try {
//         const { limit = 5, sucursalId } = req.query;
//         let salesQuery = Venta.createQueryBuilder("venta")
//             .orderBy("venta.FechaVenta", "DESC")
//             .addOrderBy("venta.HoraVenta", "DESC")
//             .limit(10);
//         if (sucursalId) {
//             salesQuery = salesQuery.where("venta.Sucursal.IdSucursal = :sucursalId", { sucursalId });
//         }
//         const latestSalesResult = await salesQuery.getMany();
//         const latestSales = await Promise.all(latestSalesResult.map(async (venta) => {
//             const detalle = await Detalleventa.findOne({
//                 where: { Venta: { IdVenta: venta.IdVenta } },
//                 relations: ["Producto", "Paquete", "Promocion"]
//             });
//             const profitResult = await Pago.createQueryBuilder("pago")
//                 .select("SUM(pago.Monto - pago.Cambio)", "profit")
//                 .where("pago.Venta.IdVenta = :ventaId", { ventaId: venta.IdVenta })
//                 .getRawOne();
//             const profit = profitResult ? profitResult.profit : 0;
//             let description = `Venta #${venta.IdVenta}`;
//             if (detalle) {
//                 if (detalle.Producto) {
//                     description += `: ${detalle.Producto.Nombre}`;
//                 } else if (detalle.Paquete) {
//                     description += `: ${detalle.Paquete.Nombre}`;
//                 } else if (detalle.Promocion) {
//                     description += `: ${detalle.Promocion.Nombre}`;
//                 }
//             }
//             return {
//                 type: 'Venta',
//                 id: venta.IdVenta,
//                 description,
//                 date: venta.FechaVenta,
//                 time: venta.HoraVenta || '00:00:00',
//                 profit: parseFloat(profit)
//             };
//         }));
//         let ordersQuery = Pedido.createQueryBuilder("pedido")
//             .innerJoin("pedido.Venta", "venta")
//             .innerJoin("venta.Persona", "persona")
//             .select([
//                 "'Pedido' as type",
//                 "pedido.IdPedido as id",
//                 "CONCAT('Pedido #', pedido.IdPedido, ' a nombre de ', persona.Nombre, ' ', persona.ApellidoPaterno) as description",
//                "TO_CHAR(pedido.FechaRegistro, 'YYYY-MM-DD') as date",
//                 "pedido.Hora as time",
//             ])
//             .orderBy("pedido.FechaRegistro", "DESC")
//             .addOrderBy("pedido.Hora", "DESC")
//             .limit(10);
//         if (sucursalId) {
//             ordersQuery = ordersQuery.where("venta.Sucursal.IdSucursal = :sucursalId", { sucursalId });
//         }
//         const latestOrders = await ordersQuery.getRawMany();
//         const latestCustomersQuery = Persona.createQueryBuilder("persona")
//             .leftJoinAndSelect("persona.Usuario", "usuario")
//             .leftJoinAndSelect("persona.Proveedor", "proveedor")
//             .orderBy("persona.FechaRegistro", "DESC")
//             .limit(10);
//         const latestCustomersResult = await latestCustomersQuery.getMany();
//         const latestCustomers = await Promise.all(latestCustomersResult.map(async (persona) => {
//             let type = 'Cliente';
//             let description = `Nuevo cliente: ${persona.Nombre} ${persona.ApellidoPaterno}`;
//             if (persona.Usuario) {
//                 type = 'Usuario';
//                 description = `Nuevo usuario: ${persona.Nombre} ${persona.ApellidoPaterno}`;
//             }
//             if (persona.Proveedor) {
//                 type = 'Proveedor';
//                 description = `Nuevo proveedor: ${persona.Nombre} ${persona.ApellidoPaterno}`;
//             }
//             const formattedDate = new Date(persona.FechaRegistro).toISOString().slice(0, 10);
//             return {
//                 type,
//                 id: persona.IdPersona,
//                 description,
//                 date: formattedDate,
//                 time: persona.HoraRegistro || '00:00:00',
//             };
//         }));
//         const latestPurchasesQuery = Compra.createQueryBuilder("compra")
//             .innerJoin("compra.Proveedor", "proveedor")
//             .innerJoin("proveedor.Persona", "persona")
//             .innerJoin("compra.Detallecompra", "detalle")
//             .select([
//                 "'Compra' as type",
//                 "compra.IdCompra as id",
//                 "CONCAT('Compra #', compra.IdCompra, ' a ', persona.Nombre, ' ', persona.ApellidoPaterno) as description",
//                 "TO_CHAR(compra.FechaCompra, 'YYYY-MM-DD') as date",
//                 "COALESCE(compra.HoraCompra, '00:00:00') as time",
//                 "SUM(detalle.Precio * detalle.Cantidad) as total"
//             ])
//             .orderBy("compra.FechaCompra", "DESC")
//             .addOrderBy("compra.HoraCompra", "DESC")
//             .groupBy("compra.IdCompra, persona.Nombre, persona.ApellidoPaterno")
//             .limit(10);
//         const latestPurchases = await latestPurchasesQuery.getRawMany();
//         const latestProductsQuery = Producto.createQueryBuilder("producto")
//             .select([
//                 "'Producto' as type",
//                 "producto.IdProducto as id",
//                 "CONCAT('Nuevo producto: ', producto.Nombre) as description",
//                 "TO_CHAR(producto.FechaRegistro, 'YYYY-MM-DD') as date",
//                 "COALESCE(producto.HoraRegistro, '00:00:00') as time",
//             ])
//             .orderBy("producto.FechaRegistro", "DESC")
//             .addOrderBy("producto.HoraRegistro", "DESC")
//             .limit(10);
//         const latestProducts = await latestProductsQuery.getRawMany();
//         const allActivities = [...latestSales, ...latestOrders, ...latestCustomers, ...latestPurchases, ...latestProducts];
//         const sortedActivities = allActivities.sort((a, b) => {
//             const dateA = new Date(a.date);
//             const dateB = new Date(b.date);
//             const timeA = a.time ? a.time.toString().split(':') : [0,0,0];
//             const timeB = b.time ? b.time.toString().split(':') : [0,0,0];
//             const dateTimeA = new Date(dateA.getFullYear(), dateA.getMonth(), dateA.getDate(), timeA[0], timeA[1], timeA[2]);
//             const dateTimeB = new Date(dateB.getFullYear(), dateB.getMonth(), dateB.getDate(), timeB[0], timeB[1], timeB[2]);
//             return dateTimeB.getTime() - dateTimeA.getTime();
//         });
//         const recentActivities = sortedActivities.slice(0, Number(limit));
//         return res.json(recentActivities);
//     } catch (error) {
//         if (error instanceof Error) {
//             return res.status(500).json({ message: error.message });
//         }
//     }
// };  
const getRecentAlerts = async (req, res) => {
    try {
        const { sucursalId } = req.query;
        const pedidosQuery = Pedido_1.Pedido.createQueryBuilder("pedido")
            .innerJoinAndSelect("pedido.Venta", "venta")
            .innerJoinAndSelect("venta.Sucursal", "sucursal")
            .where("pedido.Tipopedido.IdTipoPedido IN (:...tipos)", { tipos: ['ITP-P1', 'ITP-P2'] });
        if (sucursalId) {
            pedidosQuery.andWhere("sucursal.IdSucursal = :sucursalId", { sucursalId });
        }
        const pedidos = await pedidosQuery.getMany();
        const stockQuery = ProductoSucursal_1.Productosucursal.createQueryBuilder("productoSucursal")
            .innerJoinAndSelect("productoSucursal.Producto", "producto")
            .innerJoinAndSelect("productoSucursal.Sucursal", "sucursal")
            .where("productoSucursal.Cantidad <= productoSucursal.StockMinimo");
        if (sucursalId) {
            stockQuery.andWhere("sucursal.IdSucursal = :sucursalId", { sucursalId });
        }
        const stockAlerts = await stockQuery.getMany();
        const alerts = [
            ...pedidos.map(p => ({
                type: p.Tipopedido.IdTipoPedido === 'ITP-P1' ? 'Pedido' : 'Reserva',
                id: p.IdPedido,
                description: `Pedido #${p.IdPedido}`,
                date: p.FechaRegistro,
                time: p.Hora,
            })),
            ...stockAlerts.map(s => ({
                type: 'Stock',
                id: s.IdProductoSucursal,
                description: `Stock bajo para ${s.Producto.Nombre} en ${s.Sucursal.Nombre}`,
                date: new Date(),
                time: new Date().toLocaleTimeString(),
            })),
        ];
        const sortedAlerts = alerts.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            const timeA = a.time.toString().split(':');
            const timeB = b.time.toString().split(':');
            const dateTimeA = new Date(dateA.getFullYear(), dateA.getMonth(), dateA.getDate(), parseInt(timeA[0]), parseInt(timeA[1]), parseInt(timeA[2]));
            const dateTimeB = new Date(dateB.getFullYear(), dateB.getMonth(), dateB.getDate(), parseInt(timeB[0]), parseInt(timeB[1]), parseInt(timeB[2]));
            return dateTimeB.getTime() - dateTimeA.getTime();
        });
        res.json(sortedAlerts.slice(0, 5));
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getRecentAlerts = getRecentAlerts;
