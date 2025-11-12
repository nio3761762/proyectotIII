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
exports.ProductoCarrito = void 0;
const typeorm_1 = require("typeorm");
const CarritodeCompras_1 = require("./CarritodeCompras");
const Producto_1 = require("./Producto");
let ProductoCarrito = class ProductoCarrito extends typeorm_1.BaseEntity {
};
exports.ProductoCarrito = ProductoCarrito;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: "integer" }),
    __metadata("design:type", Number)
], ProductoCarrito.prototype, "Id_Carrito", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: "integer" }),
    __metadata("design:type", Number)
], ProductoCarrito.prototype, "Producto_Id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer" }),
    __metadata("design:type", Number)
], ProductoCarrito.prototype, "Cantidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], ProductoCarrito.prototype, "PrecioTotal", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CarritodeCompras_1.CarritoDeCompras, (carritoDeCompras) => carritoDeCompras.carritoc),
    (0, typeorm_1.JoinColumn)({ name: "Id_Carrito" }),
    __metadata("design:type", CarritodeCompras_1.CarritoDeCompras)
], ProductoCarrito.prototype, "carrito", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Producto_1.Producto, (producto) => producto.carrito),
    (0, typeorm_1.JoinColumn)({ name: "Producto_Id" }),
    __metadata("design:type", Producto_1.Producto)
], ProductoCarrito.prototype, "producto", void 0);
exports.ProductoCarrito = ProductoCarrito = __decorate([
    (0, typeorm_1.Entity)()
], ProductoCarrito);
