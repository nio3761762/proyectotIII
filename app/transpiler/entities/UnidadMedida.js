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
exports.Unidadmedida = void 0;
const typeorm_1 = require("typeorm");
const Ingrediente_1 = require("./Ingrediente");
const CategoriaMedida_1 = require("./CategoriaMedida");
const InsumoMedida_1 = require("./InsumoMedida");
let Unidadmedida = class Unidadmedida extends typeorm_1.BaseEntity {
};
exports.Unidadmedida = Unidadmedida;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'idunidadmedida', type: 'integer' }),
    __metadata("design:type", Number)
], Unidadmedida.prototype, "IdUnidadMedida", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre', type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Unidadmedida.prototype, "Nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'abreviatura', type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Unidadmedida.prototype, "Abreviatura", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cantidad', type: 'numeric', precision: 10, scale: 3 }),
    __metadata("design:type", Number)
], Unidadmedida.prototype, "Cantidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecharegistro', type: 'date' }),
    __metadata("design:type", Date)
], Unidadmedida.prototype, "FechaRegistro", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "estado", type: "integer", default: 1 }),
    __metadata("design:type", Number)
], Unidadmedida.prototype, "Estado", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CategoriaMedida_1.Categoriamedida, (estado) => estado.Unidadmedida, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idcategoriamedida' }),
    __metadata("design:type", CategoriaMedida_1.Categoriamedida)
], Unidadmedida.prototype, "Categoria", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Ingrediente_1.Ingrediente, (ingrediente) => ingrediente.Unidadmedida),
    __metadata("design:type", Array)
], Unidadmedida.prototype, "Ingrediente", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => InsumoMedida_1.Insumomedida, (productomedida) => productomedida.Unidadmedida),
    __metadata("design:type", Array)
], Unidadmedida.prototype, "Insumomedida", void 0);
exports.Unidadmedida = Unidadmedida = __decorate([
    (0, typeorm_1.Entity)()
], Unidadmedida);
