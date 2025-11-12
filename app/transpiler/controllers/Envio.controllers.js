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
exports.deleteEnvio = exports.updateEnvio = exports.getEnvioById = exports.getEnvios = exports.createEnvio = void 0;
const Envio_1 = require("../entities/Envio");
const Pedido_1 = require("../entities/Pedido");
const Empleado_1 = require("../entities/Empleado");
// Crear un nuevo envío
const createEnvio = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Id_Pedido, Empleado_Id, DireccionEnvio, FechaEnvio, Estado } = req.body;
        // Verificar que el pedido existe
        const pedido = yield Pedido_1.Pedido.findOne({ where: { Id_Pedido } });
        if (!pedido) {
            return res.status(404).json({ message: "Pedido no encontrado" });
        }
        // Verificar que el empleado existe
        const empleado = yield Empleado_1.Empleado.findOne({ where: { Id_Empleado: Empleado_Id } });
        if (!empleado) {
            return res.status(404).json({ message: "Empleado no encontrado" });
        }
        // Crear un nuevo envío
        const envio = new Envio_1.Envio();
        envio.Id_Pedido = Id_Pedido;
        envio.Empleado_Id = Empleado_Id;
        envio.DireccionEnvio = DireccionEnvio;
        envio.FechaEnvio = FechaEnvio;
        envio.Estado = Estado;
        // Guardar en la base de datos
        yield envio.save();
        return res.status(201).json(envio);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
});
exports.createEnvio = createEnvio;
// Obtener todos los envíos
const getEnvios = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const envios = yield Envio_1.Envio.find({
            relations: ["pedido", "empleado"],
        });
        return res.status(200).json(envios);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
});
exports.getEnvios = getEnvios;
// Obtener un envío por ID
const getEnvioById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Id_Envio } = req.params;
        const envio = yield Envio_1.Envio.findOne({
            where: { Id_Envio: parseInt(Id_Envio) },
            relations: ["pedido", "empleado"],
        });
        if (!envio) {
            return res.status(404).json({ message: "Envio no encontrado" });
        }
        return res.status(200).json(envio);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
});
exports.getEnvioById = getEnvioById;
// Actualizar un envío
const updateEnvio = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Id_Envio } = req.params;
        const { DireccionEnvio, FechaEnvio, Estado } = req.body;
        const envio = yield Envio_1.Envio.findOne({ where: { Id_Envio: parseInt(Id_Envio) } });
        if (!envio) {
            return res.status(404).json({ message: "Envio no encontrado" });
        }
        envio.DireccionEnvio = DireccionEnvio;
        envio.FechaEnvio = FechaEnvio;
        envio.Estado = Estado;
        // Guardar los cambios en la base de datos
        yield envio.save();
        return res.status(200).json(envio);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
});
exports.updateEnvio = updateEnvio;
// Eliminar un envío
const deleteEnvio = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Id_Envio } = req.params;
        const envio = yield Envio_1.Envio.findOne({ where: { Id_Envio: parseInt(Id_Envio) } });
        if (!envio) {
            return res.status(404).json({ message: "Envio no encontrado" });
        }
        yield envio.remove();
        return res.status(200).json({ message: "Envio eliminado con éxito" });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
});
exports.deleteEnvio = deleteEnvio;
