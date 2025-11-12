import { Request, Response } from "express";
import { Detallecompra } from "../entities/DetalleCompra";
import { Producto } from "../entities/Producto";
import { Pedido } from "../entities/Pedido";
import { Entrega } from "../entities/Entrega";
import { Between, Raw, IsNull, Not } from "typeorm";
import { Venta } from "../entities/Venta";
import { Detalleventa } from "../entities/DetalleVenta";
import { Productosucursal } from "../entities/ProductoSucursal";
import { Subcategoria } from "../entities/SubCategoria";
import { Ingrediente } from "../entities/Ingrediente"; // Added
import { Unidadmedida } from "../entities/UnidadMedida"; // Added
import { Tipoproducto } from "../entities/TipoProducto"; // Added
import { Persona } from "../entities/Persona"; // Added
import { Pago } from "../entities/Pago"; // Added
import { Sucursal } from "../entities/Sucursal"; // Added
import { Usuario } from "../entities/Usuario"; // Added
import { Distribucion } from "../entities/Distribucion";
import { Detalledistribucion } from "../entities/Detalledistribucion";
import { Productostock } from "../entities/ProductoStock";
import { Productomedida } from "../entities/ProductoMedida";
import { Presentacionproducto } from "../entities/Presentacionproducto"; // Added
import { Promocion } from "../entities/Promocion"; // Added
import { Promocionproducto } from "../entities/PromocionProducto"; // Added

