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
exports.Promocion = void 0;
const typeorm_1 = require("typeorm");
const Estado_1 = require("./Estado");
const Tipopromocion_1 = require("./Tipopromocion");
const PromocionProducto_1 = require("./PromocionProducto");
const DetalleVenta_1 = require("./DetalleVenta");
const Rango_1 = require("./Rango");
const Imagen_1 = require("./Imagen");
const DetallePedido_1 = require("./DetallePedido");
let Promocion = class Promocion extends typeorm_1.BaseEntity {
};
exports.Promocion = Promocion;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'idpromocion', type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Promocion.prototype, "IdPromocion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre', type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Promocion.prototype, "Nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'descripcion', type: "varchar", length: 255 }),
    __metadata("design:type", String)
], Promocion.prototype, "Descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fecharegistro", type: "date" }),
    __metadata("design:type", Date)
], Promocion.prototype, "FechaRegistro", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fechaactualizacion", type: "date", nullable: true }),
    __metadata("design:type", Date)
], Promocion.prototype, "Fechaactualizacion", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Estado_1.Estado, (estado) => estado.Promocion),
    (0, typeorm_1.JoinColumn)({ name: "idestado" }),
    __metadata("design:type", Estado_1.Estado)
], Promocion.prototype, "Estado", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Tipopromocion_1.Tipopromocion, (tipopromocion) => tipopromocion.Promocion),
    (0, typeorm_1.JoinColumn)({ name: "idtipopromocion" }),
    __metadata("design:type", Tipopromocion_1.Tipopromocion)
], Promocion.prototype, "Tipopromocion", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => PromocionProducto_1.Promocionproducto, (promocion) => promocion.Promocion),
    __metadata("design:type", Array)
], Promocion.prototype, "Promocionproducto", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Rango_1.Rango, (rango) => rango.Promocion),
    __metadata("design:type", Rango_1.Rango)
], Promocion.prototype, "Rango", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Imagen_1.Imagen, (rango) => rango.Promocion),
    (0, typeorm_1.JoinColumn)({ name: "idimagen" }),
    __metadata("design:type", Imagen_1.Imagen)
], Promocion.prototype, "Imagen", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => DetalleVenta_1.Detalleventa, (detalleventa) => detalleventa.Promocion),
    __metadata("design:type", Array)
], Promocion.prototype, "Detalleventa", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => DetallePedido_1.Detallepedido, (detalleventa) => detalleventa.Promocion),
    __metadata("design:type", Array)
], Promocion.prototype, "Detallepedido", void 0);
exports.Promocion = Promocion = __decorate([
    (0, typeorm_1.Entity)()
    //@Check(`"Estado" IN (0, 1)`)
], Promocion);
