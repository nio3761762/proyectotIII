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
exports.Receta = void 0;
const typeorm_1 = require("typeorm");
const Producto_1 = require("./Producto");
const Ingrediente_1 = require("./Ingrediente");
let Receta = class Receta extends typeorm_1.BaseEntity {
};
exports.Receta = Receta;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'idreceta', type: 'varchar', length: 150 }),
    __metadata("design:type", String)
], Receta.prototype, "IdReceta", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Producto_1.Producto, (p) => p.Receta),
    (0, typeorm_1.JoinColumn)({ name: 'idproducto' }),
    __metadata("design:type", Producto_1.Producto)
], Receta.prototype, "Producto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rendimiento', type: "numeric" }),
    __metadata("design:type", Number)
], Receta.prototype, "Rendimiento", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tiempohorneado', type: "numeric" }),
    __metadata("design:type", Number)
], Receta.prototype, "TiempoHorneadoMin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cantidadporlata', type: "numeric" }),
    __metadata("design:type", Number)
], Receta.prototype, "CantidadPorLata", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Ingrediente_1.Ingrediente, d => d.Receta),
    __metadata("design:type", Array)
], Receta.prototype, "Ingredientes", void 0);
exports.Receta = Receta = __decorate([
    (0, typeorm_1.Entity)()
], Receta);