//
export const getReporteProductos = async (req: Request, res: Response) => {
    try {
        const { fechadesde, fechahasta, sucursales, subcategorias } = req.query;

        if (!fechadesde || !fechahasta) {
            return res.status(400).json({ message: "Los parámetros 'fechadesde' y 'fechahasta' son obligatorios." });
        }

        const startDate = new Date(`${fechadesde}T00:00:00`);
        const endDate = new Date(`${fechahasta}T23:59:59`);

        const sucursalesIds = sucursales ? (sucursales as string).split(',') : [];
        const subcategoriasIds = subcategorias ? (subcategorias as string).split(',') : [];

        // 1. Fetch all data needed for explosion
        const allPromocionProductos = await Promocionproducto.find({ relations: ["Producto", "Paquete", "Promocion", "Paquete.Producto", "Promocion.Tipopromocion"] });
        const allPaquetes = await Presentacionproducto.find({ relations: ["Producto", "Imagen"] });

        const promocionComposition = new Map<string, any[]>();
        for (const pp of allPromocionProductos) {
            if (pp.Promocion) {
                if (!promocionComposition.has(pp.Promocion.IdPromocion)) {
                    promocionComposition.set(pp.Promocion.IdPromocion, []);
                }
                promocionComposition.get(pp.Promocion.IdPromocion)!.push(pp);
            }
        }

        const paqueteComposition = new Map<string, any>();
        for (const p of allPaquetes) {
            paqueteComposition.set(p.IdPaquete, p);
        }

        // 2.  Fetch all sales details
        const detalleVentasQuery = Detalleventa.createQueryBuilder("detalleventa")
            .innerJoinAndSelect("detalleventa.Venta", "venta")
            .leftJoinAndSelect("detalleventa.Producto", "producto")
            .leftJoinAndSelect("detalleventa.Paquete", "paquete")
            .leftJoinAndSelect("paquete.Imagen", "paqueteImagen")
            .leftJoinAndSelect("detalleventa.Promocion", "promocion")
            .leftJoinAndSelect("promocion.Imagen", "promocionImagen")
            .leftJoinAndSelect("promocion.Tipopromocion", "tipopromocion")
            .where("venta.FechaVenta >= :startDate AND venta.FechaVenta <= :endDate", { startDate, endDate });

        if (sucursalesIds.length > 0) {
            detalleVentasQuery.andWhere("venta.IdSucursal IN (:...sucursalesIds)", { sucursalesIds });
        }

        const detalleVentas = await detalleVentasQuery.getMany();

        // 3. Explode and aggregate 
        const productQuantitiesByDate = new Map<string, Map<string, number>>(); // For consumoInsumos
        const individualProductSales = new Map<string, Map<string, number>>();
        const packageSales = new Map<string, Map<string, { name: string, quantity: number, composition: any[], imageUrl: string | null }>>();
        const promotionSales = new Map<string, Map<string, { name: string, quantity: number, composition: any[], tipoPromocion: string, imageUrl: string | null }>>();

        for (const detalle of detalleVentas) {
            const fecha = new Date(detalle.Venta.FechaVenta).toISOString().split('T')[0];
            if (!productQuantitiesByDate.has(fecha)) productQuantitiesByDate.set(fecha, new Map<string, number>());
            const productQuantities = productQuantitiesByDate.get(fecha)!;

            const addProductQuantity = (productId: string, quantity: number) => {
                const currentQty = productQuantities.get(productId) || 0;
                productQuantities.set(productId, currentQty + quantity);
            };

            if (detalle.Producto) {
                addProductQuantity(detalle.Producto.IdProducto, detalle.Cantidad);

                if (!individualProductSales.has(fecha)) individualProductSales.set(fecha, new Map());
                const productSalesOnDate = individualProductSales.get(fecha)!;
                const currentQty = productSalesOnDate.get(detalle.Producto.IdProducto) || 0;
                productSalesOnDate.set(detalle.Producto.IdProducto, currentQty + detalle.Cantidad);

            } else if (detalle.Paquete) {
                const paquete = paqueteComposition.get(detalle.Paquete.IdPaquete);
                if (paquete && paquete.Producto) {
                    addProductQuantity(paquete.Producto.IdProducto, detalle.Cantidad * paquete.Cantidad);
                }

                if (!packageSales.has(fecha)) packageSales.set(fecha, new Map());
                const packageSalesOnDate = packageSales.get(fecha)!;
                const paqueteId = detalle.Paquete.IdPaquete;
                const existingSale = packageSalesOnDate.get(paqueteId);

                if (existingSale) {
                    existingSale.quantity += detalle.Cantidad;
                } else {
                    let composition: any[] = [];
                    if (paquete && paquete.Producto) {
                        composition.push({
                            IdProducto: paquete.Producto.IdProducto,
                            Nombre: paquete.Producto.Nombre,
                            Cantidad: paquete.Cantidad
                        });
                    }
                    packageSalesOnDate.set(paqueteId, {
                        name: detalle.Paquete.Nombre,
                        quantity: detalle.Cantidad,
                        composition: composition,
                        imageUrl: detalle.Paquete.Imagen ? detalle.Paquete.Imagen.Url : null
                    });
                }

            } else if (detalle.Promocion) {
                const composicion = promocionComposition.get(detalle.Promocion.IdPromocion);
                if (composicion) {
                    for (const item of composicion) {
                        if (item.Producto) {
                            addProductQuantity(item.Producto.IdProducto, detalle.Cantidad * item.Cantidad);
                        } else if (item.Paquete) {
                            const paquete = paqueteComposition.get(item.Paquete.IdPaquete);
                            if (paquete && paquete.Producto) {
                                addProductQuantity(paquete.Producto.IdProducto, detalle.Cantidad * item.Cantidad * paquete.Cantidad);
                            }
                        }
                    }
                } 

                if (!promotionSales.has(fecha)) promotionSales.set(fecha, new Map());
                const promotionSalesOnDate = promotionSales.get(fecha)!;
                const promoId = detalle.Promocion.IdPromocion;
                const existingSale = promotionSalesOnDate.get(promoId);

                if (existingSale) {
                    existingSale.quantity += detalle.Cantidad;
                } else {
                    let composition: any[] = [];
                    if (composicion) {
                        composition = composicion.map(item => {
                            if (item.Producto) {
                                return {
                                    Tipo: 'Producto',
                                    Id: item.Producto.IdProducto,
                                    Nombre: item.Producto.Nombre,
                                    Cantidad: item.Cantidad
                                };
                            } else if (item.Paquete) {
                                const paqueteInfo = paqueteComposition.get(item.Paquete.IdPaquete);
                                return {
                                    Tipo: 'Paquete',
                                    Id: item.Paquete.IdPaquete,
                                    Nombre: item.Paquete.Nombre,
                                    Cantidad: item.Cantidad,
                                    Contenido: (paqueteInfo && paqueteInfo.Producto) ? [{
                                        IdProducto: paqueteInfo.Producto.IdProducto,
                                        Nombre: paqueteInfo.Producto.Nombre,
                                        Cantidad: paqueteInfo.Cantidad
                                    }] : []
                                };
                            }
                            return null;
                        }).filter(i => i !== null);
                    }
                    promotionSalesOnDate.set(promoId, {
                        name: detalle.Promocion.Nombre,
                        quantity: detalle.Cantidad,
                        composition: composition,
                        tipoPromocion: detalle.Promocion.Tipopromocion ? detalle.Promocion.Tipopromocion.Nombre : 'N/A',
                        imageUrl: detalle.Promocion.Imagen ? detalle.Promocion.Imagen.Url : null
                    });
                }
            }
        }

        // 4. Fetch product details for the response
        const allSoldProductIds = Array.from(productQuantitiesByDate.values()).flatMap(m => Array.from(m.keys()));
        const uniqueSoldProductIds = [...new Set(allSoldProductIds)];

        let soldProductDetails: Producto[] = [];
        if (uniqueSoldProductIds.length > 0) {
            const soldProductDetailsQuery = Producto.createQueryBuilder("producto")
                .leftJoinAndSelect("producto.Subcategoria", "subcategoria")
                .leftJoinAndSelect("subcategoria.Categoria", "categoria")
                .leftJoinAndSelect("producto.Imagen", "imagen")
                .where("producto.IdProducto IN (:...uniqueSoldProductIds)", { uniqueSoldProductIds });

            if (subcategoriasIds.length > 0) {
                soldProductDetailsQuery.andWhere("subcategoria.IdSubcategoria IN (:...subcategoriasIds)", { subcategoriasIds });
            }
            
            soldProductDetails = await soldProductDetailsQuery.getMany();
        }
        const productDetailsMap = new Map(soldProductDetails.map(p => [p.IdProducto, p]));

        // 5. Construct the response
        const productosVendidos = Array.from(productQuantitiesByDate.entries()).map(([fecha, quantities]) => {
            const productos = Array.from(quantities.entries()).map(([productId, cantidadVendida]) => {
                const productDetail = productDetailsMap.get(productId);
                if (!productDetail) return null;
                return {
                    IdItem: productId,
                    NombreItem: productDetail.Nombre,
                    Subcategoria: productDetail.Subcategoria ? productDetail.Subcategoria.Nombre : 'N/A',
                    Categoria: productDetail.Subcategoria && productDetail.Subcategoria.Categoria ? productDetail.Subcategoria.Categoria.Nombre : 'N/A',
                    UrlImagen: productDetail.Imagen ? productDetail.Imagen.Url : null,
                    cantidadVendida: cantidadVendida
                };
            }).filter(p => p !== null);
            return { fecha, productos };
        }).filter(f => f.productos.length > 0);

        const paquetesVendidos = Array.from(packageSales.entries()).map(([fecha, sales]) => {
            const paquetes = Array.from(sales.entries()).map(([paqueteId, saleInfo]) => {
                return {
                    IdPaquete: paqueteId,
                    Nombre: saleInfo.name,
                    UrlImagen: saleInfo.imageUrl,
                    cantidadVendida: saleInfo.quantity,
                    Contenido: saleInfo.composition
                };
            });
            return { fecha, paquetes };
        });

        const promocionesVendidas = Array.from(promotionSales.entries()).map(([fecha, sales]) => {
            const promociones = Array.from(sales.entries()).map(([promoId, saleInfo]) => {
                return {
                    IdPromocion: promoId,
                    Nombre: saleInfo.name,
                    tipoPromocion: saleInfo.tipoPromocion,
                    UrlImagen: saleInfo.imageUrl,
                    cantidadVendida: saleInfo.quantity,
                    Contenido: saleInfo.composition
                };
            });
            return { fecha, promociones };
        });


        const availableProductsQuery = Productosucursal.createQueryBuilder("productosucursal")
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
        const productosDisponibles = await availableProductsQuery.getRawMany();

        // Recalculate consumoInsumos based on the exploded product quantities
        const allUnidadesMedida = await Unidadmedida.find();
        const unidadMedidaMap = new Map(allUnidadesMedida.map(um => [um.IdUnidadMedida, um]));
        const BASE_UNIT_ID = 1;
        const baseUnit = unidadMedidaMap.get(BASE_UNIT_ID);

        if (!baseUnit) {
            console.warn("Unidad de medida base no encontrada. El consumo de insumos puede ser inexacto.");
        }

        const consumoInsumos: { [key: string]: { IdInsumo: string, NombreInsumo: string, CantidadConsumida: number, UnidadBase: string } } = {};

        if (uniqueSoldProductIds.length > 0 && baseUnit) {
            const totalQuantities = new Map<string, number>();
            for (const date of productQuantitiesByDate.values()) {
                for (const [productId, quantity] of date.entries()) {
                    const currentQty = totalQuantities.get(productId) || 0;
                    totalQuantities.set(productId, currentQty + quantity);
                }
            }

            const ingredientesRecetas = await Ingrediente.createQueryBuilder("ingrediente")
                .innerJoinAndSelect("ingrediente.Producto", "insumoProducto")
                .innerJoinAndSelect("ingrediente.Unidadmedida", "unidadInsumo")
                .innerJoinAndSelect("ingrediente.Ingredientes", "productoFinal")
                .where("productoFinal.IdProducto IN (:...uniqueSoldProductIds)", { uniqueSoldProductIds })
                .andWhere("insumoProducto.Tipoproducto.IdTipoProducto = :insumoTipoId", { insumoTipoId: 'ITP-1' })
                .getMany();

            for (const [productId, cantidadVendida] of totalQuantities.entries()) {
                const ingredientesDelProducto = ingredientesRecetas.filter(ing => ing.Ingredientes.IdProducto === productId);

                for (const ingrediente of ingredientesDelProducto) {
                    const insumoId = ingrediente.Producto.IdProducto;
                    const insumoNombre = ingrediente.Producto.Nombre;
                    const unidadIngrediente = unidadMedidaMap.get(ingrediente.Unidadmedida.IdUnidadMedida);

                    if (unidadIngrediente && baseUnit) {
                        const pesoEnBaseUnit = (parseFloat(ingrediente.Peso.toString()) * parseFloat(unidadIngrediente.Cantidad.toString())) / parseFloat(baseUnit.Cantidad.toString());
                        const consumoTotalInsumo = cantidadVendida * pesoEnBaseUnit;

                        if (!consumoInsumos[insumoId]) {
                            consumoInsumos[insumoId] = {
                                IdInsumo: insumoId,
                                NombreInsumo: insumoNombre,
                                CantidadConsumida: 0,
                                UnidadBase: baseUnit.Nombre
                            };
                        }
                        consumoInsumos[insumoId].CantidadConsumida += consumoTotalInsumo;
                    }
                }
            }
        }

        return res.json({
            productosVendidos: productosVendidos,
            paquetesVendidos: paquetesVendidos,
            promocionesVendidas: promocionesVendidas,
            productosDisponibles: productosDisponibles,
            consumoInsumos: Object.values(consumoInsumos)
        });

    } catch (error) {
        console.error("Error en getReporteProductos:", error);
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
        return res.status(500).json({ message: "Error desconocido al generar el reporte de productos." });
    }
};
//
export const getReportePedidos = async (req: Request, res: Response) => {
    try {
        const { fechadesde, fechahasta, IdSucursal, IdEstado, IdEstadoVenta, IdMetodoPago, TipoCliente, agrupacion } = req.query;

        if (!fechadesde || !fechahasta) {
            return res.status(400).json({ message: "Los parámetros 'fechadesde' y 'fechahasta' son obligatorios para este reporte." });
        }

        const allSucursales = await Sucursal.find();
        const sucursalMap = new Map(allSucursales.map(s => [s.IdSucursal, s.Nombre]));

        const where: any = {};

         const startDate = new Date(`${fechadesde}T00:00:00`);
        const endDate = new Date(`${fechahasta}T23:59:59`);
        where.FechaRegistro = Between(startDate, endDate);

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
            where.Distribuciones = { IdDistribucion: Not(IsNull()) };
        } else if (TipoCliente === 'normal') {
            where.Distribuciones = { IdDistribucion: IsNull() };
        }

        const pedidos = await Pedido.find({
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
                "Distribuciones.Sucursal",
            ],
            where: where,
            order: {
                FechaRegistro: "DESC"
            }
        });

        if (pedidos.length === 0) {
            return res.json([]);
        }

        const pedidosAgrupadosPorFecha: { [key: string]: any[] } = {};

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

            // Mapear y agrupar la información de pago
            const pagosAgrupados = new Map<string, number>();
            if (pedido.Venta && pedido.Venta.Pago) {
                for (const pago of pedido.Venta.Pago) {
                    const metodo = pago.Metodopago ? pago.Metodopago.Nombre : "Desconocido";
                    const total = (pago.Monto || 0) - (pago.Cambio || 0);
                    const currentTotal = pagosAgrupados.get(metodo) || 0;
                    pagosAgrupados.set(metodo, currentTotal + total);
                }
            }
            const pagosMapeados = Array.from(pagosAgrupados.entries()).map(([metodo, total]) => ({
                MetodoPago: metodo,
                Total: total
            }));

            // Mapear la información del estado del pedido
            const estadoPedidoMapeado = pedido.Estado ? pedido.Estado.Nombre : "Desconocido";

            // Mapear los detalles del pedido
            const detallesPedidoMapeados = pedido.Detallepedido ? pedido.Detallepedido.map(detalle => {
                const mappedDetalle: any = { ...detalle };
                if (mappedDetalle.Producto) {
                    mappedDetalle.Producto = {
                        IdProducto: mappedDetalle.Producto.IdProducto,
                        Nombre: mappedDetalle.Producto.Nombre
                    };
                }else
                if (mappedDetalle.Paquete) {
                    mappedDetalle.Paquete = {
                        IdPaquete: mappedDetalle.Paquete.IdPaquete,
                        Nombre: mappedDetalle.Paquete.Nombre
                    };
                }else 
                     if (mappedDetalle.Promocion) {
                        mappedDetalle.Promocion = {
                            IdPromocion: mappedDetalle.Promocion.IdPromocion,
                            Nombre: mappedDetalle.Promocion.Nombre
                        };
                    }
                return mappedDetalle;
            }) : [];

            let origenPedido = null;
            if (pedido.Distribuciones && pedido.Distribuciones.Origen) {
                const sucursalNombre = sucursalMap.get(pedido.Distribuciones.Origen);
                if (sucursalNombre) {
                    origenPedido = sucursalNombre;
                } else {
                    origenPedido = "Cocina";
                }
            } else {
                if (pedido.Venta && pedido.Venta.Sucursal) {
                    origenPedido = pedido.Venta.Sucursal.Nombre;
                }
            }

            const pedidoMapeado = {
                ...pedido,
                Venta: {
                    ...pedido.Venta,
                    Persona: nombreCompletoPersona,
                    Pago: pagosMapeados,
                },
                Estado: estadoPedidoMapeado,
                Detallepedido: detallesPedidoMapeados,
                Origen: origenPedido
            };

            pedidosAgrupadosPorFecha[fecha].push(pedidoMapeado);
        });

        // Calcular totales por fecha
        const reporteFinal: { [key: string]: { pedidos: any[], totalIngreso: number, totalClientesAtendidos: number, totalPedidos: number } } = {};

        for (const fecha in pedidosAgrupadosPorFecha) {
            let totalIngresoFecha = 0;
            const clientesAtendidos = new Set<string>();
            let totalPedidosFecha = 0;

            pedidosAgrupadosPorFecha[fecha].forEach(pedido => {
                if (pedido.Venta && pedido.Venta.Pago) {
                    pedido.Venta.Pago.forEach((pago: { Total: number; }) => {
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
        const granTotalClientesSet = new Set<string>();
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

    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const getReporteEntregas = async (req: Request, res: Response) => {
    try {
        const entregas = await Entrega.find({
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

    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

//  jjdjd
export const getVentasReportes = async (req: Request, res: Response) => {
    try {
        const { IdSucursal, fechadesde, fechahasta, Metodopago, IdVendedor } = req.query;

        if (!fechadesde || !fechahasta) {
            return res.status(400).json({ message: "Los parámetros 'fechadesde' y 'fechahasta' son obligatorios para este reporte." });
        }
       const startDate = new Date(`${fechadesde}T00:00:00`);
        const endDate = new Date(`${fechahasta}T23:59:59`);

//fjfjj
        const where: any = {};
        where.FechaVenta = Raw(alias => `${alias} >= :startDate AND ${alias} <= :endDate`, { startDate, endDate });

        if (IdSucursal && IdSucursal !== "TODOS") {
            where.Sucursal = { IdSucursal: IdSucursal };
        }

        if (Metodopago && Number(Metodopago) !== 0) {
            where.Pago = { Metodopago: { IdMetodoPago: Number(Metodopago) } };
        }

        if (IdVendedor && IdVendedor !== "TODOS") {
            where.Usuario = { IdUsuario: IdVendedor };
        }

        const ventas = await Venta.find({
            relations: [
                "Persona",
                "Pago",
                "Pago.Metodopago",
                "Detalleventa",
                "Detalleventa.Producto",
                "Detalleventa.Paquete",
                "Detalleventa.Promocion",
                "Estado", // Added Estado relation
                "Factura", // Added Factura relation
              
            ],
            where: where,
            order: {
                FechaVenta: "DESC"
            }
        });

        // Now, group by date in application logic
        const ventasAgrupadasPorFecha: { [key: string]: any[] } = {};

        ventas.forEach(venta => {
            const fecha = new Date(venta.FechaVenta).toISOString().split('T')[0]; // YYYY-MM-DD
            if (!ventasAgrupadasPorFecha[fecha]) {
                ventasAgrupadasPorFecha[fecha] = [];
            }

            // Mapear la información de la persona
            let clienteMapeado = null;
            if (venta.Persona) {
                clienteMapeado = {
                    IdPersona: venta.Persona.IdPersona,
                    Nombre: venta.Persona.Nombre,
                    ApellidoPaterno: venta.Persona.ApellidoPaterno || "",
                    ApellidoMaterno: venta.Persona.ApellidoMaterno || ""
                };
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

            // Mapear la información de la factura
            const facturaMapeada = venta.Factura ? {
                IdFactura: venta.Factura.IdFactura,
                NroFactura: venta.Factura.NroFactura,
                FechaEmision: venta.Factura.FechaEmicion,
                // Add other relevant fields from Factura entity if needed
            } : null;

            // Mapear los detalles de venta para incluir solo Id y Nombre del producto, paquete o promoción
            const detallesVentaMapeados = venta.Detalleventa.map(detalle => {
                const mappedDetalle: any = { ...detalle };

                if (mappedDetalle.Producto) {
                    mappedDetalle.Producto = {
                        IdProducto: mappedDetalle.Producto.IdProducto,
                        Nombre: mappedDetalle.Producto.Nombre
                    };
                } else if (mappedDetalle.Paquete) {
                    mappedDetalle.Paquete = {
                        IdPaquete: mappedDetalle.Paquete.IdPaquete,
                        Nombre: mappedDetalle.Paquete.Nombre
                    };
                    // If a package has a product, map that too
                  }else 
                     if (mappedDetalle.Promocion) {
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
                Cliente: clienteMapeado, // Reemplazar el objeto Persona con el objeto mapeado
                Pago: pagosMapeados, // Reemplazar el array de Pago con el array mapeado
                Estado: estadoMapeado, // Reemplazar el objeto Estado con el nombre
                Factura: facturaMapeada, // Añadir la información de la factura
                Detalleventa: detallesVentaMapeados // Reemplazar el array de Detalleventa con el array mapeado
            };

            ventasAgrupadasPorFecha[fecha].push(ventaMapeada);
        });

        // Calcular el total de ingresos y clientes atendidos por fecha
        const reporteFinal: { [key: string]: { ventas: any[], totalIngreso: number, totalClientesAtendidos: number, totalVentasAnuladas: number } } = {};

        for (const fecha in ventasAgrupadasPorFecha) {
            let totalIngresoFecha = 0;
            const clientesAtendidos = new Set<string>();
            let totalVentasAnuladasFecha = 0;

            ventasAgrupadasPorFecha[fecha].forEach(venta => {
                venta.Pago.forEach((pago: { Total: number; }) => {
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
        const granTotalClientesSet = new Set<string>();
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
                    venta.Detalleventa.forEach((detalle: { Cantidad: number; }) => {
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

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error instanceof Error ? error.message : "Error desconocido" });
    }
}//  
export const getReporteProduccionInsumos = async (req: Request, res: Response) => {
    try {
        const { fechadesde, fechahasta, IdSucursal } = req.query;

        if (!fechadesde || !fechahasta) {
            return res.status(400).json({ message: "Los parámetros 'fechadesde' y 'fechahasta' son obligatorios." });
        }
///
        const startDate = new Date(`${fechadesde}T00:00:00`);
        const endDate = new Date(`${fechahasta}T23:59:59`);

        // 1. Obtener todas las unidades de medida para la conversión
        const allUnidadesMedida = await Unidadmedida.find();
        const unidadMedidaMap = new Map(allUnidadesMedida.map(um => [um.IdUnidadMedida, um]));
        const BASE_UNIT_ID = 1; // Asumiendo que 1 = 'gramos' o una unidad base
        const baseUnit = unidadMedidaMap.get(BASE_UNIT_ID);

        if (!baseUnit) {
            return res.status(500).json({ message: "Unidad de medida base no encontrada." });
        }

        const allProductoMedidas = await Productomedida.find({ relations: ["Unidadmedida", "Producto"] });
        const productoMedidaMap = new Map<string, { um: Unidadmedida, pm: Productomedida }>();
        for (const pm of allProductoMedidas) {
            if (pm.Producto) {
                productoMedidaMap.set(pm.Producto.IdProducto, { um: pm.Unidadmedida, pm: pm });
            }
        }

        const insumoCostMap = new Map<string, number>();

        // 2. Calcular Insumos Comprados
        const comprasQuery = Detallecompra.createQueryBuilder("dc")
            .innerJoinAndSelect("dc.Compra", "compra")
            .leftJoinAndSelect("compra.Proveedor", "proveedor")
            .leftJoinAndSelect("proveedor.Persona", "persona") // Assuming Proveedor has a relation to Persona
            .innerJoinAndSelect("dc.Productomedida", "pm")
            .innerJoinAndSelect("pm.Producto", "producto")
            .innerJoinAndSelect("pm.Unidadmedida", "um")
            .where("compra.FechaCompra BETWEEN :startDate AND :endDate", { startDate, endDate });

        const compras = await comprasQuery.getMany();
        let totalInversionCompras = 0;
        const insumosMap: { [key: string]: { Nombre: string, Comprado: number, Consumido: number, Stock: number, Unidad: string, Abreviado: string, ConsumoPorProducto: { [idProductoFinal: string]: { NombreProductoFinal: string, CantidadConsumida: number, CantidadConvertida: number, UnidadNombre: string, UnidadAbreviatura: string } }, CompradoOriginalUnit?: number, StockOriginalUnit?: number, UnidadOriginalNombre?: string, UnidadOriginalAbreviatura?: string } } = {};
        const comprasPorFechaYProveedor: {
            [fecha: string]: {
                Fecha: string;
                Proveedores: {
                    [proveedor: string]: {
                        Proveedor: string;
                        Compras: any[];
                    }
                }
            }
        } = {};

        for (const detalle of compras) {
            const fechaCompra = new Date(detalle.Compra.FechaCompra).toISOString().split('T')[0];
            const proveedorNombre = detalle.Compra.Proveedor && detalle.Compra.Proveedor.Persona
                ? `${detalle.Compra.Proveedor.Persona.Nombre} ${detalle.Compra.Proveedor.Persona.ApellidoPaterno || ''}`.trim()
                : "N/A";

            if (!comprasPorFechaYProveedor[fechaCompra]) {
                comprasPorFechaYProveedor[fechaCompra] = {
                    Fecha: fechaCompra,
                    Proveedores: {}
                };
            }

            if (!comprasPorFechaYProveedor[fechaCompra].Proveedores[proveedorNombre]) {
                comprasPorFechaYProveedor[fechaCompra].Proveedores[proveedorNombre] = {
                    Proveedor: proveedorNombre,
                    Compras: []
                };
            }

            const compraId = detalle.Compra.IdCompra;
            let compraActual = comprasPorFechaYProveedor[fechaCompra].Proveedores[proveedorNombre].Compras.find(c => c.IdCompra === compraId);

            if (!compraActual) {
                compraActual = {
                    IdCompra: compraId,
                    TotalCompra: 0,
                    Detalles: []
                };
                comprasPorFechaYProveedor[fechaCompra].Proveedores[proveedorNombre].Compras.push(compraActual);
            }

            const producto = detalle.Productomedida.Producto;
            const cantidadCompradaEnBaseUnit = detalle.Cantidad * detalle.Productomedida.Unidadmedida.Cantidad;
            const costoDetalle = detalle.Cantidad * detalle.Precio;

            if (cantidadCompradaEnBaseUnit > 0) {
                const costoPorBaseUnit = costoDetalle / cantidadCompradaEnBaseUnit;
                insumoCostMap.set(producto.IdProducto, costoPorBaseUnit);
            }

            compraActual.Detalles.push({
                IdProducto: producto.IdProducto,
                NombreProducto: producto.Nombre,
                CantidadComprada: detalle.Cantidad,
                UnidadMedida: detalle.Productomedida.Unidadmedida.Nombre,
                UnidadAbreviatura: detalle.Productomedida.Unidadmedida.Abreviatura, // Added this line
                CantidadEnBaseUnit: cantidadCompradaEnBaseUnit,
                UnidadBase: baseUnit.Nombre,
                Precio: detalle.Precio,
                Subtotal: costoDetalle
            });
            compraActual.TotalCompra += costoDetalle;

            if (!insumosMap[producto.IdProducto]) {
                const productoMedidaData = productoMedidaMap.get(producto.IdProducto);
                const unidadNombre = productoMedidaData ? productoMedidaData.um.Nombre : baseUnit.Nombre;
                const unidadAbreviatura = productoMedidaData ? productoMedidaData.um.Abreviatura : baseUnit.Abreviatura;

                insumosMap[producto.IdProducto] = {
                    Nombre: producto.Nombre,
                    Comprado: 0,
                    Consumido: 0,
                    Stock: 0,
                    Unidad: unidadNombre,
                    Abreviado: unidadAbreviatura,
                    ConsumoPorProducto: {}
                };
            }
            insumosMap[producto.IdProducto].Comprado += cantidadCompradaEnBaseUnit;
            totalInversionCompras += costoDetalle;
        }

        const reporteComprasDetallado = Object.values(comprasPorFechaYProveedor).map(fecha => ({
            ...fecha,
            Proveedores: Object.values(fecha.Proveedores)
        }));

        // Cálculo de la producción por fecha
        const produccionPorFecha: { 
            [fecha: string]: { 
                productos: { 
                    [idProducto: string]: { 
                        nombre: string, 
                        tiendas: number, 
                        clientes: number, 
                        totalproducido: number, 
                        costoProduccion?: number, 
                        ingredientesUsados?: { id: string, nombre: string, cantidad: number, unidad: string, abreviatura: string, costo: number }[] 
                    }
                },
                resumenInsumos?: {
                    [idInsumo: string]: {
                        nombre: string,
                        cantidadTotal: number,
                        unidad: string,
                        abreviatura: string,
                        costoTotal: number
                    }
                }
            }
        } = {};

        const produccionStock = await Productostock.find({
            where: {
                Fecha: Raw(alias => `DATE(${alias}) BETWEEN :startDate AND :endDate`, {
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0]
                }),
                ...(IdSucursal && { Sucursal: { IdSucursal: IdSucursal as string } })
            },
            relations: ["Producto", "Sucursal"],
        });

        for (const item of produccionStock) {
            if (item.Producto) {
                const fecha = new Date(item.Fecha).toISOString().split('T')[0];
                if (!produccionPorFecha[fecha]) {
                    produccionPorFecha[fecha] = { productos: {} };
                }
                if (!produccionPorFecha[fecha].productos[item.Producto.IdProducto]) {
                    produccionPorFecha[fecha].productos[item.Producto.IdProducto] = {
                        nombre: item.Producto.Nombre,
                        tiendas: 0,
                        clientes: 0,
                        totalproducido: 0
                    };
                }
                produccionPorFecha[fecha].productos[item.Producto.IdProducto].tiendas += item.Cantidad;
                produccionPorFecha[fecha].productos[item.Producto.IdProducto].totalproducido += item.Cantidad;
            }
        }

        const distribucionesClienteVendedor = await Distribucion.find({
            where: {
                FechaDistribucion: Raw(alias => `DATE(${alias}) BETWEEN :startDate AND :endDate`, {
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0]
                }),
                Sucursal: IsNull()
            },
            relations: [
                "Detalledistribucion",
                "Detalledistribucion.Producto",
            ]
        });

        for (const dist of distribucionesClienteVendedor) {
            const fecha = new Date(dist.FechaDistribucion).toISOString().split('T')[0];
            if (!produccionPorFecha[fecha]) {
                produccionPorFecha[fecha] = { productos: {} };
            }
            for (const detalle of dist.Detalledistribucion) {
                if (detalle.Producto) {
                    if (!produccionPorFecha[fecha].productos[detalle.Producto.IdProducto]) {
                        produccionPorFecha[fecha].productos[detalle.Producto.IdProducto] = {
                            nombre: detalle.Producto.Nombre,
                            tiendas: 0,
                            clientes: 0,
                            totalproducido: 0
                        };
                    }
                    produccionPorFecha[fecha].productos[detalle.Producto.IdProducto].clientes += detalle.Cantidad;
                    produccionPorFecha[fecha].productos[detalle.Producto.IdProducto].totalproducido += detalle.Cantidad;
                }
            }
        }

        // Consolidar la producción total para el cálculo de insumos
        const combinedProduction: { [key: string]: { nombre: string, totalProduccion: number } } = {};
        for (const fecha in produccionPorFecha) {
            for (const idProducto in produccionPorFecha[fecha].productos) {
                if (!combinedProduction[idProducto]) {
                    combinedProduction[idProducto] = {
                        nombre: produccionPorFecha[fecha].productos[idProducto].nombre,
                        totalProduccion: 0
                    };
                }
                combinedProduction[idProducto].totalProduccion += produccionPorFecha[fecha].productos[idProducto].totalproducido;
            }
        }

        // Calcular costo de producción e ingredientes usados
        const allProducedProductIdsForCost = [...new Set(Object.values(produccionPorFecha).flatMap(dateData => Object.keys(dateData.productos || {})))];

        if (allProducedProductIdsForCost.length > 0) {
            const ingredientesRecetas = await Ingrediente.createQueryBuilder("ingrediente")
                .innerJoinAndSelect("ingrediente.Ingredientes", "insumo")
                .innerJoinAndSelect("ingrediente.Producto", "productoFinal")
                .innerJoinAndSelect("ingrediente.Unidadmedida", "unidadIngrediente")
                .where("productoFinal.IdProducto IN (:...allProducedProductIds)", { allProducedProductIds: allProducedProductIdsForCost })
                .getMany();

            const productosConCantidad = await Producto.createQueryBuilder("producto")
                .where("producto.IdProducto IN (:...allProducedProductIds)", { allProducedProductIds: allProducedProductIdsForCost })
                .getMany();
            const productoCantidadMap = new Map(productosConCantidad.map(p => [p.IdProducto, p.Cantidad]));


            for (const fecha in produccionPorFecha) {
                for (const idProductoFinal in produccionPorFecha[fecha].productos) {
                    const produccionInfo = produccionPorFecha[fecha].productos[idProductoFinal];
                    const totalProducido = produccionInfo.totalproducido;
                    produccionInfo.costoProduccion = 0;
                    produccionInfo.ingredientesUsados = [];

                    const productoFinalCantidadBase = productoCantidadMap.get(idProductoFinal);
                    if (!productoFinalCantidadBase || productoFinalCantidadBase === 0) {
                        continue;
                    }

                    const receta = ingredientesRecetas.filter(ing => ing.Producto.IdProducto === idProductoFinal);

                    for (const itemReceta of receta) {
                        const insumo = itemReceta.Ingredientes;
                        const unidadIngrediente = itemReceta.Unidadmedida;
                        const pesoEnReceta = itemReceta.Peso;

                        const pesoEnRecetaEnBaseUnit = pesoEnReceta * unidadIngrediente.Cantidad;
                        const consumoUnitario = pesoEnRecetaEnBaseUnit / productoFinalCantidadBase;
                        const consumoTotalEnBaseUnit = consumoUnitario * totalProducido;

                        const costoInsumo = insumoCostMap.get(insumo.IdProducto) || 0;
                        const costoConsumo = consumoTotalEnBaseUnit * costoInsumo;

                        const consumoEnUnidadDeReceta = consumoTotalEnBaseUnit / unidadIngrediente.Cantidad;

                        produccionInfo.costoProduccion += costoConsumo;
                        produccionInfo.ingredientesUsados.push({
                            id: insumo.IdProducto,
                            nombre: insumo.Nombre,
                            cantidad: consumoEnUnidadDeReceta,
                            unidad: unidadIngrediente.Nombre,
                            abreviatura: unidadIngrediente.Abreviatura,
                            costo: costoConsumo
                        });
                    }
                }
            }
        }

        // Aggregate resumenInsumos for each date
        for (const fecha in produccionPorFecha) {
            const resumenInsumosDelDia: { [idInsumo: string]: { nombre: string, cantidadTotal: number, unidad: string, abreviatura: string, costoTotal: number } } = {};

            for (const idProducto in produccionPorFecha[fecha].productos) {
                const producto = produccionPorFecha[fecha].productos[idProducto];
                if (producto.ingredientesUsados) {
                    for (const ingrediente of producto.ingredientesUsados) {
                        if (!resumenInsumosDelDia[ingrediente.id]) {
                            resumenInsumosDelDia[ingrediente.id] = {
                                nombre: ingrediente.nombre,
                                cantidadTotal: 0,
                                unidad: ingrediente.unidad,
                                abreviatura: ingrediente.abreviatura,
                                costoTotal: 0
                            };
                        }
                        resumenInsumosDelDia[ingrediente.id].cantidadTotal += ingrediente.cantidad;
                        resumenInsumosDelDia[ingrediente.id].costoTotal += ingrediente.costo;
                    }
                }
            }
            produccionPorFecha[fecha].resumenInsumos = resumenInsumosDelDia;
        }

        // 3. Calcular Insumos Consumidos por Producción
        const allProducedProductIds = Object.keys(combinedProduction);
        if (allProducedProductIds.length > 0) {
            const ingredientesRecetas = await Ingrediente.createQueryBuilder("ingrediente")
                .innerJoinAndSelect("ingrediente.Ingredientes", "insumo")
                .innerJoinAndSelect("ingrediente.Producto", "productoFinal")
                .innerJoinAndSelect("ingrediente.Unidadmedida", "unidadIngrediente")
                .where("productoFinal.IdProducto IN (:...allProducedProductIds)", { allProducedProductIds })
                .getMany();

            const productosConCantidad = await Producto.createQueryBuilder("producto")
                .where("producto.IdProducto IN (:...allProducedProductIds)", { allProducedProductIds })
                .getMany();
            const productoCantidadMap = new Map(productosConCantidad.map(p => [p.IdProducto, p.Cantidad]));


            for (const idProductoFinal of allProducedProductIds) {
                const totalProducido = combinedProduction[idProductoFinal].totalProduccion;
                const productoFinalCantidadBase = productoCantidadMap.get(idProductoFinal);

                if (!productoFinalCantidadBase || productoFinalCantidadBase === 0) {
                    console.warn(`Producto final ${idProductoFinal} no tiene Cantidad base definida o es cero.`);
                    continue;
                }

                const receta = ingredientesRecetas.filter(ing => ing.Producto.IdProducto === idProductoFinal);
                for (const itemReceta of receta) {
                    const insumo = itemReceta.Ingredientes;
                    const unidadIngrediente = itemReceta.Unidadmedida;
                    const pesoEnReceta = itemReceta.Peso;

                    const pesoEnRecetaEnBaseUnit = pesoEnReceta * unidadIngrediente.Cantidad;
                    const consumoUnitario = pesoEnRecetaEnBaseUnit / productoFinalCantidadBase;
                    const consumoTotalEnBaseUnit = consumoUnitario * totalProducido; // Quantity in base unit

                    if (!insumosMap[insumo.IdProducto]) {
                        const productoMedidaData = productoMedidaMap.get(insumo.IdProducto);
                        const unidadNombre = productoMedidaData ? productoMedidaData.um.Nombre : baseUnit.Nombre;
                        const unidadAbreviatura = productoMedidaData ? productoMedidaData.um.Abreviatura : baseUnit.Abreviatura;

                        insumosMap[insumo.IdProducto] = {
                            Nombre: insumo.Nombre,
                            Comprado: 0,
                            Consumido: 0,
                            Stock: 0,
                            Unidad: unidadNombre,
                            Abreviado: unidadAbreviatura,
                            ConsumoPorProducto: {}
                        };
                    }
                    insumosMap[insumo.IdProducto].Consumido += consumoTotalEnBaseUnit;

                    // Add consumption breakdown by final product
                    const nombreProductoFinal = combinedProduction[idProductoFinal].nombre;
                    if (!insumosMap[insumo.IdProducto].ConsumoPorProducto[idProductoFinal]) {
                        insumosMap[insumo.IdProducto].ConsumoPorProducto[idProductoFinal] = {
                            NombreProductoFinal: nombreProductoFinal,
                            CantidadConsumida: 0,
                            CantidadConvertida: 0,
                            UnidadNombre: '',
                            UnidadAbreviatura: ''
                        };
                    }
                    insumosMap[insumo.IdProducto].ConsumoPorProducto[idProductoFinal].CantidadConsumida += consumoTotalEnBaseUnit;

                    if (unidadIngrediente && unidadIngrediente.Cantidad > 0) {
                        const cantidadConsumidaTotal = insumosMap[insumo.IdProducto].ConsumoPorProducto[idProductoFinal].CantidadConsumida;
                        insumosMap[insumo.IdProducto].ConsumoPorProducto[idProductoFinal].CantidadConvertida = cantidadConsumidaTotal / unidadIngrediente.Cantidad;
                        insumosMap[insumo.IdProducto].ConsumoPorProducto[idProductoFinal].UnidadNombre = unidadIngrediente.Nombre;
                        insumosMap[insumo.IdProducto].ConsumoPorProducto[idProductoFinal].UnidadAbreviatura = unidadIngrediente.Abreviatura;
                    }
                }
            }
        }

        // 4. Calcular Stock de Insumos
        for (const idInsumo in insumosMap) {
            const insumo = insumosMap[idInsumo];
            insumo.Stock = insumo.Comprado - insumo.Consumido;

            const productoMedida = await Productomedida.findOne({
                where: { Producto: { IdProducto: idInsumo } },
                relations: ["Unidadmedida"],
            });

            if (productoMedida && productoMedida.Unidadmedida && productoMedida.Unidadmedida.Cantidad > 0) {
                insumo.CompradoOriginalUnit = insumo.Comprado / productoMedida.Unidadmedida.Cantidad;
                insumo.StockOriginalUnit = insumo.Stock / productoMedida.Unidadmedida.Cantidad;
                insumo.UnidadOriginalNombre = productoMedida.Unidadmedida.Nombre;
                insumo.UnidadOriginalAbreviatura = productoMedida.Unidadmedida.Abreviatura;
            } else {
                insumo.CompradoOriginalUnit = insumo.Comprado / baseUnit.Cantidad;
                insumo.StockOriginalUnit = insumo.Stock / baseUnit.Cantidad;
                insumo.UnidadOriginalNombre = baseUnit.Nombre;
                insumo.UnidadOriginalAbreviatura = baseUnit.Abreviatura;
            }
        }

        //  5. Obtener información de productos finales y producción
        const productosFinales = await Producto.createQueryBuilder("producto")
            .leftJoinAndSelect("producto.Imagen", "imagen")
            .innerJoin("producto.Tipoproducto", "tipoproducto")
            .where("tipoproducto.IdTipoProducto = :tipo", { tipo: 'ITP-2' })
            .getMany();

        const reporteProductos = [];

        const stocksQuery = Productosucursal.createQueryBuilder("ps")
                .select("ps.idproducto", "idProducto")
                .addSelect("SUM(ps.Cantidad)", "stock")
                .groupBy("ps.idproducto");
// 
        const stocks = await stocksQuery.getRawMany();
        const stockMap = new Map(stocks.map(s => [s.idProducto, parseInt(s.stock)]));

        const totalCostoInsumosPorProducto: { [idProducto: string]: number } = {};
        for (const fecha in produccionPorFecha) {
            for (const idProducto in produccionPorFecha[fecha].productos) {
                const produccionInfo = produccionPorFecha[fecha].productos[idProducto];
                if (produccionInfo.costoProduccion) {
                    if (!totalCostoInsumosPorProducto[idProducto]) {
                        totalCostoInsumosPorProducto[idProducto] = 0;
                    }
                    totalCostoInsumosPorProducto[idProducto] += produccionInfo.costoProduccion;
                }
            }
        }

        for (const producto of productosFinales) {
            const stock = stockMap.get(producto.IdProducto) || 0;
            const produccion = combinedProduction[producto.IdProducto]?.totalProduccion || 0;
            const totalCostoInsumos = totalCostoInsumosPorProducto[producto.IdProducto] || 0;

            const ingredientes = await Ingrediente.createQueryBuilder("ingrediente")
                .innerJoinAndSelect("ingrediente.Ingredientes", "insumo")
                .innerJoinAndSelect("ingrediente.Producto", "productoFinal")
                .innerJoinAndSelect("ingrediente.Unidadmedida", "unidadIngrediente")
                .where("productoFinal.IdProducto = :idProducto", { idProducto: producto.IdProducto })
                .getMany();

            const ingredientesData = ingredientes.map(ing => ({
                Nombre: ing.Ingredientes.Nombre,
                Cantidad: ing.Peso,
                Unidad: ing.Unidadmedida.Nombre,
                Abreviatura: ing.Unidadmedida.Abreviatura
            }));

            reporteProductos.push({
                IdProducto: producto.IdProducto,
                Nombre: producto.Nombre,
                Stock: stock,
                TotalProduccion: produccion,
                TotalCostoInsumos: totalCostoInsumos,
                Imagen: producto.Imagen ? producto.Imagen.Url : null,
                Ingredientes: ingredientesData
            });
        }

        return res.json({
            reporteInsumos: Object.values(insumosMap),
            reporteProductos: reporteProductos,
            totalInversionCompras: totalInversionCompras,
            reporteComprasDetallado: reporteComprasDetallado,
            produccionPorFecha: produccionPorFecha
        });

    } catch (error) {
        console.error("Error en getReporteProduccionInsumos:", error);
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
        return res.status(500).json({ message: "Error desconocido al generar el reporte." });
    }
};