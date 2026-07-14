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
exports.Categoria = void 0;
const typeorm_1 = require("typeorm");
const SubCategoria_1 = require("./SubCategoria");
let Categoria = class Categoria extends typeorm_1.BaseEntity {
};
exports.Categoria = Categoria;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'idcategoria', type: "varchar", length: 50 }),
    __metadata("design:type", String)
], Categoria.prototype, "IdCategoria", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre', type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Categoria.prototype, "Nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fecharegistro", type: "date" }),
    __metadata("design:type", Date)
], Categoria.prototype, "FechaRegistro", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fechaactualizacion", type: "date", nullable: true }),
    __metadata("design:type", Date)
], Categoria.prototype, "FechaActualizacion", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => SubCategoria_1.Subcategoria, (subcategoria) => subcategoria.Categoria),
    __metadata("design:type", Array)
], Categoria.prototype, "Subcategoria", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "imagen", type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", String)
], Categoria.prototype, "Imagen", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "estado", type: "integer", default: 1 }),
    __metadata("design:type", Number)
], Categoria.prototype, "Estado", void 0);
exports.Categoria = Categoria = __decorate([
    (0, typeorm_1.Entity)()
], Categoria);
