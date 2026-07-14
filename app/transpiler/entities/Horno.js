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
exports.Horno = void 0;
const typeorm_1 = require("typeorm");
const Sucursal_1 = require("./Sucursal");
const HornoEnergia_1 = require("./HornoEnergia");
const Produccionhornodetalle_1 = require("./Produccionhornodetalle");
let Horno = class Horno extends typeorm_1.BaseEntity {
};
exports.Horno = Horno;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'idhorno', type: 'varchar', length: 150 }),
    __metadata("design:type", String)
], Horno.prototype, "IdHorno", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre', type: 'varchar', length: 150 }),
    __metadata("design:type", String)
], Horno.prototype, "Nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "imagen", type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", String)
], Horno.prototype, "Imagen", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "estado", type: "integer", default: 1 }),
    __metadata("design:type", Number)
], Horno.prototype, "Estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "cantidadlata", type: "integer", default: 1 }),
    __metadata("design:type", Number)
], Horno.prototype, "Cantidadlata", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Sucursal_1.Sucursal, (s) => s.Hornos),
    (0, typeorm_1.JoinColumn)({ name: 'idsucursal' }),
    __metadata("design:type", Sucursal_1.Sucursal)
], Horno.prototype, "Sucursal", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => HornoEnergia_1.HornoEnergia, he => he.Horno),
    __metadata("design:type", Array)
], Horno.prototype, "Energias", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Produccionhornodetalle_1.ProduccionHornoDetalle, he => he.Horno),
    __metadata("design:type", Array)
], Horno.prototype, "Detalle", void 0);
exports.Horno = Horno = __decorate([
    (0, typeorm_1.Entity)()
], Horno);
