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
exports.deleteCarritoDeCompras = exports.updateCarritoDeCompras = exports.getCarritoDeComprasById = exports.getCarritosDeCompras = exports.createCarritoDeCompras = void 0;
const CarritodeCompras_1 = require("../entities/CarritodeCompras");
const Users_1 = require("../entities/Users");
// Crear un nuevo carrito de compras
const createCarritoDeCompras = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Usuario_Id, Fecha, Estado } = req.body;
        // Verificar que el usuario exista
        const usuario = yield Users_1.Usuario.findOne({ where: { Usuario: Usuario_Id } });
        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        // Crear el carrito de compras
        const carrito = new CarritodeCompras_1.CarritoDeCompras();
        carrito.Usuario_Id = Usuario_Id;
        carrito.Fecha = Fecha;
        carrito.Estado = Estado;
        // Guardar el carrito en la base de datos
        yield carrito.save();
        return res.status(201).json(carrito);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
});
exports.createCarritoDeCompras = createCarritoDeCompras;
// Obtener todos los carritos de compras
const getCarritosDeCompras = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const carritos = yield CarritodeCompras_1.CarritoDeCompras.find({
            relations: ["usuario"],
        });
        return res.status(200).json(carritos);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
});
exports.getCarritosDeCompras = getCarritosDeCompras;
// Obtener carrito de compras por ID
const getCarritoDeComprasById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Id_Carrito } = req.params;
        const carrito = yield CarritodeCompras_1.CarritoDeCompras.findOne({
            where: { Id_Carrito: parseInt(Id_Carrito) },
            relations: ["usuario"],
        });
        if (!carrito) {
            return res.status(404).json({ message: "Carrito de compras no encontrado" });
        }
        return res.status(200).json(carrito);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
});
exports.getCarritoDeComprasById = getCarritoDeComprasById;
// Actualizar carrito de compras
const updateCarritoDeCompras = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Id_Carrito } = req.params;
        const { Fecha, Estado } = req.body;
        const carrito = yield CarritodeCompras_1.CarritoDeCompras.findOne({ where: { Id_Carrito: parseInt(Id_Carrito) } });
        if (!carrito) {
            return res.status(404).json({ message: "Carrito de compras no encontrado" });
        }
        carrito.Fecha = Fecha || carrito.Fecha;
        carrito.Estado = Estado || carrito.Estado;
        yield carrito.save();
        return res.status(200).json(carrito);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
});
exports.updateCarritoDeCompras = updateCarritoDeCompras;
// Eliminar carrito de compras
const deleteCarritoDeCompras = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Id_Carrito } = req.params;
        const carrito = yield CarritodeCompras_1.CarritoDeCompras.findOne({ where: { Id_Carrito: parseInt(Id_Carrito) } });
        if (!carrito) {
            return res.status(404).json({ message: "Carrito de compras no encontrado" });
        }
        yield carrito.remove();
        return res.status(200).json({ message: "Carrito de compras eliminado con éxito" });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
});
exports.deleteCarritoDeCompras = deleteCarritoDeCompras;
