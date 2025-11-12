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
exports.Horarios = void 0;
const typeorm_1 = require("typeorm");
const Rutas_1 = require("./Rutas");
const Buses_1 = require("./Buses");
const Reservas_1 = require("./Reservas");
let Horarios = class Horarios extends typeorm_1.BaseEntity {
};
exports.Horarios = Horarios;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    (0, typeorm_1.PrimaryColumn)({ type: "integer" }),
    __metadata("design:type", Number)
], Horarios.prototype, "HorarioID", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Rutas_1.Rutas, ruta => ruta.horarios),
    (0, typeorm_1.JoinColumn)({ name: "RutaID" }),
    __metadata("design:type", Rutas_1.Rutas)
], Horarios.prototype, "Ruta", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Buses_1.Buses, bus => bus.horarios),
    (0, typeorm_1.JoinColumn)({ name: "BusID" }),
    __metadata("design:type", Buses_1.Buses)
], Horarios.prototype, "Bus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", String)
], Horarios.prototype, "FechaSalida", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "time" }),
    __metadata("design:type", String)
], Horarios.prototype, "HoraSalida", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", String)
], Horarios.prototype, "FechaLlegada", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer" }),
    __metadata("design:type", Number)
], Horarios.prototype, "Precio", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Reservas_1.Reservas, reserva => reserva.Horario),
    __metadata("design:type", Array)
], Horarios.prototype, "reservas", void 0);
exports.Horarios = Horarios = __decorate([
    (0, typeorm_1.Entity)()
], Horarios);
