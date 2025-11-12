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
exports.Sucursal = void 0;
const typeorm_1 = require("typeorm");
const DIreccion_1 = require("./DIreccion");
const AdmDatos_1 = require("./AdmDatos");
const Estado_1 = require("./Estado");
const Horario_1 = require("./Horario");
const UsuarioSucursal_1 = require("./UsuarioSucursal");
const ProductoSucursal_1 = require("./ProductoSucursal");
const Venta_1 = require("./Venta");
const Distribucion_1 = require("./Distribucion");
let Sucursal = class Sucursal extends typeorm_1.BaseEntity {
    some(arg0) {
        throw new Error("Method not implemented.");
    }
};
exports.Sucursal = Sucursal;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "idsucursal", type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Sucursal.prototype, "IdSucursal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "nombre", type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Sucursal.prototype, "Nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "nro", type: "integer" }),
    __metadata("design:type", Number)
], Sucursal.prototype, "Nro", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fecharegistro", type: "date" }),
    __metadata("design:type", Date)
], Sucursal.prototype, "FechaRegistro", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fechaactualizacion", type: "date", nullable: true }),
    __metadata("design:type", Date)
], Sucursal.prototype, "FechaActualizacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "celular", type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Sucursal.prototype, "Celular", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "central", type: "integer" }),
    __metadata("design:type", Number)
], Sucursal.prototype, "Central", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => DIreccion_1.Direccion, (direccion) => direccion.Sucursal),
    (0, typeorm_1.JoinColumn)({ name: "iddireccion" }),
    __metadata("design:type", DIreccion_1.Direccion)
], Sucursal.prototype, "Direccion", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => AdmDatos_1.Administrardatos, (dato) => dato.sucursal),
    (0, typeorm_1.JoinColumn)({ name: "iddatos" }),
    __metadata("design:type", AdmDatos_1.Administrardatos)
], Sucursal.prototype, "Datos", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Estado_1.Estado, (estado) => estado.Sucursal),
    (0, typeorm_1.JoinColumn)({ name: "idestado" }),
    __metadata("design:type", Estado_1.Estado)
], Sucursal.prototype, "Estado", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Horario_1.Horario, (horario) => horario.Sucursal),
    (0, typeorm_1.JoinColumn)({ name: "idhorario" }),
    __metadata("design:type", Horario_1.Horario)
], Sucursal.prototype, "Horario", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => UsuarioSucursal_1.Usuariosucursal, (usuariosucursal) => usuariosucursal.Sucursal),
    __metadata("design:type", Array)
], Sucursal.prototype, "Usuariosucursal", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Venta_1.Venta, (venta) => venta.Sucursal),
    __metadata("design:type", Array)
], Sucursal.prototype, "Venta", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Distribucion_1.Distribucion, (venta) => venta.Sucursal),
    __metadata("design:type", Array)
], Sucursal.prototype, "Distribucion", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ProductoSucursal_1.Productosucursal, (productosucursal) => productosucursal.Sucursal),
    __metadata("design:type", Array)
], Sucursal.prototype, "Productosucursal", void 0);
exports.Sucursal = Sucursal = __decorate([
    (0, typeorm_1.Entity)()
], Sucursal);
