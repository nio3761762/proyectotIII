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
exports.Rol = void 0;
const typeorm_1 = require("typeorm");
const RolMenu_1 = require("./RolMenu");
const RolUsuario_1 = require("./RolUsuario");
let Rol = class Rol extends typeorm_1.BaseEntity {
};
exports.Rol = Rol;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'idrol', type: "varchar", length: 50 }),
    __metadata("design:type", String)
], Rol.prototype, "IdRol", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre', type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Rol.prototype, "Nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecharegistro', type: "date" }),
    __metadata("design:type", Date)
], Rol.prototype, "FechaRegistro", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fechaactualizacion', type: "date", nullable: true }),
    __metadata("design:type", Date)
], Rol.prototype, "FechaActualizacion", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => RolMenu_1.Rolmenu, (rolmenu) => rolmenu.rol),
    __metadata("design:type", Array)
], Rol.prototype, "rolMenus", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => RolUsuario_1.Rolusuario, (rolusuario) => rolusuario.Rol),
    __metadata("design:type", Array)
], Rol.prototype, "Rolusuario", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "estado", type: "integer", default: 1 }),
    __metadata("design:type", Number)
], Rol.prototype, "Estado", void 0);
exports.Rol = Rol = __decorate([
    (0, typeorm_1.Entity)()
], Rol);
