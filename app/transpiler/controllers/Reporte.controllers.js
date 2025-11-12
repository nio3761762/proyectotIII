"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReporteInsumos = exports.getVentasReportes = exports.getReporteEntregas = exports.getReportePedidos = exports.getReporteProductos = void 0;
const DetalleCompra_1 = require("../entities/DetalleCompra");
const Producto_1 = require("../entities/Producto");
const Pedido_1 = require("../entities/Pedido");
const Entrega_1 = require("../entities/Entrega");
const typeorm_1 = require("typeorm");
const Venta_1 = require("../entities/Venta");
const DetalleVenta_1 = require("../entities/DetalleVenta");
const ProductoSucursal_1 = require("../entities/ProductoSucursal");
const Ingrediente_1 = require("../entities/Ingrediente"); // Added
const UnidadMedida_1 = require("../entities/UnidadMedida"); // Added
const getReporteProductos = async (req, res) => {
    try {
        const { fechadesde, fechahasta, sucursales, subcategorias } = req.query;
        if (!fechadesde || !fechahasta) {
            return res.status(400).json({ message: "Los parámetros 'fechadesde' y 'fechahasta' son obligatorios." });
        }
        const startDate = new Date(fechadesde);
        const endDate = new Date(fechahasta);
        endDate.setHours(23, 59, 59, 999);
        const sucursalesIds = sucursales ? sucursales.split(',') : [];
        const subcategoriasIds = subcategorias ? subcategorias.split(',') : [];
        // 1. Productos vendidos agrupados por fecha
        const soldProductsQuery = DetalleVenta_1.Detalleventa.createQueryBuilder("detalleventa")
            .select("DATE(venta.FechaVenta)", "fecha")
            .addSelect("producto.IdProducto", "IdProducto")
            .addSelect("producto.Nombre", "NombreProducto")
            .addSelect("subcategoria.Nombre", "Subcategoria")
            .addSelect("imagen.Url", "UrlImagen")
            .addSelect("SUM(detalleventa.Cantidad)", "cantidadVendida")
            .innerJoin("detalleventa.Producto", "producto")
            .innerJoin("producto.Subcategoria", "subcategoria")
            .innerJoin("detalleventa.Venta", "venta")
            .innerJoin("producto.Tipoproducto", "tipoproducto")
            .leftJoin("producto.Imagen", "imagen")
            .where("venta.FechaVenta BETWEEN :startDate AND :endDate", { startDate, endDate })
            .andWhere("tipoproducto.IdTipoProducto = :idTipoProducto", { idTipoProducto: 'ITP-2' });
        if (sucursalesIds.length > 0) {
            soldProductsQuery.innerJoin("venta.Sucursal", "sucursal")
                .andWhere("sucursal.IdSucursal IN (:...sucursalesIds)", { sucursalesIds });
        }
        if (subcategoriasIds.length > 0) {
            soldProductsQuery.andWhere("subcategoria.IdSubcategoria IN (:...subcategoriasIds)", { subcategoriasIds });
        }
        const productosVendidos = await soldProductsQuery
            .groupBy("DATE(venta.FechaVenta), producto.IdProducto, producto.Nombre, subcategoria.Nombre, imagen.Url")
            .orderBy("fecha", "ASC")
            .addOrderBy("SUM(detalleventa.Cantidad)", "DESC")
            .getRawMany();
        const reportePorFecha = {};
        // Agrupar resultados por fecha
        for (const vendido of productosVendidos) {
            const fecha = new Date(vendido.fecha).toISOString().split('T')[0];
            if (!reportePorFecha[fecha]) {
                reportePorFecha[fecha] = {
                    productosVendidos: [],
                    productosBajoMovimiento: [],
                    productosDisponibles: [],
                    consumoInsumos: {}
                };
            }
            reportePorFecha[fecha].productosVendidos.push(vendido);
        }
        const allProductsQuery = Producto_1.Producto.createQueryBuilder("producto")
            .select("producto.IdProducto", "IdProducto")
            .addSelect("producto.Nombre", "NombreProducto")
            .addSelect("imagen.Url", "UrlImagen")
            .innerJoin("producto.Subcategoria", "subcategoria")
            .innerJoin("producto.Tipoproducto", "tipoproducto")
            .leftJoin("producto.Imagen", "imagen")
            .where("tipoproducto.IdTipoProducto = :idTipoProducto", { idTipoProducto: 'ITP-2' });
        if (subcategoriasIds.length > 0) {
            allProductsQuery.andWhere("subcategoria.IdSubcategoria IN (:...subcategoriasIds)", { subcategoriasIds });
        }
        const allProducts = await allProductsQuery.getRawMany();
        const allUnidadesMedida = await UnidadMedida_1.Unidadmedida.find();
        const unidadMedidaMap = new Map(allUnidadesMedida.map(um => [um.IdUnidadMedida, um]));
        const BASE_UNIT_ID = 1;
        const baseUnit = unidadMedidaMap.get(BASE_UNIT_ID);
        if (!baseUnit) {
            console.warn("Unidad de medida base no encontrada. El consumo de insumos puede ser inexacto.");
        }
        for (const fecha in reportePorFecha) {
            const productosVendidosHoy = reportePorFecha[fecha].productosVendidos;
            const soldProductsMap = new Map(productosVendidosHoy.map((p) => [p.IdProducto, Number(p.cantidadVendida)]));
            const productosConMovimiento = allProducts.map((p) => ({
                IdProducto: p.IdProducto,
                NombreProducto: p.NombreProducto,
                UrlImagen: p.UrlImagen,
                cantidadVendida: Number(soldProductsMap.get(p.IdProducto)) || 0
            }));
            reportePorFecha[fecha].productosBajoMovimiento = productosConMovimiento
                .sort((a, b) => a.cantidadVendida - b.cantidadVendida)
                .slice(0, 10);
            const availableProductsQuery = ProductoSucursal_1.Productosucursal.createQueryBuilder("productosucursal")
                .select("producto.IdProducto", "IdProducto")
                .addSelect("producto.Nombre", "NombreProducto")
                .addSelect("imagen.Url", "UrlImagen")
                .addSelect("SUM(productosucursal.Cantidad)", "StockTotal")
                .innerJoin("productosucursal.Producto", "producto")
                .innerJoin("producto.Tipoproducto", "tipoproducto")
                .innerJoin("producto.Subcategoria", "subcat_stock")
                .leftJoin("producto.Imagen", "imagen")
                .where("tipoproducto.IdTipoProducto = :idTipoProducto", { idTipoProducto: 'ITP-2' });
            if (sucursalesIds.length > 0) {
                availableProductsQuery.andWhere("productosucursal.IdSucursal IN (:...sucursalesIds)", { sucursalesIds });
            }
            if (subcategoriasIds.length > 0) {
                availableProductsQuery.andWhere("subcat_stock.IdSubcategoria IN (:...subcategoriasIds)", { subcategoriasIds });
            }
            availableProductsQuery.groupBy("producto.IdProducto, producto.Nombre, imagen.Url");
            reportePorFecha[fecha].productosDisponibles = await availableProductsQuery.getRawMany();
            const allSoldProductIds = productosVendidosHoy.map((p) => p.IdProducto);
            if (allSoldProductIds.length > 0 && baseUnit) {
                const ingredientesVendidos = await Ingrediente_1.Ingrediente.createQueryBuilder("ingrediente")
                    .innerJoinAndSelect("ingrediente.Producto", "insumoProducto")
                    .innerJoinAndSelect("ingrediente.Unidadmedida", "unidadInsumo")
                    .innerJoinAndSelect("ingrediente.Ingredientes", "productoFinal")
                    .where("productoFinal.IdProducto IN (:...allSoldProductIds)", { allSoldProductIds })
                    .andWhere("insumoProducto.Tipoproducto.IdTipoProducto = :insumoTipoId", { insumoTipoId: 'ITP-1' })
                    .getMany();
                for (const vendido of productosVendidosHoy) {
                    const cantidadProductoVendido = parseFloat(vendido.cantidadVendida);
                    const ingredientesDelProducto = ingredientesVendidos.filter(ing => ing.Ingredientes.IdProducto === vendido.IdProducto);
                    for (const ingrediente of ingredientesDelProducto) {
                        const insumoId = ingrediente.Producto.IdProducto;
                        const insumoNombre = ingrediente.Producto.Nombre;
                        const pesoIngrediente = ingrediente.Peso;
                        const unidadIngrediente = unidadMedidaMap.get(ingrediente.Unidadmedida.IdUnidadMedida);
                        if (unidadIngrediente && baseUnit) {
                            const pesoEnBaseUnit = (parseFloat(ingrediente.Peso.toString()) * parseFloat(unidadIngrediente.Cantidad.toString())) / parseFloat(baseUnit.Cantidad.toString());
                            const consumoTotalInsumo = parseFloat(vendido.cantidadVendida) * pesoEnBaseUnit;
                            if (!reportePorFecha[fecha].consumoInsumos[insumoId]) {
                                reportePorFecha[fecha].consumoInsumos[insumoId] = {
                                    IdInsumo: insumoId,
                                    NombreInsumo: insumoNombre,
                                    CantidadConsumida: 0,
                                    UnidadBase: baseUnit.Nombre
                                };
                            }
                            reportePorFecha[fecha].consumoInsumos[insumoId].CantidadConsumida += consumoTotalInsumo;
                        }
                    }
                }
            }
            reportePorFecha[fecha].consumoInsumos = Object.values(reportePorFecha[fecha].consumoInsumos);
        }
        return res.json({
            reportePorFecha
        });
    }
    catch (error) {
        console.error("Error en getReporteProductos:", error);
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
        return res.status(500).json({ message: "Error desconocido al generar el reporte de productos." });
    }
};
exports.getReporteProductos = getReporteProductos;
const getReportePedidos = async (req, res) => {
    try {
        const { fechadesde, fechahasta, IdSucursal, IdEstado, IdEstadoVenta, IdMetodoPago, TipoCliente, agrupacion } = req.query;
        if (!fechadesde || !fechahasta) {
            return res.status(400).json({ message: "Los parámetros 'fechadesde' y 'fechahasta' son obligatorios para este reporte." });
        }
        const where = {};
        const startDate = new Date(fechadesde);
        const endDate = new Date(fechahasta);
        // Ajustar la fecha final para incluir todo el día
        endDate.setHours(23, 59, 59, 999);
        where.FechaRegistro = (0, typeorm_1.Between)(startDate, endDate);
        if (IdSucursal) {
            where.Venta = { ...where.Venta, Sucursal: { IdSucursal: IdSucursal } };
        }
        if (IdEstado) {
            where.Estado = { IdEstado: IdEstado };
        }
        if (IdEstadoVenta) {
            where.Venta = { ...where.Venta, Estado: { IdEstado: IdEstadoVenta } };
        }
        if (IdMetodoPago) {
            where.Venta = { ...where.Venta, Pago: { Metodopago: { IdMetodoPago: IdMetodoPago } } };
        }
        if (TipoCliente === 'mayorista') {
            where.Distribuciones = { IdDistribucion: (0, typeorm_1.Not)((0, typeorm_1.IsNull)()) };
        }
        else if (TipoCliente === 'normal') {
            where.Distribuciones = { IdDistribucion: (0, typeorm_1.IsNull)() };
        }
        const pedidos = await Pedido_1.Pedido.find({
            relations: [
                "Estado",
                "Venta",
                "Venta.Persona",
                "Venta.Sucursal",
                "Venta.Estado",
                "Venta.Pago",
                "Venta.Pago.Metodopago",
                "Tipopedido",
                "Detallepedido",
                "Detallepedido.Producto",
                "Detallepedido.Paquete",
                "Detallepedido.Promocion",
                "Distribuciones",
            ],
            where: where,
            order: {
                FechaRegistro: "DESC"
            }
        });
        if (pedidos.length === 0) {
            return res.json([]);
        }
        const pedidosAgrupadosPorFecha = {};
        pedidos.forEach(pedido => {
            const fecha = new Date(pedido.FechaRegistro).toISOString().split('T')[0];
            if (!pedidosAgrupadosPorFecha[fecha]) {
                pedidosAgrupadosPorFecha[fecha] = [];
            }
            // Mapear la información de la persona de la venta asociada al pedido
            let nombreCompletoPersona = "";
            if (pedido.Venta && pedido.Venta.Persona) {
                nombreCompletoPersona = `${pedido.Venta.Persona.Nombre} ${pedido.Venta.Persona.ApellidoPaterno || ""} ${pedido.Venta.Persona.ApellidoMaterno || ""}`.trim();
            }
            // Mapear la información de pago de la venta asociada al pedido
            const pagosMapeados = pedido.Venta && pedido.Venta.Pago ? pedido.Venta.Pago.map(pago => ({
                Monto: pago.Monto,
                Cambio: pago.Cambio,
                Total: pago.Monto - pago.Cambio,
                MetodoPago: pago.Metodopago ? pago.Metodopago.Nombre : "Desconocido"
            })) : [];
            // Mapear la información del estado del pedido
            const estadoPedidoMapeado = pedido.Estado ? pedido.Estado.Nombre : "Desconocido";
            // Mapear los detalles del pedido
            const detallesPedidoMapeados = pedido.Detallepedido ? pedido.Detallepedido.map(detalle => {
                const mappedDetalle = { ...detalle };
                if (mappedDetalle.Producto) {
                    mappedDetalle.Producto = {
                        IdProducto: mappedDetalle.Producto.IdProducto,
                        Nombre: mappedDetalle.Producto.Nombre
                    };
                }
                else if (mappedDetalle.Paquete) {
                    mappedDetalle.Paquete = {
                        IdPaquete: mappedDetalle.Paquete.IdPaquete,
                        Nombre: mappedDetalle.Paquete.Nombre
                    };
                }
                else if (mappedDetalle.Promocion) {
                    mappedDetalle.Promocion = {
                        IdPromocion: mappedDetalle.Promocion.IdPromocion,
                        Nombre: mappedDetalle.Promocion.Nombre
                    };
                }
                return mappedDetalle;
            }) : [];
            const pedidoMapeado = {
                ...pedido,
                Venta: {
                    ...pedido.Venta,
                    Persona: nombreCompletoPersona,
                    Pago: pagosMapeados,
                },
                Estado: estadoPedidoMapeado,
                Detallepedido: detallesPedidoMapeados
            };
            pedidosAgrupadosPorFecha[fecha].push(pedidoMapeado);
        });
        // Calcular totales por fecha
        const reporteFinal = {};
        for (const fecha in pedidosAgrupadosPorFecha) {
            let totalIngresoFecha = 0;
            const clientesAtendidos = new Set();
            let totalPedidosFecha = 0;
            pedidosAgrupadosPorFecha[fecha].forEach(pedido => {
                if (pedido.Venta && pedido.Venta.Pago) {
                    pedido.Venta.Pago.forEach((pago) => {
                        totalIngresoFecha += pago.Total;
                    });
                }
                if (pedido.Venta && pedido.Venta.Persona) {
                    clientesAtendidos.add(pedido.Venta.Persona);
                }
                totalPedidosFecha++;
            });
            reporteFinal[fecha] = {
                pedidos: pedidosAgrupadosPorFecha[fecha],
                totalIngreso: totalIngresoFecha,
                totalClientesAtendidos: clientesAtendidos.size,
                totalPedidos: totalPedidosFecha
            };
        }
        // Calcular totales generales
        let granTotalIngresos = 0;
        const granTotalClientesSet = new Set();
        let granTotalPedidos = 0;
        for (const fecha in reporteFinal) {
            granTotalIngresos += reporteFinal[fecha].totalIngreso;
            granTotalPedidos += reporteFinal[fecha].totalPedidos;
            reporteFinal[fecha].pedidos.forEach(pedido => {
                if (pedido.Venta && pedido.Venta.Persona) {
                    granTotalClientesSet.add(pedido.Venta.Persona);
                }
            });
        }
        return res.json({
            reportePorFecha: reporteFinal,
            granTotalIngresos: granTotalIngresos,
            granTotalClientes: granTotalClientesSet.size,
            granTotalPedidos: granTotalPedidos
        });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getReportePedidos = getReportePedidos;
const getReporteEntregas = async (req, res) => {
    try {
        const entregas = await Entrega_1.Entrega.find({
            relations: [
                "Estado",
                "Pedido",
                "Pedido.Venta.Persona",
                "Direccion",
                "Direccion.Barrio",
                "Repartidor",
                "Repartidor.Persona",
                "Tipoentrega",
            ],
            order: {
                FechaEntrega: "DESC"
            }
        });
        if (entregas.length === 0) {
            return res.json([]);
        }
        return res.json(entregas);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getReporteEntregas = getReporteEntregas;
const getVentasReportes = async (req, res) => {
    try {
        const { IdSucursal, fechadesde, fechahasta, Metodopago, IdVendedor } = req.query;
        if (!fechadesde || !fechahasta) {
            return res.status(400).json({ message: "Los parámetros 'fechadesde' y 'fechahasta' son obligatorios para este reporte." });
        }
        const startDate = new Date(fechadesde);
        const endDate = new Date(fechahasta);
        endDate.setHours(23, 59, 59, 999);
        const where = {};
        where.FechaVenta = (0, typeorm_1.Raw)(alias => `DATE(${alias}) BETWEEN :startDate AND :endDate`, {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        });
        if (IdSucursal && IdSucursal !== "TODOS") {
            where.Sucursal = { IdSucursal: IdSucursal };
        }
        if (Metodopago && Number(Metodopago) !== 0) {
            where.Pago = { Metodopago: { IdMetodoPago: Number(Metodopago) } };
        }
        if (IdVendedor && IdVendedor !== "TODOS") {
            where.Usuario = { IdUsuario: IdVendedor };
        }
        const ventas = await Venta_1.Venta.find({
            relations: [
                "Persona",
                "Pago",
                "Pago.Metodopago",
                "Detalleventa",
                "Detalleventa.Producto",
                "Detalleventa.Paquete",
                "Detalleventa.Promocion",
                "Estado", // Added Estado relation
            ],
            where: where,
            order: {
                FechaVenta: "DESC"
            }
        });
        // Now, group by date in application logic
        const ventasAgrupadasPorFecha = {};
        ventas.forEach(venta => {
            const fecha = new Date(venta.FechaVenta).toISOString().split('T')[0]; // YYYY-MM-DD
            if (!ventasAgrupadasPorFecha[fecha]) {
                ventasAgrupadasPorFecha[fecha] = [];
            }
            // Mapear la información de la persona
            let nombreCompletoPersona = "";
            if (venta.Persona) {
                nombreCompletoPersona = `${venta.Persona.Nombre} ${venta.Persona.ApellidoPaterno || ""} ${venta.Persona.ApellidoMaterno || ""}`.trim();
            }
            // Mapear la información de pago
            const pagosMapeados = venta.Pago ? venta.Pago.map(pago => ({
                Monto: pago.Monto,
                Cambio: pago.Cambio,
                Total: pago.Monto - pago.Cambio,
                MetodoPago: pago.Metodopago ? pago.Metodopago.Nombre : "Desconocido"
            })) : [];
            // Mapear la información del estado
            const estadoMapeado = venta.Estado ? venta.Estado.Nombre : "Desconocido";
            // Mapear los detalles de venta para incluir solo Id y Nombre del producto, paquete o promoción
            const detallesVentaMapeados = venta.Detalleventa.map(detalle => {
                const mappedDetalle = { ...detalle };
                if (mappedDetalle.Producto) {
                    mappedDetalle.Producto = {
                        IdProducto: mappedDetalle.Producto.IdProducto,
                        Nombre: mappedDetalle.Producto.Nombre
                    };
                }
                else if (mappedDetalle.Paquete) {
                    mappedDetalle.Paquete = {
                        IdPaquete: mappedDetalle.Paquete.IdPaquete,
                        Nombre: mappedDetalle.Paquete.Nombre
                    };
                    // If a package has a product, map that too
                }
                else if (mappedDetalle.Promocion) {
                    mappedDetalle.Promocion = {
                        IdPromocion: mappedDetalle.Promocion.IdPromocion,
                        Nombre: mappedDetalle.Promocion.Nombre
                    };
                }
                return mappedDetalle;
            });
            // Crear un nuevo objeto de venta con la persona, pagos, estado y detalles de venta mapeados
            const ventaMapeada = {
                ...venta,
                Persona: nombreCompletoPersona, // Reemplazar el objeto Persona con la cadena
                Pago: pagosMapeados, // Reemplazar el array de Pago con el array mapeado
                Estado: estadoMapeado, // Reemplazar el objeto Estado con el nombre
                Detalleventa: detallesVentaMapeados // Reemplazar el array de Detalleventa con el array mapeado
            };
            ventasAgrupadasPorFecha[fecha].push(ventaMapeada);
        });
        // Calcular el total de ingresos y clientes atendidos por fecha
        const reporteFinal = {};
        for (const fecha in ventasAgrupadasPorFecha) {
            let totalIngresoFecha = 0;
            const clientesAtendidos = new Set();
            let totalVentasAnuladasFecha = 0;
            ventasAgrupadasPorFecha[fecha].forEach(venta => {
                venta.Pago.forEach((pago) => {
                    totalIngresoFecha += pago.Total;
                });
                if (venta.Persona) {
                    clientesAtendidos.add(venta.Persona);
                }
                if (venta.Estado === "Anulado") {
                    totalVentasAnuladasFecha++;
                }
            });
            reporteFinal[fecha] = {
                ventas: ventasAgrupadasPorFecha[fecha],
                totalIngreso: totalIngresoFecha,
                totalClientesAtendidos: clientesAtendidos.size,
                totalVentasAnuladas: totalVentasAnuladasFecha
            };
        }
        // Calcular el total general de ingresos, clientes atendidos y productos vendidos
        let granTotalIngresos = 0;
        const granTotalClientesSet = new Set();
        let granTotalProductosVendidos = 0;
        let granTotalVentasAnuladas = 0;
        for (const fecha in reporteFinal) {
            granTotalIngresos += reporteFinal[fecha].totalIngreso;
            granTotalVentasAnuladas += reporteFinal[fecha].totalVentasAnuladas;
            reporteFinal[fecha].ventas.forEach(venta => {
                if (venta.Persona) {
                    granTotalClientesSet.add(venta.Persona);
                }
                if (venta.Detalleventa) {
                    venta.Detalleventa.forEach((detalle) => {
                        granTotalProductosVendidos += detalle.Cantidad;
                    });
                }
            });
        }
        return res.json({
            reportePorFecha: reporteFinal,
            granTotalIngresos: granTotalIngresos,
            granTotalClientes: granTotalClientesSet.size,
            granTotalProductosVendidos: granTotalProductosVendidos,
            granTotalVentasAnuladas: granTotalVentasAnuladas
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: error instanceof Error ? error.message : "Error desconocido" });
    }
};
exports.getVentasReportes = getVentasReportes;
const getReporteInsumos = async (req, res) => {
    try {
        const { fechadesde, fechahasta, IdSucursal } = req.query;
        if (!fechadesde || !fechahasta) {
            return res.status(400).json({ message: "Los parámetros 'fechadesde' y 'fechahasta' son obligatorios." });
        }
        const startDate = new Date(fechadesde);
        const endDate = new Date(fechahasta);
        endDate.setHours(23, 59, 59, 999);
        // 1. Obtener todas las unidades de medida para la conversión
        const allUnidadesMedida = await UnidadMedida_1.Unidadmedida.find();
        const unidadMedidaMap = new Map(allUnidadesMedida.map(um => [um.IdUnidadMedida, um]));
        const BASE_UNIT_ID = 1; // Asumiendo que 1 = 'gramos' o una unidad base
        const baseUnit = unidadMedidaMap.get(BASE_UNIT_ID);
        if (!baseUnit) {
            return res.status(500).json({ message: "Unidad de medida base no encontrada." });
        }
        // 2. Calcular Insumos Comprados
        const comprasQuery = DetalleCompra_1.Detallecompra.createQueryBuilder("dc")
            .innerJoin("dc.Compra", "compra")
            .innerJoinAndSelect("dc.Productomedida", "pm")
            .innerJoinAndSelect("pm.Producto", "producto")
            .innerJoinAndSelect("pm.Unidadmedida", "um")
            .where("compra.FechaCompra BETWEEN :startDate AND :endDate", { startDate, endDate });
        const compras = await comprasQuery.getMany();
        const insumosMap = {};
        for (const detalle of compras) {
            const producto = detalle.Productomedida.Producto;
            const cantidadComprada = detalle.Cantidad * detalle.Productomedida.Cantidad;
            if (!insumosMap[producto.IdProducto]) {
                insumosMap[producto.IdProducto] = {
                    Nombre: producto.Nombre,
                    Comprado: 0,
                    Consumido: 0,
                    Stock: 0,
                    Unidad: baseUnit.Nombre,
                    Abreviado: baseUnit.Abreviatura
                };
            }
            insumosMap[producto.IdProducto].Comprado += cantidadComprada;
        }
        // 3. Calcular Insumos Consumidos por Ventas
        const ventasQuery = DetalleVenta_1.Detalleventa.createQueryBuilder("dv")
            .innerJoin("dv.Venta", "venta")
            .leftJoinAndSelect("dv.Producto", "producto")
            .leftJoinAndSelect("dv.Paquete", "paquete")
            .leftJoinAndSelect("paquete.Producto", "productoPaquete")
            .leftJoinAndSelect("dv.Promocion", "promocion")
            .leftJoinAndSelect("promocion.Promocionproducto", "promoProducto")
            .leftJoinAndSelect("promoProducto.Producto", "productoPromocion")
            .leftJoinAndSelect("promoProducto.Paquete", "paquetePromocion")
            .leftJoinAndSelect("paquetePromocion.Producto", "productoPaquetePromocion")
            .where("venta.FechaVenta BETWEEN :startDate AND :endDate", { startDate, endDate });
        if (IdSucursal) {
            ventasQuery.andWhere("venta.Sucursal = :IdSucursal", { IdSucursal });
        }
        const ventas = await ventasQuery.getMany();
        const productosVendidosMap = new Map();
        for (const detalle of ventas) {
            let idProducto;
            let cantidad = 0;
            if (detalle.Producto) {
                idProducto = detalle.Producto.IdProducto;
                cantidad = detalle.Cantidad;
            }
            else if (detalle.Paquete && detalle.Paquete.Producto) {
                idProducto = detalle.Paquete.Producto.IdProducto;
                cantidad = detalle.Cantidad * detalle.Paquete.Cantidad;
            }
            else if (detalle.Promocion) {
                for (const pp of detalle.Promocion.Promocionproducto) {
                    const cantidadPromocion = detalle.Cantidad * pp.Cantidad;
                    if (pp.Producto) {
                        idProducto = pp.Producto.IdProducto;
                        cantidad = cantidadPromocion;
                    }
                    else if (pp.Paquete && pp.Paquete.Producto) {
                        idProducto = pp.Paquete.Producto.IdProducto;
                        cantidad = cantidadPromocion * pp.Paquete.Cantidad;
                    }
                }
            }
            if (idProducto) {
                productosVendidosMap.set(idProducto, (productosVendidosMap.get(idProducto) || 0) + cantidad);
            }
        }
        const allSoldProductIds = Array.from(productosVendidosMap.keys());
        if (allSoldProductIds.length > 0) {
            const ingredientesRecetas = await Ingrediente_1.Ingrediente.createQueryBuilder("ingrediente")
                .innerJoinAndSelect("ingrediente.Ingredientes", "insumo")
                .innerJoinAndSelect("ingrediente.Producto", "productoFinal")
                .innerJoinAndSelect("ingrediente.Unidadmedida", "unidadIngrediente")
                .where("productoFinal.IdProducto IN (:...allSoldProductIds)", { allSoldProductIds })
                .getMany();
            for (const [idProductoFinal, cantidadVendida] of productosVendidosMap.entries()) {
                const receta = ingredientesRecetas.filter(ing => ing.Producto.IdProducto === idProductoFinal);
                for (const itemReceta of receta) {
                    const insumo = itemReceta.Ingredientes;
                    const unidadIngrediente = itemReceta.Unidadmedida;
                    const pesoEnReceta = itemReceta.Peso;
                    const pesoEnUnidadBase = (pesoEnReceta * unidadIngrediente.Cantidad) / baseUnit.Cantidad;
                    const consumoTotal = cantidadVendida * pesoEnUnidadBase;
                    if (!insumosMap[insumo.IdProducto]) {
                        insumosMap[insumo.IdProducto] = {
                            Nombre: insumo.Nombre,
                            Comprado: 0,
                            Consumido: 0,
                            Stock: 0,
                            Unidad: baseUnit.Nombre,
                            Abreviado: baseUnit.Abreviatura
                        };
                    }
                    insumosMap[insumo.IdProducto].Consumido += consumoTotal;
                }
            }
        }
        // 4. Calcular Stock de Insumos
        for (const idInsumo in insumosMap) {
            const insumo = insumosMap[idInsumo];
            insumo.Stock = insumo.Comprado - insumo.Consumido;
        }
        // 5. Obtener información de productos finales
        const productosFinales = await Producto_1.Producto.createQueryBuilder("producto")
            .leftJoinAndSelect("producto.Imagen", "imagen")
            .innerJoin("producto.Tipoproducto", "tipoproducto")
            .where("tipoproducto.IdTipoProducto = :tipo", { tipo: 'ITP-2' })
            .getMany();
        const reporteProductos = [];
        const stocksQuery = ProductoSucursal_1.Productosucursal.createQueryBuilder("ps")
            .select("ps.ProductoIdProducto", "idProducto")
            .addSelect("SUM(ps.Cantidad)", "stock")
            .groupBy("ps.ProductoIdProducto");
        if (IdSucursal) {
            stocksQuery.where("ps.IdSucursal = :IdSucursal", { IdSucursal });
        }
        const stocks = await stocksQuery.getRawMany();
        const stockMap = new Map(stocks.map(s => [s.idProducto, parseInt(s.stock)]));
        for (const producto of productosFinales) {
            const stock = stockMap.get(producto.IdProducto) || 0;
            const ingredientes = await Ingrediente_1.Ingrediente.createQueryBuilder("ingrediente")
                .innerJoinAndSelect("ingrediente.Ingredientes", "insumo")
                .innerJoinAndSelect("ingrediente.Unidadmedida", "unidad")
                .where("ingrediente.Producto.IdProducto = :idProducto", { idProducto: producto.IdProducto })
                .getMany();
            const ingredientesData = ingredientes.map(ing => ({
                Nombre: ing.Ingredientes.Nombre,
                Cantidad: ing.Peso,
                Unidad: ing.Unidadmedida.Nombre
            }));
            reporteProductos.push({
                IdProducto: producto.IdProducto,
                Nombre: producto.Nombre,
                Stock: stock,
                Imagen: producto.Imagen ? producto.Imagen.Url : null,
                Ingredientes: ingredientesData
            });
        }
        return res.json({
            reporteInsumos: Object.values(insumosMap),
            reporteProductos: reporteProductos
        });
    }
    catch (error) {
        console.error("Error en getReporteInsumos:", error);
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
        return res.status(500).json({ message: "Error desconocido al generar el reporte de insumos." });
    }
};
exports.getReporteInsumos = getReporteInsumos;
