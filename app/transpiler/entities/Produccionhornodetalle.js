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
exports.ProduccionHornoDetalle = void 0;
const typeorm_1 = require("typeorm");
const Horno_1 = require("./Horno");
const Produccion_1 = require("./Produccion");
const HornoProduccto_1 = require("./HornoProduccto");
let ProduccionHornoDetalle = class ProduccionHornoDetalle extends typeorm_1.BaseEntity {
};
exports.ProduccionHornoDetalle = ProduccionHornoDetalle;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "idproduccionhornodetalle", type: "varchar", length: 150 }),
    __metadata("design:type", String)
], ProduccionHornoDetalle.prototype, "IdProduccionHornoDetalle", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Produccion_1.Produccion, (p) => p.DetalleHorno),
    (0, typeorm_1.JoinColumn)({ name: "idproduccion" }),
    __metadata("design:type", Produccion_1.Produccion)
], ProduccionHornoDetalle.prototype, "Produccion", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Horno_1.Horno, (h) => h.Detalle),
    (0, typeorm_1.JoinColumn)({ name: "idhorno" }),
    __metadata("design:type", Horno_1.Horno)
], ProduccionHornoDetalle.prototype, "Horno", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => HornoProduccto_1.Hornoproducto, he => he.ProduccionHornoDetalle),
    __metadata("design:type", Array)
], ProduccionHornoDetalle.prototype, "Hornoproducto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "tipoenergia", type: "varchar", length: 30 }),
    __metadata("design:type", String)
], ProduccionHornoDetalle.prototype, "TipoEnergia", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fecha", type: "date" }),
    __metadata("design:type", Date)
], ProduccionHornoDetalle.prototype, "Fecha", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "horainicio", type: "time" }),
    __metadata("design:type", String)
], ProduccionHornoDetalle.prototype, "HoraInicio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "horafin", type: "time", nullable: true }),
    __metadata("design:type", String)
], ProduccionHornoDetalle.prototype, "HoraFin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "horas", type: "numeric", precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], ProduccionHornoDetalle.prototype, "Horas", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "consumo", type: "numeric", precision: 12, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], ProduccionHornoDetalle.prototype, "Consumo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "costo", type: "numeric", precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ProduccionHornoDetalle.prototype, "Costo", void 0);
exports.ProduccionHornoDetalle = ProduccionHornoDetalle = __decorate([
    (0, typeorm_1.Entity)()
], ProduccionHornoDetalle);
