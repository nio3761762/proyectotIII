"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductoPromocion = exports.getUniqueProductsWithSummedQuantities = exports.getProductod = exports.getProductoSucursal = exports.ObtenerPresentacion = exports.getProductosPaquete = exports.getProductoPaquete = exports.getPaqueteSucursal = exports.getPaquetesinSucursal = exports.getPaquete = exports.updatePaquete = exports.createPaquete = exports.verifyPaquete = void 0;
const Presentacionproducto_1 = require("../entities/Presentacionproducto");
const Producto_1 = require("../entities/Producto");
const Promocion_1 = require("../entities/Promocion");
const Sucursal_1 = require("../entities/Sucursal");
const error_handler_1 = require("../utils/error.handler");
const idGenerator_1 = require("../utils/idGenerator");
const Estado_controllers_1 = require("./Estado.controllers");
const Foto_controllers_1 = require("./Foto.controllers");
const Medida_controllers_1 = require("./Medida.controllers");
const Presentacion_controllers_1 = require("./Presentacion,controllers");
const Producto_controllers_1 = require("./Producto.controllers");
const SucursalProducto_controllers_1 = require("./SucursalProducto.controllers");
const ProductoSucursal_1 = require("../entities/ProductoSucursal");
const verifyPaquete = async ({ PaqueteId }) => {
    const existPaquete = await Presentacionproducto_1.Presentacionproducto.findOne({ where: { IdPaquete: PaqueteId } });
    if (!existPaquete) {
        throw new error_handler_1.HttpError(404, `El Presentacionproducto con ID ${PaqueteId} no existe.`);
    }
    return existPaquete;
};
exports.verifyPaquete = verifyPaquete;
const createPaquete = async ({ IdProducto, IdUnidadMedida, Nombre, PrecioVenta, Cantidad, IdEstado, IdPresentacion, Url, StockMinimo, }) => {
    const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('PQ');
    const nuevoPaquete = new Presentacionproducto_1.Presentacionproducto();
    nuevoPaquete.IdPaquete = nuevoId;
    nuevoPaquete.Cantidad = Cantidad;
    nuevoPaquete.Nombre = Nombre;
    nuevoPaquete.PrecioVenta = PrecioVenta;
    nuevoPaquete.FechaRegistro = new Date();
    nuevoPaquete.Unidadmedida = await (0, Medida_controllers_1.verifyUnidadMedida)({ UnidadMedidaId: IdUnidadMedida });
    nuevoPaquete.Producto = await (0, Producto_controllers_1.verifyProducto)({ ProductoId: IdProducto });
    nuevoPaquete.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: IdEstado });
    nuevoPaquete.Presentacion = await (0, Presentacion_controllers_1.verifyPresentacion)({ PresentacionId: IdPresentacion });
    if (Url)
        nuevoPaquete.Imagen = await (0, Foto_controllers_1.createImagen)({ Foto: Url });
    await nuevoPaquete.save();
    const sucursales = await Sucursal_1.Sucursal.find();
    for (const sucursal of sucursales)
        await (0, SucursalProducto_controllers_1.createSucursalProducto)({ SucursalId: sucursal.IdSucursal, ProductoId: nuevoId, stockminimo: StockMinimo });
    return nuevoPaquete;
};
exports.createPaquete = createPaquete;
const updatePaquete = async ({ IdPaquete, IdProducto, IdUnidadMedida, Nombre, PrecioVenta, Cantidad, IdEstado, IdPresentacion, IdImagen, Url, StockMinimo }) => {
    if (IdPaquete) {
        const paquete = await Presentacionproducto_1.Presentacionproducto.findOne({ where: { IdPaquete } });
        if (paquete) {
            // --- SI EL PAQUETE EXISTE, SE ACTUALIZA ---
            if (Cantidad)
                paquete.Cantidad = Cantidad;
            if (Nombre)
                paquete.Nombre = Nombre;
            if (PrecioVenta)
                paquete.PrecioVenta = PrecioVenta;
            if (IdProducto)
                paquete.Producto = await (0, Producto_controllers_1.verifyProducto)({ ProductoId: IdProducto });
            if (IdUnidadMedida)
                paquete.Unidadmedida = await (0, Medida_controllers_1.verifyUnidadMedida)({ UnidadMedidaId: IdUnidadMedida });
            if (IdPresentacion)
                paquete.Presentacion = await (0, Presentacion_controllers_1.verifyPresentacion)({ PresentacionId: IdPresentacion });
            // Si se proporciona un IdEstado, se actualiza. Si no, no se cambia.
            if (IdEstado !== undefined) {
                paquete.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: IdEstado });
            }
            paquete.FechaRegistro = new Date(); // Actualiza la fecha en cada modificación
            if (IdImagen)
                paquete.Imagen = await (0, Foto_controllers_1.updateImagen)({ ImagenId: IdImagen, Foto: Url });
            else
                paquete.Imagen = await (0, Foto_controllers_1.createImagen)({ Foto: Url });
            await paquete.save();
            const paqueteSucursal = await ProductoSucursal_1.Productosucursal.find({
                where: { Paquete: { IdPaquete: IdPaquete } }
            });
            if (paqueteSucursal)
                for (const paq of paqueteSucursal) {
                    paq.StockMinimo = StockMinimo;
                    await paq.save();
                }
            return paquete;
        }
    }
    return await (0, exports.createPaquete)({ IdProducto: IdProducto, IdUnidadMedida: IdUnidadMedida, Nombre: Nombre, PrecioVenta: PrecioVenta, Cantidad: Cantidad, IdEstado: IdEstado, IdPresentacion: IdPresentacion, Url: Url, StockMinimo: StockMinimo });
};
exports.updatePaquete = updatePaquete;
const getPaquete = async (req, res) => {
    try {
        const { id } = req.params;
        const productosSucursal = await ProductoSucursal_1.Productosucursal.createQueryBuilder("ps")
            .innerJoin("ps.Paquete", "paquete")
            .leftJoinAndSelect("paquete.Imagen", "imagen")
            .leftJoinAndSelect("paquete.Producto", "producto")
            .innerJoin("ps.Sucursal", "sucursal")
            .where("sucursal.IdSucursal = :id", { id })
            .select([
            "ps.IdProductoSucursal",
            "ps.Cantidad",
            "paquete.IdPaquete",
            "paquete.Nombre",
            "paquete.Cantidad",
            "paquete.FechaRegistro",
            "paquete.PrecioVenta",
            "paquete.PrecioMayor",
            "imagen",
            "producto"
        ])
            .getMany();
        // Mapeamos para incluir IdProductoSucursal junto con los datos del paquete
        const resultado = productosSucursal.map(ps => ({
            IdProductoSucursal: ps.IdProductoSucursal,
            CantidadPaquete: ps.Cantidad,
            ...ps.Paquete
        }));
        return res.json(resultado);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getPaquete = getPaquete;
const getPaquetesinSucursal = async (req, res) => {
    try {
        const productosSucursal = await Presentacionproducto_1.Presentacionproducto.createQueryBuilder("ps")
            .leftJoinAndSelect("ps.Imagen", "imagen")
            .leftJoinAndSelect("ps.Producto", "producto")
            .select([
            "ps.IdPaquete",
            "ps.Nombre",
            "ps.Cantidad",
            "ps.FechaRegistro",
            "ps.PrecioVenta",
            "ps.PrecioMayor",
            "imagen",
            "producto"
        ])
            .getMany();
        // Mapeamos para incluir IdProductoSucursal junto con los datos del paquete
        const resultado = productosSucursal.map(ps => ({
            IdPaquete: ps.IdPaquete,
            Cantidad: ps.Cantidad,
            Nombre: ps.Nombre,
            FechaRegistro: ps.FechaRegistro,
            PrecioVenta: ps.PrecioVenta,
            PrecioMayor: ps.PrecioMayor,
            Imagen: ps.Imagen ? {
                IdImagen: ps.Imagen.IdImagen,
                Url: ps.Imagen.Url
            } : null,
            Producto: ps.Producto ? {
                IdProducto: ps.Producto.IdProducto,
                Nombre: ps.Producto.Nombre,
                Descripcion: ps.Producto.Descripcion,
                FechaRegistro: ps.Producto.FechaRegistro,
                Fechaactualizacion: ps.Producto.Fechaactualizacion,
                FechaVencimiento: ps.Producto.FechaVencimiento
            } : null
        }));
        return res.json(resultado);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getPaquetesinSucursal = getPaquetesinSucursal;
const getPaqueteSucursal = async (req, res) => {
    try {
        const { ids, id } = req.params;
        const producto = await ProductoSucursal_1.Productosucursal.findOne({
            where: {
                Sucursal: { IdSucursal: ids },
                Paquete: { IdPaquete: id }
            }
        });
        return res.json(producto);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getPaqueteSucursal = getPaqueteSucursal;
const getProductoPaquete = async (req, res) => {
    try {
        const { id } = req.params;
        const producto = await Presentacionproducto_1.Presentacionproducto.find({
            where: {
                Producto: { IdProducto: id },
                Estado: { IdEstado: 1 }
            },
            relations: ['Estado']
        });
        if (!producto)
            return res.status(404).json({ message: "Producto no encontrado" });
        return res.json(producto);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getProductoPaquete = getProductoPaquete;
const getProductosPaquete = async (req, res) => {
    try {
        const { id } = req.params;
        const productos = await Presentacionproducto_1.Presentacionproducto.find({
            where: {
                Producto: { IdProducto: id },
            },
            relations: ['Estado', 'Presentacion', 'Unidadmedida', 'Imagen', 'Productosucursal'],
        });
        // Si no existe, devolver array vacío
        if (!productos.length) {
            return res.json([]);
        }
        const result = productos.map(p => ({
            ...p,
            Estado: p.Estado?.IdEstado ?? null,
            Presentacion: p.Presentacion?.IdPresentacion ?? null,
            Unidadmedida: p.Unidadmedida?.IdUnidadMedida ?? null,
            IdImagen: p.Imagen?.IdImagen ?? null,
            Url: p.Imagen?.Url ?? null,
            StockMinimo: p.Productosucursal?.[0]?.StockMinimo ?? 0,
        }));
        return res.json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
        return res.status(500).json({ message: "Ocurrió un error desconocido." });
    }
};
exports.getProductosPaquete = getProductosPaquete;
const ObtenerPresentacion = async (req, res) => {
    try {
        const { id } = req.params;
        const productos = await Presentacionproducto_1.Presentacionproducto.findOne({
            where: {
                IdPaquete: id,
            },
            relations: ['Estado', 'Presentacion', 'Unidadmedida', 'Producto'],
        });
        if (!productos) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        return res.json({
            IdPaquete: productos.IdPaquete,
            Estado: productos.Estado.IdEstado,
            Nombre: productos.Nombre,
            Cantidad: productos.Cantidad,
            Precio: productos.PrecioVenta,
            Presentacion: productos.Presentacion.IdPresentacion,
            Unidadmedida: productos.Unidadmedida.IdUnidadMedida,
            IdProducto: productos.Producto.IdProducto
        });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
        return res.status(500).json({ message: "Ocurrió un error desconocido." });
    }
};
exports.ObtenerPresentacion = ObtenerPresentacion;
const getProductoSucursal = async (req, res) => {
    try {
        const { id, categoriaId, subcategoriaId } = req.params; // usar nombre en vez de id
        const producto = await Producto_1.Producto.find({
            where: { Productosucursal: { Sucursal: { IdSucursal: id } } }, // búsqueda insensible a mayúsculas/minúsculas
            relations: ["Imagen",
                "Subcategoria",
                "Subcategoria.Categoria",
                "Productosucursal",
                "Productosucursal.Sucursal"],
        });
        if (!producto) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        const productoFiltradas = producto.filter(v => (categoriaId === "TODOS" || v.Subcategoria?.Categoria.IdCategoria === categoriaId) &&
            (subcategoriaId === "TODOS" || v.Subcategoria?.IdSubCategoria === subcategoriaId));
        return res.json(productoFiltradas);
    }
    catch (error) { //
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getProductoSucursal = getProductoSucursal;
const getProductod = async (req, res) => {
    try {
        const { categoriaId, subcategoriaId } = req.params; // usar nombre en vez de id
        const producto = await Producto_1.Producto.find({
            where: { Tipoproducto: { IdTipoProducto: 'ITP-2' } }, // búsqueda insensible a mayúsculas/minúsculas
            relations: ["Imagen", "Subcategoria", "Subcategoria.Categoria"],
        });
        if (!producto) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        const productoFiltradas = producto.filter(v => (categoriaId === "TODOS" || v.Subcategoria?.Categoria.IdCategoria === categoriaId) &&
            (subcategoriaId === "TODOS" || v.Subcategoria?.IdSubCategoria === subcategoriaId));
        return res.json(productoFiltradas);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getProductod = getProductod;
const getUniqueProductsWithSummedQuantities = async (req, res) => {
    try {
        const { id, subcategoriaId } = req.query; // 'id' can be SucursalId or "TODOS"
        const allProductoSucursal = await ProductoSucursal_1.Productosucursal.find({
            relations: [
                'Sucursal',
                'Producto',
                'Producto.Subcategoria',
                'Producto.Subcategoria.Categoria',
                'Producto.Imagen',
                'Producto.Estado',
                'Producto.Productomedida',
                'Producto.Productomedida.Unidadmedida'
            ],
        });
        if (!allProductoSucursal.length) {
            return res.status(404).json({ message: "No se encontraron productos con cantidades en ninguna sucursal." });
        }
        let productoFiltradas = allProductoSucursal.filter(v => v.Producto !== null);
        // Apply category and subcategory filters
        productoFiltradas = productoFiltradas.filter(v => (subcategoriaId === "TODOS" || v.Producto?.Subcategoria.IdSubCategoria === subcategoriaId));
        // Apply sucursal filter if 'id' is not "TODOS"
        if (id !== "TODOS") {
            productoFiltradas = productoFiltradas.filter(v => v.Sucursal?.IdSucursal === id);
        }
        const uniqueProducts = new Map();
        for (const ps of productoFiltradas) {
            if (ps.Producto) {
                const productoId = ps.Producto.IdProducto;
                if (uniqueProducts.has(productoId)) {
                    // If product already exists, sum the quantities
                    const existingProduct = uniqueProducts.get(productoId);
                    existingProduct.Cantidad += ps.Cantidad;
                    uniqueProducts.set(productoId, existingProduct);
                }
                else {
                    // If product is new, add it to the map
                    uniqueProducts.set(productoId, {
                        ...ps,
                        // When 'id' is "TODOS", set IdProductoSucursal to null
                        IdProductoSucursal: id === "TODOS" ? null : ps.IdProductoSucursal, // <--- Modified here
                        // When 'id' is "TODOS", set Sucursal to null to represent aggregation
                        // Otherwise, show the specific SucursalId
                        Sucursal: id === "TODOS" ? null : (ps.Sucursal?.IdSucursal ?? null),
                        Producto: {
                            ...ps.Producto,
                            // Cantidad:ps.Producto.Cantidad,
                            Estado: ps.Producto.Estado?.IdEstado ?? null,
                        }
                    });
                }
            }
        }
        const result = Array.from(uniqueProducts.values());
        return res.json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
        return res.status(500).json({ message: "Ocurrió un error desconocido." });
    }
};
exports.getUniqueProductsWithSummedQuantities = getUniqueProductsWithSummedQuantities;
const getProductoPromocion = async (req, res) => {
    try {
        const producto = await Promocion_1.Promocion.find({
            where: {
                Promocionproducto: { Estado: { IdEstado: 1 } },
                Estado: { IdEstado: 1 }
            },
            relations: [
                'Promocionproducto',
                'Promocionproducto.Producto',
                'Promocionproducto.Paquete',
                'Promocionproducto.Paquete.Producto',
                'Estado'
            ]
        });
        if (!producto)
            return res.status(404).json({ message: "Producto no encontrado" });
        return res.json(producto);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getProductoPromocion = getProductoPromocion;
