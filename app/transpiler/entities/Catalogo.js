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
exports.Catalogo = void 0;
const typeorm_1 = require("typeorm");
const Producto_1 = require("./Producto");
let Catalogo = class Catalogo extends typeorm_1.BaseEntity {
};
exports.Catalogo = Catalogo;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Catalogo.prototype, "Id_Catalogo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer" }),
    __metadata("design:type", Number)
], Catalogo.prototype, "Producto_Id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 50 }),
    __metadata("design:type", String)
], Catalogo.prototype, "NombreCatalogo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer" }),
    __metadata("design:type", Number)
], Catalogo.prototype, "CantidadVenta", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Catalogo.prototype, "PrecioVenta", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", Date)
], Catalogo.prototype, "Fecha", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255 }),
    __metadata("design:type", String)
], Catalogo.prototype, "Descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer" }),
    __metadata("design:type", Number)
], Catalogo.prototype, "Estado", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Producto_1.Producto, (producto) => producto.catalogo),
    (0, typeorm_1.JoinColumn)({ name: "Id_Producto" }),
    __metadata("design:type", Producto_1.Producto)
], Catalogo.prototype, "producto", void 0);
exports.Catalogo = Catalogo = __decorate([
    (0, typeorm_1.Entity)()
], Catalogo);
