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
exports.PedidoProducto = void 0;
const typeorm_1 = require("typeorm");
const Pedido_1 = require("./Pedido");
const Producto_1 = require("./Producto");
let PedidoProducto = class PedidoProducto extends typeorm_1.BaseEntity {
};
exports.PedidoProducto = PedidoProducto;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: "integer" }),
    __metadata("design:type", Number)
], PedidoProducto.prototype, "Id_Pedido", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: "integer" }),
    __metadata("design:type", Number)
], PedidoProducto.prototype, "Id_Producto", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer" }),
    __metadata("design:type", Number)
], PedidoProducto.prototype, "Cantidad", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Pedido_1.Pedido, (pedido) => pedido.pedidoproducto),
    (0, typeorm_1.JoinColumn)({ name: "Id_Pedido" }),
    __metadata("design:type", Pedido_1.Pedido)
], PedidoProducto.prototype, "pedido", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Producto_1.Producto, (producto) => producto.pedidoproducto),
    (0, typeorm_1.JoinColumn)({ name: "Id_Producto" }),
    __metadata("design:type", Producto_1.Producto)
], PedidoProducto.prototype, "producto", void 0);
exports.PedidoProducto = PedidoProducto = __decorate([
    (0, typeorm_1.Entity)()
], PedidoProducto);
