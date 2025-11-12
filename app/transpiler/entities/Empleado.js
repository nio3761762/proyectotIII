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
exports.Empleado = void 0;
const typeorm_1 = require("typeorm");
const Users_1 = require("./Users");
const Envio_1 = require("./Envio");
const venta_1 = require("./venta");
let Empleado = class Empleado extends typeorm_1.BaseEntity {
};
exports.Empleado = Empleado;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: "integer" }),
    __metadata("design:type", Number)
], Empleado.prototype, "Id_Empleado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 8 }),
    __metadata("design:type", String)
], Empleado.prototype, "Usuario_Id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 50 }),
    __metadata("design:type", String)
], Empleado.prototype, "Nombres", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Empleado.prototype, "Apellidos", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Empleado.prototype, "Direccion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer" }),
    __metadata("design:type", Number)
], Empleado.prototype, "Telefono", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer" }),
    __metadata("design:type", Number)
], Empleado.prototype, "CI", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 50 }),
    __metadata("design:type", String)
], Empleado.prototype, "CorreoElectronico", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", Date)
], Empleado.prototype, "FechaNacimiento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Empleado.prototype, "Salario", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255 }),
    __metadata("design:type", String)
], Empleado.prototype, "Imagen", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer" }),
    __metadata("design:type", Number)
], Empleado.prototype, "Estado", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Users_1.Usuario, (usuario) => usuario.empleado),
    (0, typeorm_1.JoinColumn)({ name: "Usuario_Id" }),
    __metadata("design:type", Users_1.Usuario)
], Empleado.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Envio_1.Envio, (envio) => envio.empleado),
    __metadata("design:type", Array)
], Empleado.prototype, "envio", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => venta_1.Venta, (venta) => venta.empleado),
    __metadata("design:type", Array)
], Empleado.prototype, "venta", void 0);
exports.Empleado = Empleado = __decorate([
    (0, typeorm_1.Entity)()
], Empleado);
