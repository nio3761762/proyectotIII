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
exports.EmpleadoCargo = void 0;
const typeorm_1 = require("typeorm");
const Empleado_1 = require("./Empleado");
const Cargo_1 = require("./Cargo");
let EmpleadoCargo = class EmpleadoCargo extends typeorm_1.BaseEntity {
};
exports.EmpleadoCargo = EmpleadoCargo;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "idempleadocargo", type: "varchar", length: 150 }),
    __metadata("design:type", String)
], EmpleadoCargo.prototype, "IdEmpleadoCargo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Empleado_1.Empleado, (empleado) => empleado.EmpleadoCargos),
    (0, typeorm_1.JoinColumn)({ name: "idempleado" }),
    __metadata("design:type", Empleado_1.Empleado)
], EmpleadoCargo.prototype, "Empleado", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Cargo_1.Cargo, (cargo) => cargo.EmpleadoCargos),
    (0, typeorm_1.JoinColumn)({ name: "idcargo" }),
    __metadata("design:type", Cargo_1.Cargo)
], EmpleadoCargo.prototype, "Cargo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fechainicio", type: "date" }),
    __metadata("design:type", Date)
], EmpleadoCargo.prototype, "FechaInicio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fechafin", type: "date", nullable: true }),
    __metadata("design:type", Date)
], EmpleadoCargo.prototype, "FechaFin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "estado", type: "integer", default: 1 }),
    __metadata("design:type", Number)
], EmpleadoCargo.prototype, "Estado", void 0);
exports.EmpleadoCargo = EmpleadoCargo = __decorate([
    (0, typeorm_1.Entity)()
], EmpleadoCargo);
