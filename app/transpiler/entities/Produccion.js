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
exports.Produccion = void 0;
const typeorm_1 = require("typeorm");
const Sucursal_1 = require("./Sucursal");
const Detalleproduccuin_1 = require("./Detalleproduccuin");
const ProduccionEmpleado_1 = require("./ProduccionEmpleado");
const Produccionhornodetalle_1 = require("./Produccionhornodetalle");
let Produccion = class Produccion extends typeorm_1.BaseEntity {
};
exports.Produccion = Produccion;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "idproduccion", type: "varchar", length: 150 }),
    __metadata("design:type", String)
], Produccion.prototype, "IdProduccion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fechaproduccion', type: "date", nullable: true }),
    __metadata("design:type", Date)
], Produccion.prototype, "FechaProduccion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "horainicio", type: "time", nullable: true }),
    __metadata("design:type", String)
], Produccion.prototype, "HoraInicio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "horafin", type: "time", nullable: true }),
    __metadata("design:type", String)
], Produccion.prototype, "HoraFin", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Sucursal_1.Sucursal, (consumo) => consumo.Produccion),
    (0, typeorm_1.JoinColumn)({ name: "idsucursal" }),
    __metadata("design:type", Sucursal_1.Sucursal)
], Produccion.prototype, "Sucursal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "costototal", type: "numeric", precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Produccion.prototype, "CostoTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "estado", type: "integer", default: 1 }),
    __metadata("design:type", Number)
], Produccion.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "costoinsumos", type: "numeric", precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Produccion.prototype, "CostoInsumos", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "costomanobra", type: "numeric", precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Produccion.prototype, "CostoManoObra", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "costoindirecto", type: "numeric", precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Produccion.prototype, "CostoIndirecto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "observacion", type: "text", nullable: true }),
    __metadata("design:type", String)
], Produccion.prototype, "Observacion", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Detalleproduccuin_1.DetalleProduccion, (d) => d.Produccion),
    __metadata("design:type", Array)
], Produccion.prototype, "Detalle", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ProduccionEmpleado_1.ProduccionEmpleado, (pe) => pe.Produccion),
    __metadata("design:type", Array)
], Produccion.prototype, "ProduccionEmpleado", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Produccionhornodetalle_1.ProduccionHornoDetalle, he => he.Produccion),
    __metadata("design:type", Array)
], Produccion.prototype, "DetalleHorno", void 0);
exports.Produccion = Produccion = __decorate([
    (0, typeorm_1.Entity)()
], Produccion);
