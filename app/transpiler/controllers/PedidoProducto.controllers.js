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
exports.deletePedidoProducto = exports.updatePedidoProducto = exports.getPedidoProductoById = exports.getPedidoProductos = exports.addPedidoProducto = void 0;
const PedidoProducto_1 = require("../entities/PedidoProducto");
const Pedido_1 = require("../entities/Pedido");
const Producto_1 = require("../entities/Producto");
// Agregar un PedidoProducto
const addPedidoProducto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Id_Pedido, Id_Producto, Cantidad } = req.body;
        // Verificar que el pedido existe
        const pedido = yield Pedido_1.Pedido.findOne({ where: { Id_Pedido } });
        if (!pedido) {
            return res.status(404).json({ message: "Pedido no encontrado" });
        }
        // Verificar que el producto existe
        const producto = yield Producto_1.Producto.findOne({ where: { Id_Producto } });
        if (!producto) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        // Crear un nuevo PedidoProducto
        const pedidoProducto = new PedidoProducto_1.PedidoProducto();
        pedidoProducto.Id_Pedido = Id_Pedido;
        pedidoProducto.Id_Producto = Id_Producto;
        pedidoProducto.Cantidad = Cantidad;
        // Guardar en la base de datos
        yield pedidoProducto.save();
        return res.status(201).json(pedidoProducto);
    }
    catch (error) {
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
});
exports.addPedidoProducto = addPedidoProducto;
// Obtener todos los PedidoProducto
const getPedidoProductos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pedidoProductos = yield PedidoProducto_1.PedidoProducto.find({
            relations: ["pedido", "producto"],
        });
        return res.status(200).json(pedidoProductos);
    }
    catch (error) {
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
});
exports.getPedidoProductos = getPedidoProductos;
// Obtener un PedidoProducto por ID
const getPedidoProductoById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Id_Pedido, Id_Producto } = req.params;
        const pedidoProducto = yield PedidoProducto_1.PedidoProducto.findOne({
            where: { Id_Pedido: parseInt(Id_Pedido), Id_Producto: parseInt(Id_Producto) },
            relations: ["pedido", "producto"],
        });
        if (!pedidoProducto) {
            return res.status(404).json({ message: "PedidoProducto no encontrado" });
        }
        return res.status(200).json(pedidoProducto);
    }
    catch (error) {
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
});
exports.getPedidoProductoById = getPedidoProductoById;
// Actualizar un PedidoProducto
const updatePedidoProducto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Id_Pedido, Id_Producto } = req.params;
        const { Cantidad } = req.body;
        const pedidoProducto = yield PedidoProducto_1.PedidoProducto.findOne({
            where: { Id_Pedido: parseInt(Id_Pedido), Id_Producto: parseInt(Id_Producto) },
        });
        if (!pedidoProducto) {
            return res.status(404).json({ message: "PedidoProducto no encontrado" });
        }
        pedidoProducto.Cantidad = Cantidad;
        // Guardar cambios en la base de datos
        yield pedidoProducto.save();
        return res.status(200).json(pedidoProducto);
    }
    catch (error) {
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
});
exports.updatePedidoProducto = updatePedidoProducto;
// Eliminar un PedidoProducto
const deletePedidoProducto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Id_Pedido, Id_Producto } = req.params;
        const pedidoProducto = yield PedidoProducto_1.PedidoProducto.findOne({
            where: { Id_Pedido: parseInt(Id_Pedido), Id_Producto: parseInt(Id_Producto) },
        });
        if (!pedidoProducto) {
            return res.status(404).json({ message: "PedidoProducto no encontrado" });
        }
        yield pedidoProducto.remove();
        return res.status(200).json({ message: "PedidoProducto eliminado con éxito" });
    }
    catch (error) {
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
});
exports.deletePedidoProducto = deletePedidoProducto;
