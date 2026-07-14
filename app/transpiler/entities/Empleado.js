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
exports.Empleado = void 0;
const typeorm_1 = require("typeorm");
const Persona_1 = require("./Persona");
const EmpleadoSucursal_1 = require("./EmpleadoSucursal");
const Salario_1 = require("./Salario");
const EmpleadoCargo_1 = require("./EmpleadoCargo");
const Transferencia_1 = require("./Transferencia");
const ProduccionEmpleado_1 = require("./ProduccionEmpleado");
let Empleado = class Empleado extends typeorm_1.BaseEntity {
};
exports.Empleado = Empleado;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "idempleado", type: "varchar", length: 150 }),
    __metadata("design:type", String)
], Empleado.prototype, "IdEmpleado", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Persona_1.Persona, (persona) => persona.Empleado),
    (0, typeorm_1.JoinColumn)({ name: "idpersona" }),
    __metadata("design:type", Persona_1.Persona)
], Empleado.prototype, "Persona", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => EmpleadoCargo_1.EmpleadoCargo, (ec) => ec.Empleado),
    __metadata("design:type", Array)
], Empleado.prototype, "EmpleadoCargos", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fechaingreso", type: "date" }),
    __metadata("design:type", Date)
], Empleado.prototype, "FechaIngreso", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "Fechasalida", type: "date", nullable: true }),
    __metadata("design:type", Date)
], Empleado.prototype, "FechaSalida", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "estado", type: "integer", default: 1 }),
    __metadata("design:type", Number)
], Empleado.prototype, "Estado", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => EmpleadoSucursal_1.EmpleadoSucursal, (es) => es.Empleado),
    __metadata("design:type", Array)
], Empleado.prototype, "EmpleadoSucursales", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ProduccionEmpleado_1.ProduccionEmpleado, (es) => es.Empleado),
    __metadata("design:type", Array)
], Empleado.prototype, "Produccion", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Transferencia_1.Transferencia, (es) => es.EmpleadoDestino),
    __metadata("design:type", Array)
], Empleado.prototype, "Transferencia", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Salario_1.Salario, (salario) => salario.Empleado),
    __metadata("design:type", Array)
], Empleado.prototype, "Salarios", void 0);
exports.Empleado = Empleado = __decorate([
    (0, typeorm_1.Entity)()
], Empleado);
