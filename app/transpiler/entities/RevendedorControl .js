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
exports.Revendedorcontrol = void 0;
const typeorm_1 = require("typeorm");
const Empleado_1 = require("./Empleado");
const Sucursal_1 = require("./Sucursal");
const RevendedorControlDetalle_1 = require("./RevendedorControlDetalle ");
let Revendedorcontrol = class Revendedorcontrol extends typeorm_1.BaseEntity {
};
exports.Revendedorcontrol = Revendedorcontrol;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "idrevendedorcontrol", type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Revendedorcontrol.prototype, "IdRevendedorControl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fecha", type: "date" }),
    __metadata("design:type", Date)
], Revendedorcontrol.prototype, "Fecha", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "hora", type: "time", nullable: true }),
    __metadata("design:type", String)
], Revendedorcontrol.prototype, "Hora", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "observacion", type: "text", nullable: true }),
    __metadata("design:type", String)
], Revendedorcontrol.prototype, "Observacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "estado", type: "integer", default: 1 }),
    __metadata("design:type", Number)
], Revendedorcontrol.prototype, "Estado", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Empleado_1.Empleado),
    (0, typeorm_1.JoinColumn)({ name: "idempleado" }),
    __metadata("design:type", Empleado_1.Empleado)
], Revendedorcontrol.prototype, "Empleado", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Sucursal_1.Sucursal),
    (0, typeorm_1.JoinColumn)({ name: "idsucursal" }),
    __metadata("design:type", Sucursal_1.Sucursal)
], Revendedorcontrol.prototype, "Sucursal", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => RevendedorControlDetalle_1.Revendedorcontroldetalle, (detalle) => detalle.RevendedorControl),
    __metadata("design:type", Array)
], Revendedorcontrol.prototype, "Detalles", void 0);
exports.Revendedorcontrol = Revendedorcontrol = __decorate([
    (0, typeorm_1.Entity)()
], Revendedorcontrol);
