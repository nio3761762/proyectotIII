"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyProducto = exports.updateProducto = exports.getProductoSucursal = exports.getProducto = exports.getBuscarProductos = exports.getInsumo = exports.getProductos = exports.PrecioProducto = exports.deleteProducto = exports.createProducto = void 0;
const Producto_1 = require("../entities/Producto");
const Estado_controllers_1 = require("./Estado.controllers");
const Tipoproducto_controllers_1 = require("./Tipoproducto.controllers");
const Marca_controllers_1 = require("./Marca.controllers");
const Categoria_controllers_1 = require("./Categoria.controllers");
const error_handler_1 = require("../utils/error.handler");
const Foto_controllers_1 = require("./Foto.controllers");
const Sucursal_1 = require("../entities/Sucursal");
const SucursalProducto_controllers_1 = require("./SucursalProducto.controllers");
const Presentacionproducto_controllers_1 = require("./Presentacionproducto.controllers");
const idGenerator_1 = require("../utils/idGenerator");
const typeorm_1 = require("typeorm");
const ProductoMedida_controllers_1 = require("./ProductoMedida.controllers");
const ProductoMedida_1 = require("../entities/ProductoMedida");
const ProductoSucursal_1 = require("../entities/ProductoSucursal");
const createProducto = async (req, res) => {
    try {
        const { RegistroProducto } = req.body;
        const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('PROD');
        const producto = new Producto_1.Producto();
        producto.IdProducto = nuevoId;
        producto.Nombre = RegistroProducto.Nombre;
        producto.FechaRegistro = new Date();
        producto.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: 1 });
        if (RegistroProducto.Descripcion)
            producto.Descripcion = RegistroProducto.Descripcion;
        if (RegistroProducto.Url) {
            const imagen = await (0, Foto_controllers_1.createImagen)({ Foto: RegistroProducto.Url });
            producto.Imagen = imagen;
        }
        if (RegistroProducto.IdSubCategoria)
            producto.Subcategoria = await (0, Categoria_controllers_1.verifySubCategoria)({ CategoriaId: RegistroProducto.IdSubCategoria });
        if (RegistroProducto.IdMarca)
            producto.Marca = await (0, Marca_controllers_1.verifyMarca)({ Marcaid: RegistroProducto.IdMarca });
        if (RegistroProducto.IdTipo)
            producto.Tipoproducto = await (0, Tipoproducto_controllers_1.verifyTipoProducto)({ TipoId: RegistroProducto.IdTipo });
        if (RegistroProducto.Descripcion)
            producto.Descripcion = RegistroProducto.Descripcion;
        await producto.save();
        if (!RegistroProducto.IdMarca) {
            const sucursales = await Sucursal_1.Sucursal.find();
            for (const sucursal of sucursales)
                await (0, SucursalProducto_controllers_1.createSucursalProducto)({ SucursalId: sucursal.IdSucursal, ProductoId: nuevoId, stockminimo: RegistroProducto.StockMinimo });
        }
        if (RegistroProducto.Productomedida && RegistroProducto.Productomedida.length > 0)
            for (const medida of RegistroProducto.Productomedida)
                await (0, ProductoMedida_controllers_1.createProductoMedida)({ IdProducto: nuevoId, IdUnidadMedida: medida.IdUnidadMedida, Cantidad: medida.Cantidad, Precio: medida.Precio, PrecioMayor: medida.PrecioMayor });
        if (RegistroProducto.Paquete && RegistroProducto.Paquete.length > 0)
            for (const paquete of RegistroProducto.Paquete)
                await (0, Presentacionproducto_controllers_1.createPaquete)({
                    IdProducto: nuevoId, IdUnidadMedida: paquete.IdUnidadMedida, Nombre: paquete.Nombre,
                    PrecioVenta: paquete.PrecioVenta, Cantidad: paquete.Cantidad, IdEstado: paquete.Estado, IdPresentacion: paquete.IdPresentacion,
                    Url: paquete.Url, StockMinimo: paquete.StockMinimo
                });
        return res.json({ message: "El Producto se registró correctamente" });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.createProducto = createProducto;
const deleteProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const producto = await Producto_1.Producto.findOne({
            where: { IdProducto: id },
            relations: ['Estado']
        });
        if (!producto) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        const esActivo = producto.Estado?.IdEstado === 1;
        const nuevoEstadoId = esActivo ? 2 : 1;
        const mensajeAccion = esActivo ? 'eliminaron' : 'habilitaron';
        const nuevoEstado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: nuevoEstadoId });
        if (!nuevoEstado) {
            return res.status(500).json({ message: "No se pudo obtener el estado requerido." });
        }
        producto.Estado = nuevoEstado;
        await producto.save();
        return res.json({ message: `Se ${mensajeAccion} los datos del Producto correctamente` });
    }
    catch (error) {
        console.error("Error al cambiar el estado del Producto:", error);
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.deleteProducto = deleteProducto;
const PrecioProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const producto = await Producto_1.Producto.findOne({
            where: { IdProducto: id },
            relations: ['Productomedida', 'Productomedida.Unidadmedida']
        });
        if (!producto) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        return res.json({
            Precio: producto.Productomedida[0].PrecioVenta,
            Unidadmedida: producto.Productomedida[0].Unidadmedida.IdUnidadMedida,
            Id: producto.Productomedida[0].IdProductoMedida,
            PrecioMayor: producto.Productomedida[0].PrecioMayor
        });
    }
    catch (error) {
        console.error("Error al cambiar el estado del Producto:", error);
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.PrecioProducto = PrecioProducto;
const getProductos = async (req, res) => {
    try {
        const productos = await Producto_1.Producto.find({
            where: { Tipoproducto: { IdTipoProducto: 'ITP-2' } },
            relations: [
                'Estado',
                'Marca',
                'Tipoproducto',
                'Subcategoria',
                'Subcategoria.Categoria',
                'Imagen',
                'Productomedida',
                'Productomedida.Precio',
                'Paquete',
                'Paquete.Estado',
                'Paquete.Unidadmedida',
                'Productosucursal',
                'Productosucursal.Sucursal'
            ]
        });
        return res.json(productos);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getProductos = getProductos;
const getInsumo = async (req, res) => {
    try {
        const productos = await Producto_1.Producto.find({
            where: { Tipoproducto: { IdTipoProducto: 'ITP-1' } },
            relations: [
                'Estado',
                'Marca',
                'Tipoproducto',
                'Subcategoria',
                'Subcategoria.Categoria',
                'Imagen',
                'Productomedida',
                'Productomedida.Unidadmedida',
                'Productomedida.Unidadmedida.Categoria'
            ]
        });
        return res.json(productos);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getInsumo = getInsumo;
const getBuscarProductos = async (req, res) => {
    try {
        // Trae los productos (filtra por tipo en la base si Tipoproducto es relación)
        const productos = await Producto_1.Producto.find({
            where: { Tipoproducto: { IdTipoProducto: "ITP-2" } },
            relations: ["Productosucursal", "Productosucursal.Sucursal"],
        });
        // Filtrar en memoria: quedarse solo con los que tienen 1+ Productosucursal
        const productosConSucursal = productos.filter((p) => Array.isArray(p.Productosucursal) && p.Productosucursal.length > 0);
        // Opcional: normalizar/limpiar salida para el front (evita enviar arrays vacíos innecesarios)
        const resultado = productosConSucursal.map((p) => {
            // tomar la primera Productosucursal por ejemplo (o dejar toda la lista si la necesitas)
            const ps0 = p.Productosucursal[0];
            // calcular precioActual (tomando el último por fecha si hay)
            let precioActual = null;
            // if (Array.isArray(p.Precio) && p.Precio.length) {
            //   precioActual = [...p.Precio]
            //     .sort((a, b) => new Date(b.FechaRegistro).getTime() - new Date(a.FechaRegistro).getTime())[0]
            //     .Precio;
            // }
            return {
                IdProducto: p.IdProducto,
                Nombre: p.Nombre,
                Descripcion: p.Descripcion,
                FechaRegistro: p.FechaRegistro,
                precioActual,
                Productosucursal: p.Productosucursal, // o ps0 si solo quieres la primera
            };
        });
        return res.json(resultado);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
        return res.status(500).json({ message: "Error desconocido" });
    }
};
exports.getBuscarProductos = getBuscarProductos;
const getProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const producto = await Producto_1.Producto.findOne({
            where: { IdProducto: id },
            relations: ['Estado', 'Marca', 'Unidadmedida', 'Tipoproducto', 'Subcategoria', 'Subcategoria.categoria', 'Precio', "Imagen"]
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
exports.getProducto = getProducto;
const getProductoSucursal = async (req, res) => {
    try {
        const { nombre } = req.params; // mejor usar nombre en vez de id
        const producto = await Producto_1.Producto.findOne({
            where: { Nombre: (0, typeorm_1.Like)(`%${nombre}%`) }, // búsqueda parcial
            relations: ["Productosucursal", "Productosucursal.Sucursal"],
        });
        if (!producto) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        return res.json(producto);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getProductoSucursal = getProductoSucursal;
const updateProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { RegistroProducto } = req.body;
        const producto = await Producto_1.Producto.findOne({ where: { IdProducto: id }, relations: ["Productomedida", "Ingrediente"] });
        if (!producto)
            return res.status(404).json({ message: "Producto no encontrado" });
        if (RegistroProducto.Nombre)
            producto.Nombre = RegistroProducto.Nombre;
        if (RegistroProducto.IdImagen) {
            const imagen = await (0, Foto_controllers_1.updateImagen)({ ImagenId: RegistroProducto.IdImagen, Foto: RegistroProducto.Url });
            producto.Imagen = imagen;
        }
        else {
            if (RegistroProducto.Url) {
                const imagen = await (0, Foto_controllers_1.createImagen)({ Foto: RegistroProducto.Url });
                producto.Imagen = imagen;
            }
        }
        if (RegistroProducto.IdSubCategoria)
            producto.Subcategoria = await (0, Categoria_controllers_1.verifySubCategoria)({ CategoriaId: RegistroProducto.IdSubCategoria });
        if (RegistroProducto.IdMarca)
            producto.Marca = await (0, Marca_controllers_1.verifyMarca)({ Marcaid: RegistroProducto.IdMarca });
        if (RegistroProducto.Descripcion)
            producto.Descripcion = RegistroProducto.Descripcion;
        await producto.save();
        const productosucursal = await ProductoSucursal_1.Productosucursal.find({
            where: { Producto: { IdProducto: id } }
        });
        if (!productosucursal) {
            return res.status(404).json({ message: "Producto no encontrado  ninguna sucursal" });
        }
        for (const prod of productosucursal) {
            prod.StockMinimo = RegistroProducto.StockMinimo;
            await prod.save();
        }
        // IDs enviados desde el front (o vacío si no mandaron nada)
        const idsEnviadosMedida = RegistroProducto.Productomedida?.map((pm) => pm.IdProductomedida)
            .filter((id) => id !== undefined) || [];
        // Todas las medidas actuales en BD
        const medidasActuales = producto.Productomedida || [];
        if (!RegistroProducto.Productomedida || RegistroProducto.Productomedida.length === 0) {
            // Caso: no se envió nada → eliminar todas
            for (const medida of medidasActuales) {
                await ProductoMedida_1.Productomedida.delete({ IdProductoMedida: medida.IdProductoMedida });
            }
        }
        else {
            // Caso: sí se enviaron medidas → eliminar las que no estén en idsEnviados
            const medidasAEliminar = medidasActuales.filter((pm) => !idsEnviadosMedida.includes(pm.IdProductoMedida));
            for (const medida of medidasAEliminar) {
                await ProductoMedida_1.Productomedida.delete({ IdProductoMedida: medida.IdProductoMedida });
            }
            // Crear o actualizar las medidas que vinieron
            for (const medida of RegistroProducto.Productomedida) {
                await (0, ProductoMedida_controllers_1.updateProductoMedida)({
                    IdProductomedida: medida.IdProductomedida,
                    IdProducto: id,
                    IdUnidadMedida: medida.IdUnidadMedida,
                    Cantidad: medida.Cantidad,
                    Precio: medida.Precio,
                    PrecioMayor: medida.PrecioMayor,
                });
            }
        }
        if (RegistroProducto.Paquete && RegistroProducto.Paquete.length > 0) {
            for (const paquete of RegistroProducto.Paquete)
                await (0, Presentacionproducto_controllers_1.updatePaquete)({
                    IdPaquete: paquete.IdPaquete, IdProducto: producto.IdProducto, IdUnidadMedida: paquete.IdUnidadMedida, Nombre: paquete.Nombre,
                    PrecioVenta: paquete.PrecioVenta, Cantidad: paquete.Cantidad, IdEstado: paquete.Estado, IdPresentacion: paquete.IdPresentacion,
                    IdImagen: paquete.IdImagen, Url: paquete.Url, StockMinimo: paquete.StockMinimo
                });
        }
        return res.json({
            producto: producto,
            message: "El Producto se actualizó correctamente"
        });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.updateProducto = updateProducto;
const verifyProducto = async ({ ProductoId }) => {
    const existProducto = await Producto_1.Producto.findOne({ where: { IdProducto: ProductoId } });
    if (!existProducto) {
        throw new error_handler_1.HttpError(404, `El producto con ID ${ProductoId} no existe.`);
    }
    return existProducto;
};
exports.verifyProducto = verifyProducto;
