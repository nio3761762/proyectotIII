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
exports.Productomedida = void 0;
const typeorm_1 = require("typeorm");
const Producto_1 = require("./Producto");
const UnidadMedida_1 = require("./UnidadMedida");
const DetalleCompra_1 = require("./DetalleCompra");
let Productomedida = class Productomedida extends typeorm_1.BaseEntity {
};
exports.Productomedida = Productomedida;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "idproductomedida", type: "varchar", length: 50 }),
    __metadata("design:type", String)
], Productomedida.prototype, "IdProductoMedida", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fecharegistro", type: "date" }),
    __metadata("design:type", Date)
], Productomedida.prototype, "FechaRegistro", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "cantidad", type: "numeric", precision: 10, scale: 3 }),
    __metadata("design:type", Number)
], Productomedida.prototype, "Cantidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "precioventa", type: "numeric", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Productomedida.prototype, "PrecioVenta", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "preciomayor", type: "numeric", precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Productomedida.prototype, "PrecioMayor", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Producto_1.Producto, (Producto) => Producto.Productomedida),
    (0, typeorm_1.JoinColumn)({ name: "idproducto" }),
    __metadata("design:type", Producto_1.Producto)
], Productomedida.prototype, "Producto", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => UnidadMedida_1.Unidadmedida, (unidadmedida) => unidadmedida.Productomedida),
    (0, typeorm_1.JoinColumn)({ name: "idunidadmedida" }),
    __metadata("design:type", UnidadMedida_1.Unidadmedida)
], Productomedida.prototype, "Unidadmedida", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => DetalleCompra_1.Detallecompra, (compra) => compra.Productomedida),
    __metadata("design:type", Array)
], Productomedida.prototype, "Detallecompra", void 0);
exports.Productomedida = Productomedida = __decorate([
    (0, typeorm_1.Entity)()
], Productomedida);
