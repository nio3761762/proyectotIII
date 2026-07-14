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
exports.Gasto = void 0;
const typeorm_1 = require("typeorm");
const Sucursal_1 = require("./Sucursal");
let Gasto = class Gasto extends typeorm_1.BaseEntity {
};
exports.Gasto = Gasto;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "idgasto", type: "varchar", length: 50 }),
    __metadata("design:type", String)
], Gasto.prototype, "IdGasto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "servicio", type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Gasto.prototype, "Servicio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "tipo", type: "varchar", length: 50 }),
    __metadata("design:type", String)
], Gasto.prototype, "Tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "monto", type: "numeric", precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], Gasto.prototype, "Monto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "consumo", type: "numeric", precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Gasto.prototype, "Consumo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fecha", type: "date" }),
    __metadata("design:type", Date)
], Gasto.prototype, "Fecha", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "periodo", type: "varchar", length: 7 }),
    __metadata("design:type", String)
], Gasto.prototype, "Periodo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Sucursal_1.Sucursal, (s) => s.Gasto),
    (0, typeorm_1.JoinColumn)({ name: "idsucursal" }),
    __metadata("design:type", Sucursal_1.Sucursal)
], Gasto.prototype, "Sucursal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "estado", type: "integer", default: 1 }),
    __metadata("design:type", Number)
], Gasto.prototype, "Estado", void 0);
exports.Gasto = Gasto = __decorate([
    (0, typeorm_1.Entity)()
], Gasto);
