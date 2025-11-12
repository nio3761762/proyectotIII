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
exports.deleteProductoFromCarrito = exports.updateProductoInCarrito = exports.getProductosByCarrito = exports.addProductoToCarrito = void 0;
const ProductoCarrito_1 = require("../entities/ProductoCarrito");
const CarritodeCompras_1 = require("../entities/CarritodeCompras");
const Producto_1 = require("../entities/Producto");
// Agregar un producto al carrito
const addProductoToCarrito = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Id_Carrito, Producto_Id, Cantidad, PrecioTotal } = req.body;
        // Verificar si el carrito existe
        const carrito = yield CarritodeCompras_1.CarritoDeCompras.findOne({ where: { Id_Carrito } });
        if (!carrito) {
            return res.status(404).json({ message: "Carrito no encontrado" });
        }
        // Verificar si el producto existe
        const producto = yield Producto_1.Producto.findOne({ where: { Id_Producto: Producto_Id } });
        if (!producto) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        // Crear una nueva relación ProductoCarrito
        const productoCarrito = new ProductoCarrito_1.ProductoCarrito();
        productoCarrito.Id_Carrito = Id_Carrito;
        productoCarrito.Producto_Id = Producto_Id;
        productoCarrito.Cantidad = Cantidad;
        productoCarrito.PrecioTotal = PrecioTotal;
        // Guardar en la base de datos
        yield productoCarrito.save();
        return res.status(201).json(productoCarrito);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
});
exports.addProductoToCarrito = addProductoToCarrito;
// Obtener los productos de un carrito
const getProductosByCarrito = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Id_Carrito } = req.params;
        const productos = yield ProductoCarrito_1.ProductoCarrito.find({
            where: { Id_Carrito: parseInt(Id_Carrito) },
            relations: ["carrito", "producto"],
        });
        if (productos.length === 0) {
            return res.status(404).json({ message: "No se encontraron productos para este carrito" });
        }
        return res.status(200).json(productos);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
});
exports.getProductosByCarrito = getProductosByCarrito;
// Actualizar un producto en el carrito
const updateProductoInCarrito = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Id_Carrito, Producto_Id } = req.params;
        const { Cantidad, PrecioTotal } = req.body;
        const productoCarrito = yield ProductoCarrito_1.ProductoCarrito.findOne({
            where: {
                Id_Carrito: parseInt(Id_Carrito),
                Producto_Id: parseInt(Producto_Id),
            },
        });
        if (!productoCarrito) {
            return res.status(404).json({ message: "Producto no encontrado en el carrito" });
        }
        productoCarrito.Cantidad = Cantidad || productoCarrito.Cantidad;
        productoCarrito.PrecioTotal = PrecioTotal || productoCarrito.PrecioTotal;
        yield productoCarrito.save();
        return res.status(200).json(productoCarrito);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
});
exports.updateProductoInCarrito = updateProductoInCarrito;
// Eliminar un producto del carrito
const deleteProductoFromCarrito = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Id_Carrito, Producto_Id } = req.params;
        const productoCarrito = yield ProductoCarrito_1.ProductoCarrito.findOne({
            where: {
                Id_Carrito: parseInt(Id_Carrito),
                Producto_Id: parseInt(Producto_Id),
            },
        });
        if (!productoCarrito) {
            return res.status(404).json({ message: "Producto no encontrado en el carrito" });
        }
        yield productoCarrito.remove();
        return res.status(200).json({ message: "Producto eliminado del carrito" });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
});
exports.deleteProductoFromCarrito = deleteProductoFromCarrito;
