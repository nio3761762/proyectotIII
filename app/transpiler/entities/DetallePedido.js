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
exports.Detallepedido = void 0;
const typeorm_1 = require("typeorm");
const Producto_1 = require("./Producto");
const Promocion_1 = require("./Promocion");
const Pedido_1 = require("./Pedido");
const ProductoMedida_1 = require("./ProductoMedida");
let Detallepedido = class Detallepedido extends typeorm_1.BaseEntity {
};
exports.Detallepedido = Detallepedido;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'iddetallepedido', type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Detallepedido.prototype, "IdDetallePedido", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "cantidad", type: "integer" }),
    __metadata("design:type", Number)
], Detallepedido.prototype, "Cantidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "cantidad_devuelta", type: "integer", default: 0 }),
    __metadata("design:type", Number)
], Detallepedido.prototype, "CantidadDevuelta", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "precio", type: "numeric", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Detallepedido.prototype, "Precio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "subtotal", type: "numeric", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Detallepedido.prototype, "Subtotal", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Pedido_1.Pedido, (venta) => venta.Detallepedido),
    (0, typeorm_1.JoinColumn)({ name: "idpedido" }),
    __metadata("design:type", Pedido_1.Pedido)
], Detallepedido.prototype, "Pedido", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Producto_1.Producto, (producto) => producto.Detallepedido, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idproducto" }),
    __metadata("design:type", Producto_1.Producto)
], Detallepedido.prototype, "Producto", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ProductoMedida_1.Productomedida, (producto) => producto.Detallepedido, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idproductomedida" }),
    __metadata("design:type", ProductoMedida_1.Productomedida)
], Detallepedido.prototype, "Productomedida", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Promocion_1.Promocion, (promocion) => promocion.Detallepedido, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idpromocion" }),
    __metadata("design:type", Promocion_1.Promocion)
], Detallepedido.prototype, "Promocion", void 0);
exports.Detallepedido = Detallepedido = __decorate([
    (0, typeorm_1.Entity)()
], Detallepedido);
