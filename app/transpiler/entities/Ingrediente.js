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
const UnidadMedida_1 = require("./UnidadMedida");
const Insumo_1 = require("./Insumo");
const Receta_1 = require("./Receta");
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
    (0, typeorm_1.Column)({ name: 'pesoconvertido', type: "numeric", precision: 12, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], Ingrediente.prototype, "Pesoconvertido", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Insumo_1.Insumo, (producto) => producto.Ingrediente, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idinsumo" }),
    __metadata("design:type", Insumo_1.Insumo)
], Ingrediente.prototype, "Insumo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Receta_1.Receta, (ingrediente) => ingrediente.Ingredientes),
    (0, typeorm_1.JoinColumn)({ name: 'idreceta' }),
    __metadata("design:type", Receta_1.Receta)
], Ingrediente.prototype, "Receta", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => UnidadMedida_1.Unidadmedida, (unidadmedida) => unidadmedida.Ingrediente),
    (0, typeorm_1.JoinColumn)({ name: "idunidadmedida" }),
    __metadata("design:type", UnidadMedida_1.Unidadmedida)
], Ingrediente.prototype, "Unidadmedida", void 0);
exports.Ingrediente = Ingrediente = __decorate([
    (0, typeorm_1.Entity)()
], Ingrediente);
