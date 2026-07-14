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
exports.EmpleadoSucursal = void 0;
const typeorm_1 = require("typeorm");
const Empleado_1 = require("./Empleado");
const Sucursal_1 = require("./Sucursal");
let EmpleadoSucursal = class EmpleadoSucursal extends typeorm_1.BaseEntity {
};
exports.EmpleadoSucursal = EmpleadoSucursal;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "idempleadosucursal", type: "varchar", length: 150 }),
    __metadata("design:type", String)
], EmpleadoSucursal.prototype, "IdEmpleadoSucursal", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Empleado_1.Empleado, (empleado) => empleado.EmpleadoSucursales),
    (0, typeorm_1.JoinColumn)({ name: "idempleado" }),
    __metadata("design:type", Empleado_1.Empleado)
], EmpleadoSucursal.prototype, "Empleado", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Sucursal_1.Sucursal, (sucursal) => sucursal.EmpleadoSucursales),
    (0, typeorm_1.JoinColumn)({ name: "idsucursal" }),
    __metadata("design:type", Sucursal_1.Sucursal)
], EmpleadoSucursal.prototype, "Sucursal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fechainicio", type: "date" }),
    __metadata("design:type", Date)
], EmpleadoSucursal.prototype, "FechaInicio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fechafin", type: "date", nullable: true }),
    __metadata("design:type", Date)
], EmpleadoSucursal.prototype, "FechaFin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "estado", type: "integer", default: 1 }),
    __metadata("design:type", Number)
], EmpleadoSucursal.prototype, "Estado", void 0);
exports.EmpleadoSucursal = EmpleadoSucursal = __decorate([
    (0, typeorm_1.Entity)()
], EmpleadoSucursal);
