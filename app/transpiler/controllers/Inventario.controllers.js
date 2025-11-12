"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteInventario = exports.updateInventario = exports.getInventarioById = exports.getInventarios = exports.createInventario = void 0;
const Inventario_1 = require("../entities/Inventario");
const Producto_controllers_1 = require("./Producto.controllers");
// Crear un registro en Inventario
const createInventario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { UbicacionEstante, Cantidad, PrecioVenta, Nombre, Marca, Precio, Descripcion, Imagen, Categoria, } = req.body;
        // Verificar que el producto exista
        let product;
        try {
            product = yield (0, Producto_controllers_1.createProducto1)({ Nombre, Marca, Precio, Descripcion, Imagen, Categoria });
        }
        catch (error) {
            if (error instanceof Error)
                return res.status(400).json({ message: error.message });
        }
        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        const ultimoCliente = yield Inventario_1.Inventario.createQueryBuilder("inventario")
            .select("MAX(inventario.Id_Inventario)", "ultimoId")
            .getRawOne();
        // Calcular el nuevo Id_Cliente
        const nuevoId = ((ultimoCliente === null || ultimoCliente === void 0 ? void 0 : ultimoCliente.ultimoId) || 0) + 1;
        // Crear un nuevo inventario
        const inventario = new Inventario_1.Inventario();
        inventario.Id_Inventario = nuevoId;
        inventario.Id_Producto = product.Id_Producto;
        inventario.UbicacionEstante = UbicacionEstante;
        inventario.Cantidad = Cantidad;
        inventario.PrecioVenta = PrecioVenta;
        inventario.Estado = 1;
        // Guardar el inventario en la base de datos
        yield inventario.save();
        return res.status(201).json(inventario);
    }
    catch (error) {
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
});
exports.createInventario = createInventario;
// Obtener todos los registros de Inventario
const getInventarios = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const inventarios = yield Inventario_1.Inventario.find({ relations: ["producto"] }); // Incluye el producto relacionado
        return res.json(inventarios);
    }
    catch (error) {
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
});
exports.getInventarios = getInventarios;
// Obtener un registro de Inventario por su ID
const getInventarioById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const inventario = yield Inventario_1.Inventario.findOne({
            where: { Id_Inventario: parseInt(id) },
            relations: ["producto"], // Incluye el producto relacionado
        });
        if (!inventario) {
            return res.status(404).json({ message: "Inventario no encontrado" });
        }
        return res.json(inventario);
    }
    catch (error) {
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
});
exports.getInventarioById = getInventarioById;
// Actualizar un registro de Inventario
const updateInventario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { UbicacionEstante, Cantidad, PrecioVenta, Nombre, Marca, Precio, Descripcion, Imagen, Categoria, Estado, IdProducto } = req.body;
        let product;
        try {
            product = yield (0, Producto_controllers_1.updateProducto1)({ Nombre, Marca, Precio, Descripcion, Imagen, Categoria, IdProducto });
        }
        catch (error) {
            if (error instanceof Error)
                return res.status(400).json({ message: error.message });
        }
        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        const inventario = yield Inventario_1.Inventario.findOne({ where: { Id_Inventario: parseInt(id) } });
        if (!inventario) {
            return res.status(404).json({ message: "Inventario no encontrado" });
        }
        // Actualizar los campos del inventario
        inventario.UbicacionEstante = UbicacionEstante;
        inventario.Id_Producto = product.Id_Producto;
        inventario.Cantidad = Cantidad;
        inventario.PrecioVenta = PrecioVenta;
        inventario.Estado = Estado;
        // Guardar los cambios
        yield inventario.save();
        return res.status(200).json(inventario);
    }
    catch (error) {
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
});
exports.updateInventario = updateInventario;
// Eliminar (desactivar) un registro de Inventario
const deleteInventario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const inventario = yield Inventario_1.Inventario.findOne({ where: { Id_Inventario: parseInt(id) } });
        if (!inventario) {
            return res.status(404).json({ message: "Inventario no encontrado" });
        }
        // Marcar el inventario como desactivado (Estado = 0)
        inventario.Estado = 0;
        yield inventario.save();
        return res.json(inventario);
    }
    catch (error) {
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
});
exports.deleteInventario = deleteInventario;
