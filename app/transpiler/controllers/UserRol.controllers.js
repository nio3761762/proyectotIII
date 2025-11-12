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
exports.getUserRoles = exports.assignRoleToUser = void 0;
const Rol_1 = require("../entities/Rol"); // Asumo que la entidad Rol está aquí
const UserRol_1 = require("../entities/UserRol"); // Relación entre usuarios y roles
const Users_1 = require("../entities/Users"); // Usuario relacionado con los roles
// Crear un nuevo rol
// Asignar un rol a un usuario
const assignRoleToUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, roleId } = req.body;
        const user = yield Users_1.Usuario.findOne({ where: { Usuario: userId } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const role = yield Rol_1.Rol.findOne({ where: { Id_Rol: roleId } });
        if (!role) {
            return res.status(404).json({ message: "Role not found" });
        }
        const userRole = new UserRol_1.UsuarioRoles();
        userRole.usuario = user;
        userRole.rol = role;
        yield userRole.save();
        return res.status(201).json({ message: "Role assigned to user" });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
});
exports.assignRoleToUser = assignRoleToUser;
// Obtener roles asignados a un usuario
const getUserRoles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield Users_1.Usuario.findOne({ where: { Usuario: id } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const userRoles = yield UserRol_1.UsuarioRoles.find({ where: { usuario: user }, relations: ["rol"] });
        return res.json(userRoles.map((userRole) => userRole.rol));
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
});
exports.getUserRoles = getUserRoles;
