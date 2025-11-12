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
exports.Productosucursal = void 0;
const typeorm_1 = require("typeorm");
const Producto_1 = require("./Producto");
const Sucursal_1 = require("./Sucursal");
const Presentacionproducto_1 = require("./Presentacionproducto");
let Productosucursal = class Productosucursal extends typeorm_1.BaseEntity {
};
exports.Productosucursal = Productosucursal;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "idproductosucursal", type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Productosucursal.prototype, "IdProductoSucursal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fecha", type: "date" }),
    __metadata("design:type", Date)
], Productosucursal.prototype, "Fecha", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "cantidad", type: "integer", nullable: true }),
    __metadata("design:type", Number)
], Productosucursal.prototype, "Cantidad", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Producto_1.Producto, (Producto) => Producto.Productosucursal, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idproducto" }),
    __metadata("design:type", Producto_1.Producto)
], Productosucursal.prototype, "Producto", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Presentacionproducto_1.Presentacionproducto, (Producto) => Producto.Productosucursal, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idpaquete" }),
    __metadata("design:type", Presentacionproducto_1.Presentacionproducto)
], Productosucursal.prototype, "Paquete", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Sucursal_1.Sucursal, (sucursal) => sucursal.Productosucursal),
    (0, typeorm_1.JoinColumn)({ name: "idsucursal" }),
    __metadata("design:type", Sucursal_1.Sucursal)
], Productosucursal.prototype, "Sucursal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "stockminimo", type: "integer", nullable: true }),
    __metadata("design:type", Number)
], Productosucursal.prototype, "StockMinimo", void 0);
exports.Productosucursal = Productosucursal = __decorate([
    (0, typeorm_1.Entity)()
], Productosucursal);
