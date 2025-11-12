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
exports.Horario = void 0;
const typeorm_1 = require("typeorm");
const Sucursal_1 = require("./Sucursal");
let Horario = class Horario extends typeorm_1.BaseEntity {
};
exports.Horario = Horario;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "idhorario", type: "varchar", length: 150 }),
    __metadata("design:type", String)
], Horario.prototype, "IdHorario", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "horaentrada", type: "time" }),
    __metadata("design:type", String)
], Horario.prototype, "HoraEntrada", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "horasalida", type: "time" }),
    __metadata("design:type", String)
], Horario.prototype, "HoraSalida", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Sucursal_1.Sucursal, (sucursal) => sucursal.Horario),
    __metadata("design:type", Array)
], Horario.prototype, "Sucursal", void 0);
exports.Horario = Horario = __decorate([
    (0, typeorm_1.Entity)()
], Horario);
