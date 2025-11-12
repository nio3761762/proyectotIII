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
exports.Repartidor = void 0;
const typeorm_1 = require("typeorm");
const Persona_1 = require("./Persona");
const EmpresaReparto_1 = require("./EmpresaReparto");
const Estado_1 = require("./Estado");
const TipoLicencia_1 = require("./TipoLicencia");
const TrackingLink_1 = require("./TrackingLink");
const Entrega_1 = require("./Entrega");
let Repartidor = class Repartidor extends typeorm_1.BaseEntity {
};
exports.Repartidor = Repartidor;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "idrepartidor", type: "varchar", length: 150 }),
    __metadata("design:type", String)
], Repartidor.prototype, "IdRepartidor", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Estado_1.Estado, (estado) => estado.Repartidor),
    (0, typeorm_1.JoinColumn)({ name: "idestado" }),
    __metadata("design:type", Estado_1.Estado)
], Repartidor.prototype, "Estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "tipovehiculo", type: "varchar", length: 100, nullable: true }),
    __metadata("design:type", String)
], Repartidor.prototype, "TipoVehiculo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "placavehiculo", type: "varchar", length: 20, nullable: true, unique: true }),
    __metadata("design:type", String)
], Repartidor.prototype, "PlacaVehiculo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "numerolicencia", type: "varchar", length: 50, nullable: true }),
    __metadata("design:type", String)
], Repartidor.prototype, "NumeroLicencia", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => EmpresaReparto_1.EmpresaReparto, empresaReparto => empresaReparto.Repartidores),
    (0, typeorm_1.JoinColumn)({ name: "idempresareparto" }),
    __metadata("design:type", EmpresaReparto_1.EmpresaReparto)
], Repartidor.prototype, "EmpresaReparto", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => TipoLicencia_1.TipoLicencia, tipoLicencia => tipoLicencia.Repartidores),
    (0, typeorm_1.JoinColumn)({ name: "idtipolicencia" }),
    __metadata("design:type", TipoLicencia_1.TipoLicencia)
], Repartidor.prototype, "TipoLicencia", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Persona_1.Persona, (persona) => persona.Repartidor),
    (0, typeorm_1.JoinColumn)({ name: "idpersona" }),
    __metadata("design:type", Persona_1.Persona)
], Repartidor.prototype, "Persona", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => TrackingLink_1.TrackingLink, (paquete) => paquete.Repartidor),
    __metadata("design:type", Array)
], Repartidor.prototype, "TrackingLink", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Entrega_1.Entrega, (paquete) => paquete.Repartidor),
    __metadata("design:type", Array)
], Repartidor.prototype, "Entrega", void 0);
exports.Repartidor = Repartidor = __decorate([
    (0, typeorm_1.Entity)()
], Repartidor);
