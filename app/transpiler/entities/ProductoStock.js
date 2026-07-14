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
exports.Productostock = void 0;
const typeorm_1 = require("typeorm");
const Producto_1 = require("./Producto");
const Sucursal_1 = require("./Sucursal");
let Productostock = class Productostock extends typeorm_1.BaseEntity {
};
exports.Productostock = Productostock;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "idproductostock", type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Productostock.prototype, "IdProductoStock", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fecha", type: "date" }),
    __metadata("design:type", Date)
], Productostock.prototype, "Fecha", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "cantidad", type: "integer", nullable: true }),
    __metadata("design:type", Number)
], Productostock.prototype, "Cantidad", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Producto_1.Producto, (Producto) => Producto.Productostock, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idproducto" }),
    __metadata("design:type", Producto_1.Producto)
], Productostock.prototype, "Producto", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Sucursal_1.Sucursal, (sucursal) => sucursal.Productostock, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idsucursal" }),
    __metadata("design:type", Sucursal_1.Sucursal)
], Productostock.prototype, "Sucursal", void 0);
exports.Productostock = Productostock = __decorate([
    (0, typeorm_1.Entity)()
], Productostock);
