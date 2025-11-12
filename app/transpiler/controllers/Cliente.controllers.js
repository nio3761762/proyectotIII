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
exports.deleteCliente = exports.updateCliente = exports.getClienteById = exports.registerUserAndClient = exports.getClientes = exports.createCliente = void 0;
const Cliente_1 = require("../entities/Cliente");
const Users_1 = require("../entities/Users");
const user_controllers_1 = require("./user.controllers");
// Crear un nuevo Cliente
const createCliente = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Usuario_Id, Nombre, Apellidos, Telefono, CI, Direccion, CorreoElectronico, FechaNacimiento, Estado, } = req.body;
        // Verificar que el usuario exista
        const usuario = yield Users_1.Usuario.findOne({ where: { Usuario: Usuario_Id } });
        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        const clienteExistente = yield Cliente_1.Cliente.findOne({ where: { Usuario_Id } });
        if (clienteExistente) {
            return res.status(400).json({ message: "El usuario ya está registrado como cliente" });
        }
        const ultimoCliente = yield Cliente_1.Cliente.createQueryBuilder("cliente")
            .select("MAX(cliente.Id_Cliente)", "ultimoId")
            .getRawOne();
        // Calcular el nuevo Id_Cliente
        const nuevoId = ((ultimoCliente === null || ultimoCliente === void 0 ? void 0 : ultimoCliente.ultimoId) || 0) + 1;
        // Crear un nuevo cliente
        const cliente = new Cliente_1.Cliente();
        cliente.Id_Cliente = nuevoId;
        cliente.Usuario_Id = Usuario_Id;
        cliente.Nombre = Nombre;
        cliente.Apellidos = Apellidos;
        cliente.Telefono = Telefono;
        cliente.CI = CI;
        cliente.Direccion = Direccion;
        cliente.CorreoElectronico = CorreoElectronico;
        cliente.FechaNacimiento = FechaNacimiento;
        cliente.Estado = Estado;
        // Guardar el cliente en la base de datos
        yield cliente.save();
        return res.status(201).json(cliente);
    }
    catch (error) {
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
});
exports.createCliente = createCliente;
// Obtener todos los Clientes
const getClientes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clientes = yield Cliente_1.Cliente.find({ relations: ["usuario"] }); // Incluye el usuario relacionado
        return res.json(clientes);
    }
    catch (error) {
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
});
exports.getClientes = getClientes;
const registerUserAndClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Usuarioid, // Nombre de usuario
        Password, // Contraseña         // Correo electrónico del usuario
        Nombre, // Nombre del cliente
        Apellidos, // Apellidos del cliente
        Telefono, // Teléfono
        CI, // Cédula de identidad
        Direccion, // Dirección
        CorreoElectronico, // Correo del cliente
        FechaNacimiento, // Fecha de nacimiento
        // Estado del cliente (activo o inactivo)
         } = req.body;
        let user;
        try {
            user = yield (0, user_controllers_1.createUser1)({ Usuarioid, Password, CorreoElectronico });
        }
        catch (error) {
            if (error instanceof Error)
                return res.status(400).json({ message: error.message });
        }
        // Verificar si el cliente ya existe
        const clienteExistente = yield Cliente_1.Cliente.findOne({ where: { Usuario_Id: Usuarioid } });
        if (clienteExistente) {
            return res.status(400).json({ message: "El usuario ya está registrado como cliente" });
        }
        // Obtener el último ID de cliente
        const ultimoCliente = yield Cliente_1.Cliente.createQueryBuilder("cliente")
            .select("MAX(cliente.Id_Cliente)", "ultimoId")
            .getRawOne();
        const nuevoId = ((ultimoCliente === null || ultimoCliente === void 0 ? void 0 : ultimoCliente.ultimoId) || 0) + 1;
        // Crear el cliente
        const cliente = new Cliente_1.Cliente();
        cliente.Id_Cliente = nuevoId;
        cliente.Usuario_Id = Usuarioid; // Asociar al nuevo usuario creado
        cliente.Nombre = Nombre;
        cliente.Apellidos = Apellidos;
        cliente.Telefono = Telefono;
        cliente.CI = CI;
        cliente.Direccion = Direccion;
        cliente.CorreoElectronico = CorreoElectronico;
        cliente.FechaNacimiento = FechaNacimiento;
        cliente.Estado = 1;
        yield cliente.save();
        return res.status(201).json({
            message: "Usuario y Cliente creados exitosamente",
            cliente: cliente
        });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
});
exports.registerUserAndClient = registerUserAndClient;
// Obtener un Cliente por su ID
const getClienteById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const cliente = yield Cliente_1.Cliente.findOne({
            where: { Id_Cliente: parseInt(id) },
            relations: ["usuario"], // Incluye el usuario relacionado
        });
        if (!cliente) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }
        return res.json(cliente);
    }
    catch (error) {
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
});
exports.getClienteById = getClienteById;
// Actualizar un Cliente
const updateCliente = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { Usuarioid, Nombre, Apellidos, Telefono, CI, Direccion, CorreoElectronico, FechaNacimeinto, Estado, } = req.body;
        const cliente = yield Cliente_1.Cliente.findOne({ where: { Id_Cliente: parseInt(id) } });
        if (!cliente) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }
        cliente.Nombre = Nombre;
        cliente.Apellidos = Apellidos;
        cliente.Telefono = Telefono;
        cliente.CI = CI;
        cliente.Direccion = Direccion;
        cliente.CorreoElectronico = CorreoElectronico;
        cliente.FechaNacimiento = FechaNacimeinto;
        cliente.Estado = Estado;
        cliente.Usuario_Id = Usuarioid;
        // Guardar los cambios
        yield cliente.save();
        return res.status(200).json(cliente);
    }
    catch (error) {
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
});
exports.updateCliente = updateCliente;
// Eliminar (desactivar) un Cliente
const deleteCliente = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const cliente = yield Cliente_1.Cliente.findOne({ where: { Id_Cliente: parseInt(id) } });
        if (!cliente) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }
        // Marcar al cliente como desactivado (Estado = null)
        cliente.Estado = 0;
        yield cliente.save();
        return res.status(204).send();
    }
    catch (error) {
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
});
exports.deleteCliente = deleteCliente;
function dayjs(FechaNacimeinto, arg1, arg2) {
    throw new Error("Function not implemented.");
}
