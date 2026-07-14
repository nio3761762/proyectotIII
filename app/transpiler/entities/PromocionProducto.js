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
exports.Promocionproducto = void 0;
const typeorm_1 = require("typeorm");
const Promocion_1 = require("./Promocion");
const Producto_1 = require("./Producto");
const ProductoMedida_1 = require("./ProductoMedida");
let Promocionproducto = class Promocionproducto extends typeorm_1.BaseEntity {
};
exports.Promocionproducto = Promocionproducto;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'idpromocionproducto', type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Promocionproducto.prototype, "IdPromocionProducto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cantidad', type: "integer" }),
    __metadata("design:type", Number)
], Promocionproducto.prototype, "Cantidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'descuento', type: "numeric", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Promocionproducto.prototype, "Descuento", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "precio", type: "numeric", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Promocionproducto.prototype, "Precio", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Producto_1.Producto, (producto) => producto.Promocionproducto, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idproducto" }),
    __metadata("design:type", Producto_1.Producto)
], Promocionproducto.prototype, "Producto", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ProductoMedida_1.Productomedida, (producto) => producto.Promocionproducto, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idproductomedida" }),
    __metadata("design:type", ProductoMedida_1.Productomedida)
], Promocionproducto.prototype, "Productomedida", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Promocion_1.Promocion, (promocion) => promocion.Promocionproducto),
    (0, typeorm_1.JoinColumn)({ name: "idpromocion" }),
    __metadata("design:type", Promocion_1.Promocion)
], Promocionproducto.prototype, "Promocion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "estado", type: "integer", default: 1 }),
    __metadata("design:type", Number)
], Promocionproducto.prototype, "Estado", void 0);
exports.Promocionproducto = Promocionproducto = __decorate([
    (0, typeorm_1.Entity)()
], Promocionproducto);
