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
exports.Transferencia = void 0;
const typeorm_1 = require("typeorm");
const Sucursal_1 = require("./Sucursal");
const Empleado_1 = require("./Empleado");
const DetalleTransferencia_1 = require("./DetalleTransferencia");
let Transferencia = class Transferencia extends typeorm_1.BaseEntity {
};
exports.Transferencia = Transferencia;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'idtransferencia', type: "varchar", length: 255 }),
    __metadata("design:type", String)
], Transferencia.prototype, "IdTransferencia", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha', type: "date" }),
    __metadata("design:type", Date)
], Transferencia.prototype, "Fecha", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hora', type: "time", nullable: true }),
    __metadata("design:type", String)
], Transferencia.prototype, "Hora", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'estado', type: "integer", default: 1 }),
    __metadata("design:type", Number)
], Transferencia.prototype, "Estado", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Sucursal_1.Sucursal, (suO) => suO.TransferenciaOrigen),
    (0, typeorm_1.JoinColumn)({ name: 'idsucursalorigen' }),
    __metadata("design:type", Sucursal_1.Sucursal)
], Transferencia.prototype, "SucursalOrigen", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Sucursal_1.Sucursal, (su) => su.TransferenciaDestino, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idsucursaldestino' }),
    __metadata("design:type", Sucursal_1.Sucursal)
], Transferencia.prototype, "SucursalDestino", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Empleado_1.Empleado, (em) => em.Transferencia, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idempleado' }),
    __metadata("design:type", Empleado_1.Empleado)
], Transferencia.prototype, "EmpleadoDestino", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => DetalleTransferencia_1.DetalleTransferencia, (ingrediente) => ingrediente.Transferencia),
    __metadata("design:type", Array)
], Transferencia.prototype, "Detalletransferencia", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tipo', type: "varchar", length: "50" }),
    __metadata("design:type", String)
], Transferencia.prototype, "Tipo", void 0);
exports.Transferencia = Transferencia = __decorate([
    (0, typeorm_1.Entity)()
], Transferencia);
