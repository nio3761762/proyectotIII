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
exports.Categoriamedida = void 0;
const typeorm_1 = require("typeorm");
const Estado_1 = require("./Estado");
const UnidadMedida_1 = require("./UnidadMedida");
let Categoriamedida = class Categoriamedida extends typeorm_1.BaseEntity {
};
exports.Categoriamedida = Categoriamedida;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'idcategoriamedida', type: "varchar", length: 50 }),
    __metadata("design:type", String)
], Categoriamedida.prototype, "IdCategoriaMedida", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre', type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Categoriamedida.prototype, "Nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fecharegistro", type: "date", nullable: true }),
    __metadata("design:type", Date)
], Categoriamedida.prototype, "FechaRegistro", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fechaactualizacion", type: "date", nullable: true }),
    __metadata("design:type", Date)
], Categoriamedida.prototype, "FechaActualizacion", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => UnidadMedida_1.Unidadmedida, (medida) => medida.Categoria),
    __metadata("design:type", Array)
], Categoriamedida.prototype, "Unidadmedida", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Estado_1.Estado, (estado) => estado.Categoriamedida),
    (0, typeorm_1.JoinColumn)({ name: "idestado" }),
    __metadata("design:type", Estado_1.Estado)
], Categoriamedida.prototype, "Estado", void 0);
exports.Categoriamedida = Categoriamedida = __decorate([
    (0, typeorm_1.Entity)()
], Categoriamedida);
