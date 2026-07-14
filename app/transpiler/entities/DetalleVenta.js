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
exports.Detalleventa = void 0;
const typeorm_1 = require("typeorm");
const Venta_1 = require("./Venta");
const Producto_1 = require("./Producto");
const Promocion_1 = require("./Promocion");
const ProductoMedida_1 = require("./ProductoMedida");
let Detalleventa = class Detalleventa extends typeorm_1.BaseEntity {
};
exports.Detalleventa = Detalleventa;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'iddetalleventa', type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Detalleventa.prototype, "IdDetalleVenta", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "cantidad", type: "integer" }),
    __metadata("design:type", Number)
], Detalleventa.prototype, "Cantidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "precio", type: "numeric", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Detalleventa.prototype, "Precio", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Venta_1.Venta, (venta) => venta.Detalleventa),
    (0, typeorm_1.JoinColumn)({ name: "idventa" }),
    __metadata("design:type", Venta_1.Venta)
], Detalleventa.prototype, "Venta", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Producto_1.Producto, (producto) => producto.Detalleventa, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idproducto" }),
    __metadata("design:type", Producto_1.Producto)
], Detalleventa.prototype, "Producto", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ProductoMedida_1.Productomedida, (producto) => producto.Detalleventa, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idproductomedida" }),
    __metadata("design:type", ProductoMedida_1.Productomedida)
], Detalleventa.prototype, "Productomedida", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Promocion_1.Promocion, (promocion) => promocion.Detalleventa, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idpromocion" }),
    __metadata("design:type", Promocion_1.Promocion)
], Detalleventa.prototype, "Promocion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'descuento', type: "numeric", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Detalleventa.prototype, "Descuento", void 0);
exports.Detalleventa = Detalleventa = __decorate([
    (0, typeorm_1.Entity)()
    //@Check(`"Estado" IN (0, 1)`)
], Detalleventa);
