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
exports.Reservas = void 0;
const typeorm_1 = require("typeorm");
const Users_1 = require("./Users");
const Horarios_1 = require("./Horarios");
let Reservas = class Reservas extends typeorm_1.BaseEntity {
};
exports.Reservas = Reservas;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Reservas.prototype, "ReservaID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", String)
], Reservas.prototype, "FechaReserva", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer" }),
    __metadata("design:type", Number)
], Reservas.prototype, "Asientos", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 1 }),
    __metadata("design:type", String)
], Reservas.prototype, "Estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer" }),
    __metadata("design:type", Number)
], Reservas.prototype, "RAsientos", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer" }),
    __metadata("design:type", Number)
], Reservas.prototype, "PrecioTotal", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Users_1.Users, user => user.reservas),
    (0, typeorm_1.JoinColumn)({ name: "UsuarioID" }),
    __metadata("design:type", Users_1.Users)
], Reservas.prototype, "Usuario", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Horarios_1.Horarios, horario => horario.reservas),
    (0, typeorm_1.JoinColumn)({ name: "HorarioID" }),
    __metadata("design:type", Horarios_1.Horarios)
], Reservas.prototype, "Horario", void 0);
exports.Reservas = Reservas = __decorate([
    (0, typeorm_1.Entity)()
], Reservas);
