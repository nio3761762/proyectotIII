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
exports.Hornoproducto = void 0;
const typeorm_1 = require("typeorm");
const Producto_1 = require("./Producto");
const Produccionhornodetalle_1 = require("./Produccionhornodetalle");
const Empleado_1 = require("./Empleado");
let Hornoproducto = class Hornoproducto extends typeorm_1.BaseEntity {
};
exports.Hornoproducto = Hornoproducto;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "idhornoproducto", type: "varchar", length: 150 }),
    __metadata("design:type", String)
], Hornoproducto.prototype, "Idhornoproducto", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Produccionhornodetalle_1.ProduccionHornoDetalle, (p) => p.Hornoproducto),
    (0, typeorm_1.JoinColumn)({ name: "idproduccionhornodetalle" }),
    __metadata("design:type", Produccionhornodetalle_1.ProduccionHornoDetalle)
], Hornoproducto.prototype, "ProduccionHornoDetalle", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Producto_1.Producto, (p) => p.Hornoproducto),
    (0, typeorm_1.JoinColumn)({ name: "idproducto" }),
    __metadata("design:type", Producto_1.Producto)
], Hornoproducto.prototype, "Producto", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Empleado_1.Empleado, (e) => e.Produccion),
    (0, typeorm_1.JoinColumn)({ name: "idempleado" }),
    __metadata("design:type", Empleado_1.Empleado)
], Hornoproducto.prototype, "Empleado", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "cantidad", type: "numeric", precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], Hornoproducto.prototype, "Cantidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "hora", type: "time", nullable: true }),
    __metadata("design:type", String)
], Hornoproducto.prototype, "Hora", void 0);
exports.Hornoproducto = Hornoproducto = __decorate([
    (0, typeorm_1.Entity)()
], Hornoproducto);
