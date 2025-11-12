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
exports.Subcategoria = void 0;
const typeorm_1 = require("typeorm");
const Producto_1 = require("./Producto");
const Categoria_1 = require("./Categoria");
const Estado_1 = require("./Estado");
let Subcategoria = class Subcategoria extends typeorm_1.BaseEntity {
};
exports.Subcategoria = Subcategoria;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'idsubcategoria', type: "varchar", length: 50 }),
    __metadata("design:type", String)
], Subcategoria.prototype, "IdSubCategoria", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre', type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Subcategoria.prototype, "Nombre", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Producto_1.Producto, (producto) => producto.Subcategoria),
    __metadata("design:type", Array)
], Subcategoria.prototype, "Producto", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Categoria_1.Categoria, (categoria) => categoria.Subcategoria),
    (0, typeorm_1.JoinColumn)({ name: "idcategoria" }),
    __metadata("design:type", Categoria_1.Categoria)
], Subcategoria.prototype, "Categoria", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Estado_1.Estado, (estado) => estado.Subcategoria),
    (0, typeorm_1.JoinColumn)({ name: "idestado" }),
    __metadata("design:type", Estado_1.Estado)
], Subcategoria.prototype, "Estado", void 0);
exports.Subcategoria = Subcategoria = __decorate([
    (0, typeorm_1.Entity)()
], Subcategoria);
