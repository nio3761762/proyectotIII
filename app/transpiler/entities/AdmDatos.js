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
exports.Administrardatos = void 0;
const typeorm_1 = require("typeorm");
const Sucursal_1 = require("./Sucursal");
const Persona_1 = require("./Persona");
let Administrardatos = class Administrardatos extends typeorm_1.BaseEntity {
};
exports.Administrardatos = Administrardatos;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'iddatos', type: "integer" }),
    __metadata("design:type", Number)
], Administrardatos.prototype, "IdDatos", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre', type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Administrardatos.prototype, "Nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'celular', type: "varchar", length: 20 }),
    __metadata("design:type", String)
], Administrardatos.prototype, "Celular", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'email', type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", String)
], Administrardatos.prototype, "Email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'foto', type: "varchar", length: 255 }),
    __metadata("design:type", String)
], Administrardatos.prototype, "Foto", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Sucursal_1.Sucursal, (sucursal) => sucursal.Datos),
    __metadata("design:type", Array)
], Administrardatos.prototype, "sucursal", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Persona_1.Persona, (persona) => persona.Administrardatos),
    (0, typeorm_1.JoinColumn)({ name: "idpropietario" }),
    __metadata("design:type", Persona_1.Persona)
], Administrardatos.prototype, "Persona", void 0);
exports.Administrardatos = Administrardatos = __decorate([
    (0, typeorm_1.Entity)()
], Administrardatos);
