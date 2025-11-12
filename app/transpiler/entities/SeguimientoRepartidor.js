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
exports.SeguimientoEntrega = void 0;
const typeorm_1 = require("typeorm");
const Entrega_1 = require("./Entrega");
let SeguimientoEntrega = class SeguimientoEntrega extends typeorm_1.BaseEntity {
};
exports.SeguimientoEntrega = SeguimientoEntrega;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "idseguimiento", type: "varchar", length: 100 }),
    __metadata("design:type", String)
], SeguimientoEntrega.prototype, "IdSeguimiento", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Entrega_1.Entrega, (entrega) => entrega.Seguimiento),
    (0, typeorm_1.JoinColumn)({ name: "identrega" }),
    __metadata("design:type", Entrega_1.Entrega)
], SeguimientoEntrega.prototype, "Entrega", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "latitud", type: "decimal", precision: 10, scale: 8 }),
    __metadata("design:type", Number)
], SeguimientoEntrega.prototype, "Latitud", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "longitud", type: "decimal", precision: 11, scale: 8 }),
    __metadata("design:type", Number)
], SeguimientoEntrega.prototype, "Longitud", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "fecha_hora_ubicacion", type: "timestamp" }),
    __metadata("design:type", Date)
], SeguimientoEntrega.prototype, "FechaHoraUbicacion", void 0);
exports.SeguimientoEntrega = SeguimientoEntrega = __decorate([
    (0, typeorm_1.Entity)()
], SeguimientoEntrega);
