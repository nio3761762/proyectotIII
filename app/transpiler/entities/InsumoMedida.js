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
exports.Insumomedida = void 0;
const typeorm_1 = require("typeorm");
const UnidadMedida_1 = require("./UnidadMedida");
const DetalleCompra_1 = require("./DetalleCompra");
const Insumo_1 = require("./Insumo");
const DetalleTransferencia_1 = require("./DetalleTransferencia");
let Insumomedida = class Insumomedida extends typeorm_1.BaseEntity {
};
exports.Insumomedida = Insumomedida;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "idinsumomedida", type: "varchar", length: 50 }),
    __metadata("design:type", String)
], Insumomedida.prototype, "IdinsumoMedida", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fecharegistro", type: "date" }),
    __metadata("design:type", Date)
], Insumomedida.prototype, "FechaRegistro", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fechaactualizacion", type: "date", nullable: true }),
    __metadata("design:type", Date)
], Insumomedida.prototype, "FechaActualizacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "cantidad", type: "integer", default: 1 }),
    __metadata("design:type", Number)
], Insumomedida.prototype, "Cantidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "estado", type: "integer", default: 1 }),
    __metadata("design:type", Number)
], Insumomedida.prototype, "Estado", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Insumo_1.Insumo, (Producto) => Producto.Insumomedida),
    (0, typeorm_1.JoinColumn)({ name: "idinsumo" }),
    __metadata("design:type", Insumo_1.Insumo)
], Insumomedida.prototype, "Insumo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => UnidadMedida_1.Unidadmedida, (unidadmedida) => unidadmedida.Insumomedida),
    (0, typeorm_1.JoinColumn)({ name: "idunidadmedida" }),
    __metadata("design:type", UnidadMedida_1.Unidadmedida)
], Insumomedida.prototype, "Unidadmedida", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => DetalleCompra_1.Detallecompra, (compra) => compra.Insumomedida),
    __metadata("design:type", Array)
], Insumomedida.prototype, "Detallecompra", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => DetalleTransferencia_1.DetalleTransferencia, (comision) => comision.Insumomedida),
    __metadata("design:type", Array)
], Insumomedida.prototype, "DetalleTransferencia", void 0);
exports.Insumomedida = Insumomedida = __decorate([
    (0, typeorm_1.Entity)()
], Insumomedida);
