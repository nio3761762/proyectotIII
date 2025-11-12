"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioRoles = void 0;
const typeorm_1 = require("typeorm");
const Users_1 = require("./Users"); // Importamos la entidad Usuario
const Rol_1 = require("./Rol"); // Importamos la entidad Rol
let UsuarioRoles = class UsuarioRoles extends typeorm_1.BaseEntity {
};
exports.UsuarioRoles = UsuarioRoles;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: "varchar", length: 8 }),
    __metadata("design:type", String)
], UsuarioRoles.prototype, "Usuario_Id", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: "integer" }),
    __metadata("design:type", Number)
], UsuarioRoles.prototype, "Rol_Id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Users_1.Usuario, (usuario) => usuario.roles),
    (0, typeorm_1.JoinColumn)({ name: "Usuario_Id" }),
    __metadata("design:type", Users_1.Usuario)
], UsuarioRoles.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Rol_1.Rol, (rol) => rol.usuarios),
    (0, typeorm_1.JoinColumn)({ name: "Rol_Id" }),
    __metadata("design:type", Rol_1.Rol)
], UsuarioRoles.prototype, "rol", void 0);
exports.UsuarioRoles = UsuarioRoles = __decorate([
    (0, typeorm_1.Entity)()
], UsuarioRoles);
