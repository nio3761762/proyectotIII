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
exports.Usuario = void 0;
const typeorm_1 = require("typeorm");
const UserRol_1 = require("./UserRol");
const Cliente_1 = require("./Cliente");
const Empleado_1 = require("./Empleado");
const Reporte_1 = require("./Reporte");
const CarritodeCompras_1 = require("./CarritodeCompras");
let Usuario = class Usuario extends typeorm_1.BaseEntity {
};
exports.Usuario = Usuario;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: "varchar", length: 8 }),
    __metadata("design:type", String)
], Usuario.prototype, "Usuario", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20 }),
    __metadata("design:type", String)
], Usuario.prototype, "Contrasena", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Usuario.prototype, "CorreoElectronico", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer" }),
    __metadata("design:type", Number)
], Usuario.prototype, "Estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", Object)
], Usuario.prototype, "Token", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", Object)
], Usuario.prototype, "RToken", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => UserRol_1.UsuarioRoles, (usuarioRol) => usuarioRol.usuario),
    __metadata("design:type", Array)
], Usuario.prototype, "roles", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Reporte_1.Reportes, (reporte) => reporte.usuario),
    __metadata("design:type", Array)
], Usuario.prototype, "reporte", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Cliente_1.Cliente, (cliente) => cliente.usuario) // Relación con Cliente
    ,
    __metadata("design:type", Cliente_1.Cliente)
], Usuario.prototype, "cliente", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Empleado_1.Empleado, (empleado) => empleado.usuario) // Relación con Cliente
    ,
    __metadata("design:type", Empleado_1.Empleado)
], Usuario.prototype, "empleado", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CarritodeCompras_1.CarritoDeCompras, (carritoDeCompras) => carritoDeCompras.usuario),
    __metadata("design:type", Array)
], Usuario.prototype, "carrito", void 0);
exports.Usuario = Usuario = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Check)(`"Estado" IN (0, 1)`)
], Usuario);
