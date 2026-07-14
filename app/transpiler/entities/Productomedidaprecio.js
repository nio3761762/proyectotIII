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
exports.Productomedidaprecio = void 0;
const typeorm_1 = require("typeorm");
const ProductoMedida_1 = require("./ProductoMedida");
let Productomedidaprecio = class Productomedidaprecio extends typeorm_1.BaseEntity {
};
exports.Productomedidaprecio = Productomedidaprecio;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "idproductomedidaprecio", type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Productomedidaprecio.prototype, "IdProductoMedidaPrecio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "cantidadminima", type: "integer" }),
    __metadata("design:type", Number)
], Productomedidaprecio.prototype, "CantidadMinima", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "precio", type: "numeric", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Productomedidaprecio.prototype, "Precio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "estado", type: "integer", default: 1 }),
    __metadata("design:type", Number)
], Productomedidaprecio.prototype, "Estado", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ProductoMedida_1.Productomedida, (pm) => pm.Productomedidaprecio),
    (0, typeorm_1.JoinColumn)({ name: "idproductomedida" }),
    __metadata("design:type", ProductoMedida_1.Productomedida)
], Productomedidaprecio.prototype, "ProductoMedida", void 0);
exports.Productomedidaprecio = Productomedidaprecio = __decorate([
    (0, typeorm_1.Entity)()
], Productomedidaprecio);
