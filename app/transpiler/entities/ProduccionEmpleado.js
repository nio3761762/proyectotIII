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
exports.ProduccionEmpleado = void 0;
const typeorm_1 = require("typeorm");
const Empleado_1 = require("./Empleado");
const Produccion_1 = require("./Produccion");
const Sucursal_1 = require("./Sucursal");
let ProduccionEmpleado = class ProduccionEmpleado extends typeorm_1.BaseEntity {
};
exports.ProduccionEmpleado = ProduccionEmpleado;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "idproduccionempleado", type: "varchar", length: 50 }),
    __metadata("design:type", String)
], ProduccionEmpleado.prototype, "IdProduccionEmpleado", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Produccion_1.Produccion, (p) => p.ProduccionEmpleado, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idproduccion" }),
    __metadata("design:type", Produccion_1.Produccion)
], ProduccionEmpleado.prototype, "Produccion", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Empleado_1.Empleado, (em) => em.Produccion),
    (0, typeorm_1.JoinColumn)({ name: "idempleado" }),
    __metadata("design:type", Empleado_1.Empleado)
], ProduccionEmpleado.prototype, "Empleado", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Sucursal_1.Sucursal, (s) => s.Produccionempleado),
    (0, typeorm_1.JoinColumn)({ name: "idsucursal" }),
    __metadata("design:type", Sucursal_1.Sucursal)
], ProduccionEmpleado.prototype, "Sucursal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fecha", type: "date", nullable: true }),
    __metadata("design:type", Date)
], ProduccionEmpleado.prototype, "Fecha", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "horainicio", type: "time" }),
    __metadata("design:type", String)
], ProduccionEmpleado.prototype, "HoraInicio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "horafin", type: "time", nullable: true }),
    __metadata("design:type", String)
], ProduccionEmpleado.prototype, "HoraFin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "horas", type: "numeric", precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], ProduccionEmpleado.prototype, "Horas", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "costohora", type: "numeric", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], ProduccionEmpleado.prototype, "CostoHora", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "costototal", type: "numeric", precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], ProduccionEmpleado.prototype, "CostoTotal", void 0);
exports.ProduccionEmpleado = ProduccionEmpleado = __decorate([
    (0, typeorm_1.Entity)()
], ProduccionEmpleado);
