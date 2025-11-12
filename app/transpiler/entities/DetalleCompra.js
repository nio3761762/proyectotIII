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
exports.Detallecompra = void 0;
const typeorm_1 = require("typeorm");
const Compra_1 = require("./Compra");
const ProductoMedida_1 = require("./ProductoMedida");
let Detallecompra = class Detallecompra extends typeorm_1.BaseEntity {
};
exports.Detallecompra = Detallecompra;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'iddetallecompra', type: "varchar", length: 50 }),
    __metadata("design:type", String)
], Detallecompra.prototype, "IdDetalleCompra", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'descripcion', type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", String)
], Detallecompra.prototype, "Descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "cantidad", type: "integer" }),
    __metadata("design:type", Number)
], Detallecompra.prototype, "Cantidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "precio", type: "numeric", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Detallecompra.prototype, "Precio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fechavencimiento", type: "date" }),
    __metadata("design:type", Date)
], Detallecompra.prototype, "FechaVencimineto", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ProductoMedida_1.Productomedida, (comprobante) => comprobante.Detallecompra, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idmedida" }),
    __metadata("design:type", ProductoMedida_1.Productomedida)
], Detallecompra.prototype, "Productomedida", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Compra_1.Compra, (compra) => compra.Detallecompra),
    (0, typeorm_1.JoinColumn)({ name: "idcompra" }),
    __metadata("design:type", Compra_1.Compra)
], Detallecompra.prototype, "Compra", void 0);
exports.Detallecompra = Detallecompra = __decorate([
    (0, typeorm_1.Entity)()
    //@Check(`"Estado" IN (0, 1)`)
], Detallecompra);
