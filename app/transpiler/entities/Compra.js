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
exports.Compra = void 0;
const typeorm_1 = require("typeorm");
const Comprobante_1 = require("./Comprobante");
const Proveedor_1 = require("./Proveedor");
const DetalleCompra_1 = require("./DetalleCompra");
let Compra = class Compra extends typeorm_1.BaseEntity {
};
exports.Compra = Compra;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'idcompra', type: "varchar", length: 50 }),
    __metadata("design:type", String)
], Compra.prototype, "IdCompra", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "nrocomprobante", type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Compra.prototype, "NroComprobante", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "preciototal", type: "numeric", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Compra.prototype, "PrecioTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fechacompra", type: "date" }),
    __metadata("design:type", Date)
], Compra.prototype, "FechaCompra", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'descripcion', type: "text", nullable: true }),
    __metadata("design:type", String)
], Compra.prototype, "Descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "horacompra", type: "time", nullable: true }),
    __metadata("design:type", String)
], Compra.prototype, "HoraCompra", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Comprobante_1.Comprobante, (comprobante) => comprobante.Compra, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idcomprobante" }),
    __metadata("design:type", Comprobante_1.Comprobante)
], Compra.prototype, "Comprobante", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Proveedor_1.Proveedor, (proveedor) => proveedor.Compra, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idproveedor" }),
    __metadata("design:type", Proveedor_1.Proveedor)
], Compra.prototype, "Proveedor", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => DetalleCompra_1.Detallecompra, (detallecompra) => detallecompra.Compra),
    __metadata("design:type", Array)
], Compra.prototype, "Detallecompra", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "estado", type: "integer", default: 1 }),
    __metadata("design:type", Number)
], Compra.prototype, "Estado", void 0);
exports.Compra = Compra = __decorate([
    (0, typeorm_1.Entity)()
], Compra);
