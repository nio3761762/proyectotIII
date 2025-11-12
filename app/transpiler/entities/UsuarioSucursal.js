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
exports.Usuariosucursal = void 0;
const typeorm_1 = require("typeorm");
const Estado_1 = require("./Estado");
const Usuario_1 = require("./Usuario");
const Sucursal_1 = require("./Sucursal");
let Usuariosucursal = class Usuariosucursal extends typeorm_1.BaseEntity {
};
exports.Usuariosucursal = Usuariosucursal;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "idusuariosucursal", type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Usuariosucursal.prototype, "IdUsuarioSucursal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fechaasignado", type: "date" }),
    __metadata("design:type", Date)
], Usuariosucursal.prototype, "FechaAsignado", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fechaactualizacion", type: "date", nullable: true }),
    __metadata("design:type", Date)
], Usuariosucursal.prototype, "FechaActualizacion", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Estado_1.Estado, (estado) => estado.Usuariosucursal),
    (0, typeorm_1.JoinColumn)({ name: "idestado" }),
    __metadata("design:type", Estado_1.Estado)
], Usuariosucursal.prototype, "Estado", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Usuario_1.Usuario, (usuario) => usuario.Usuariosucursal),
    (0, typeorm_1.JoinColumn)({ name: "idusuario" }),
    __metadata("design:type", Usuario_1.Usuario)
], Usuariosucursal.prototype, "Usuario", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Sucursal_1.Sucursal, (sucursal) => sucursal.Usuariosucursal),
    (0, typeorm_1.JoinColumn)({ name: "idsucursal" }),
    __metadata("design:type", Sucursal_1.Sucursal)
], Usuariosucursal.prototype, "Sucursal", void 0);
exports.Usuariosucursal = Usuariosucursal = __decorate([
    (0, typeorm_1.Entity)()
], Usuariosucursal);
