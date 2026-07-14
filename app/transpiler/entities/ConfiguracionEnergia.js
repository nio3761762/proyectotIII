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
exports.ConfiguracionEnergia = void 0;
const typeorm_1 = require("typeorm");
const Insumo_1 = require("./Insumo");
let ConfiguracionEnergia = class ConfiguracionEnergia extends typeorm_1.BaseEntity {
};
exports.ConfiguracionEnergia = ConfiguracionEnergia;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "idconfig", type: "varchar", length: 100 }),
    __metadata("design:type", String)
], ConfiguracionEnergia.prototype, "IdConfig", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "tipoenergia", type: "varchar", length: 30 }),
    __metadata("design:type", String)
], ConfiguracionEnergia.prototype, "TipoEnergia", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Insumo_1.Insumo, (i) => i.Configuracionenergia, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idinsumo" }),
    __metadata("design:type", Insumo_1.Insumo)
], ConfiguracionEnergia.prototype, "Insumo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "estado", type: "integer", default: 1 }),
    __metadata("design:type", Number)
], ConfiguracionEnergia.prototype, "Estado", void 0);
exports.ConfiguracionEnergia = ConfiguracionEnergia = __decorate([
    (0, typeorm_1.Entity)()
], ConfiguracionEnergia);
