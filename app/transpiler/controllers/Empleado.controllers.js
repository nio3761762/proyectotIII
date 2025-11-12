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
exports.deleteEmpleado = exports.updateEmpleado = exports.getEmpleadoById = exports.getEmpleados = exports.createEmpleado = exports.registerUserAndEmpl = void 0;
const Empleado_1 = require("../entities/Empleado");
const Users_1 = require("../entities/Users");
const user_controllers_1 = require("./user.controllers");
const registerUserAndEmpl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Usuarioid, // Nombre de usuario
        Password, // Contraseña         // Correo electrónico del usuario
        Nombres, Apellidos, Direccion, Telefono, CI, CorreoElectronico, FechaNacimiento, Salario, Imagen } = req.body;
        //  const Imagen = req.file ? req.file.filename : null;
        let user;
        try {
            user = yield (0, user_controllers_1.createUser1)({ Usuarioid, Password, CorreoElectronico });
        }
        catch (error) {
            if (error instanceof Error)
                return res.status(400).json({ message: error.message });
        }
        // Verificar si el cliente ya existe
        const empleadoExistente = yield Empleado_1.Empleado.findOne({ where: { Usuario_Id: Usuarioid } });
        if (empleadoExistente) {
            return res.status(400).json({ message: "El usuario ya está registrado como empleado" });
        }
        // Obtener el último ID de cliente
        const ultimoCliente = yield Empleado_1.Empleado.createQueryBuilder("empleado")
            .select("MAX(empleado.Id_Empleado)", "ultimoId")
            .getRawOne();
        const nuevoId = ((ultimoCliente === null || ultimoCliente === void 0 ? void 0 : ultimoCliente.ultimoId) || 0) + 1;
        // Crear el cliente
        const empleado = new Empleado_1.Empleado();
        empleado.Id_Empleado = nuevoId;
        empleado.Usuario_Id = Usuarioid;
        empleado.Nombres = Nombres;
        empleado.Apellidos = Apellidos;
        empleado.Direccion = Direccion;
        empleado.Telefono = Telefono;
        empleado.CI = CI;
        empleado.CorreoElectronico = CorreoElectronico;
        empleado.FechaNacimiento = FechaNacimiento;
        empleado.Salario = Salario;
        empleado.Imagen = Imagen;
        empleado.Estado = 1;
        yield empleado.save();
        return res.status(201).json({
            empleado
        });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
});
exports.registerUserAndEmpl = registerUserAndEmpl;
// Crear un nuevo Empleado
const createEmpleado = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Usuario_Id, Nombres, Apellidos, Direccion, Telefono, CI, CorreoElectronico, FechaNacimiento, Salario, Imagen, Estado, } = req.body;
        // Verificar que el usuario exista
        const usuario = yield Users_1.Usuario.findOne({ where: { Usuario: Usuario_Id } });
        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        // Crear un nuevo empleado
        const empleado = new Empleado_1.Empleado();
        empleado.Usuario_Id = Usuario_Id;
        empleado.Nombres = Nombres;
        empleado.Apellidos = Apellidos;
        empleado.Direccion = Direccion;
        empleado.Telefono = Telefono;
        empleado.CI = CI;
        empleado.CorreoElectronico = CorreoElectronico;
        empleado.FechaNacimiento = FechaNacimiento;
        empleado.Salario = Salario;
        empleado.Imagen = Imagen;
        empleado.Estado = Estado;
        // Guardar en la base de datos
        yield empleado.save();
        return res.status(201).json(empleado);
    }
    catch (error) {
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
});
exports.createEmpleado = createEmpleado;
// Obtener todos los Empleados
const getEmpleados = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const empleados = yield Empleado_1.Empleado.find({ relations: ["usuario"] }); // Incluye el usuario relacionado
        return res.json(empleados);
    }
    catch (error) {
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
});
exports.getEmpleados = getEmpleados;
// Obtener un Empleado por su ID
const getEmpleadoById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const empleado = yield Empleado_1.Empleado.findOne({
            where: { Id_Empleado: parseInt(id) },
            relations: ["usuario"], // Incluye el usuario relacionado
        });
        if (!empleado) {
            return res.status(404).json({ message: "Empleado no encontrado" });
        }
        return res.json(empleado);
    }
    catch (error) {
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
});
exports.getEmpleadoById = getEmpleadoById;
// Actualizar un Empleado
const updateEmpleado = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { Usuarioid, Nombres, Apellidos, Direccion, Telefono, CI, CorreoElectronico, FechaNacimiento, Salario, Imagen, Estado, } = req.body;
        const empleado = yield Empleado_1.Empleado.findOne({ where: { Id_Empleado: parseInt(id) } });
        if (!empleado) {
            return res.status(404).json({ message: "Empleado no encontrado" });
        }
        // Actualizar los datos del empleado
        empleado.Usuario_Id = Usuarioid;
        empleado.Nombres = Nombres;
        empleado.Apellidos = Apellidos;
        empleado.Direccion = Direccion;
        empleado.Telefono = Telefono;
        empleado.CI = CI;
        empleado.CorreoElectronico = CorreoElectronico;
        empleado.FechaNacimiento = FechaNacimiento;
        empleado.Salario = Salario;
        empleado.Imagen = Imagen;
        empleado.Estado = Estado;
        // Guardar los cambios
        yield empleado.save();
        return res.status(200).json(empleado);
    }
    catch (error) {
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
});
exports.updateEmpleado = updateEmpleado;
// Eliminar (desactivar) un Empleado
const deleteEmpleado = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const empleado = yield Empleado_1.Empleado.findOne({ where: { Id_Empleado: parseInt(id) } });
        if (!empleado) {
            return res.status(404).json({ message: "Empleado no encontrado" });
        }
        // Marcar al empleado como desactivado (Estado = 0)
        empleado.Estado = 0;
        yield empleado.save();
        return res.status(204).send();
    }
    catch (error) {
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
});
exports.deleteEmpleado = deleteEmpleado;
