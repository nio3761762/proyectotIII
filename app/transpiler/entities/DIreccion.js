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
exports.Direccion = void 0;
const typeorm_1 = require("typeorm");
const Persona_1 = require("./Persona");
const Barrio_1 = require("./Barrio");
const Sucursal_1 = require("./Sucursal");
const Entrega_1 = require("./Entrega");
let Direccion = class Direccion extends typeorm_1.BaseEntity {
};
exports.Direccion = Direccion;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'iddireccion', type: "varchar", length: 255 }),
    __metadata("design:type", String)
], Direccion.prototype, "IdDireccion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'direccion', type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", String)
], Direccion.prototype, "Direccion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'referencia', type: "varchar", length: 120, nullable: true }),
    __metadata("design:type", String)
], Direccion.prototype, "Referencia", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ubicacion', type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", String)
], Direccion.prototype, "Ubicacion", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Barrio_1.Barrio, (barrio) => barrio.Direccion, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idbarrio" }),
    __metadata("design:type", Barrio_1.Barrio)
], Direccion.prototype, "Barrio", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Persona_1.Persona, (persona) => persona.Direccion),
    __metadata("design:type", Persona_1.Persona)
], Direccion.prototype, "Persona", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Entrega_1.Entrega, (envio) => envio.Direccion),
    __metadata("design:type", Array)
], Direccion.prototype, "Entrega", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Sucursal_1.Sucursal, (sucursal) => sucursal.Direccion),
    __metadata("design:type", Sucursal_1.Sucursal)
], Direccion.prototype, "Sucursal", void 0);
exports.Direccion = Direccion = __decorate([
    (0, typeorm_1.Entity)()
], Direccion);
