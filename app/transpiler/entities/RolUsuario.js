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
exports.Rolusuario = void 0;
const typeorm_1 = require("typeorm");
const Rol_1 = require("./Rol");
const Usuario_1 = require("./Usuario");
let Rolusuario = class Rolusuario extends typeorm_1.BaseEntity {
};
exports.Rolusuario = Rolusuario;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'idrolusuario', type: "varchar", length: 50 }),
    __metadata("design:type", String)
], Rolusuario.prototype, "IdRolUsuario", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecharegistro', type: "date" }),
    __metadata("design:type", Date)
], Rolusuario.prototype, "FechaRegistro", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fechaactualizacion', type: "date", nullable: true }),
    __metadata("design:type", Date)
], Rolusuario.prototype, "FechaActualizacion", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Rol_1.Rol, (rol) => rol.Rolusuario),
    (0, typeorm_1.JoinColumn)({ name: "idrol" }),
    __metadata("design:type", Rol_1.Rol)
], Rolusuario.prototype, "Rol", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Usuario_1.Usuario, (usuario) => usuario.Rolusuario),
    (0, typeorm_1.JoinColumn)({ name: "idusuario" }),
    __metadata("design:type", Usuario_1.Usuario)
], Rolusuario.prototype, "Usuario", void 0);
exports.Rolusuario = Rolusuario = __decorate([
    (0, typeorm_1.Entity)()
    //@Check(`"Estado" IN (0, 1)`)
], Rolusuario);
