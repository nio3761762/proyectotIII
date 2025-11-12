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
exports.Ingrediente = void 0;
const typeorm_1 = require("typeorm");
const Producto_1 = require("./Producto");
const UnidadMedida_1 = require("./UnidadMedida");
let Ingrediente = class Ingrediente extends typeorm_1.BaseEntity {
};
exports.Ingrediente = Ingrediente;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'idingrediente', type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Ingrediente.prototype, "IdIngrediente", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'peso', type: "numeric", precision: 10, scale: 3 }),
    __metadata("design:type", Number)
], Ingrediente.prototype, "Peso", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Producto_1.Producto, (producto) => producto.Ingrediente),
    (0, typeorm_1.JoinColumn)({ name: "idproductoingrediente" }),
    __metadata("design:type", Producto_1.Producto)
], Ingrediente.prototype, "Ingredientes", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Producto_1.Producto, (producto) => producto.Producto),
    (0, typeorm_1.JoinColumn)({ name: "idproducto" }),
    __metadata("design:type", Producto_1.Producto)
], Ingrediente.prototype, "Producto", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => UnidadMedida_1.Unidadmedida, (unidadmedida) => unidadmedida.Ingrediente),
    (0, typeorm_1.JoinColumn)({ name: "idunidadmedida" }),
    __metadata("design:type", UnidadMedida_1.Unidadmedida)
], Ingrediente.prototype, "Unidadmedida", void 0);
exports.Ingrediente = Ingrediente = __decorate([
    (0, typeorm_1.Entity)()
    //@Check(`"Estado" IN (0, 1)`)
], Ingrediente);
