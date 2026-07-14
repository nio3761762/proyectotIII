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
exports.HornoEnergia = void 0;
const typeorm_1 = require("typeorm");
const Horno_1 = require("./Horno");
let HornoEnergia = class HornoEnergia extends typeorm_1.BaseEntity {
};
exports.HornoEnergia = HornoEnergia;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'idhornoenergia', type: 'varchar', length: 150 }),
    __metadata("design:type", String)
], HornoEnergia.prototype, "IdHornoEnergia", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Horno_1.Horno, (h) => h.Energias),
    (0, typeorm_1.JoinColumn)({ name: 'idhorno' }),
    __metadata("design:type", Horno_1.Horno)
], HornoEnergia.prototype, "Horno", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tipoenergia', type: 'varchar', length: 150 }),
    __metadata("design:type", String)
], HornoEnergia.prototype, "TipoEnergia", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'consumoporhora', type: "numeric" }),
    __metadata("design:type", Number)
], HornoEnergia.prototype, "ConsumoPorHora", void 0);
exports.HornoEnergia = HornoEnergia = __decorate([
    (0, typeorm_1.Entity)()
], HornoEnergia);
