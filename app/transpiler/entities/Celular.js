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
exports.Celular = void 0;
const typeorm_1 = require("typeorm");
const Persona_1 = require("./Persona");
const Estado_1 = require("./Estado");
let Celular = class Celular extends typeorm_1.BaseEntity {
};
exports.Celular = Celular;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'idcelular', type: "varchar", length: 50 }),
    __metadata("design:type", String)
], Celular.prototype, "IdCelular", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'numero', type: "varchar", length: 20 }),
    __metadata("design:type", String)
], Celular.prototype, "Numero", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Persona_1.Persona, (persona) => persona.Celulares),
    (0, typeorm_1.JoinColumn)({ name: "idpersona" }),
    __metadata("design:type", Persona_1.Persona)
], Celular.prototype, "Persona", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Estado_1.Estado, (estado) => estado.Celular),
    (0, typeorm_1.JoinColumn)({ name: "idestado" }),
    __metadata("design:type", Estado_1.Estado)
], Celular.prototype, "Estado", void 0);
exports.Celular = Celular = __decorate([
    (0, typeorm_1.Entity)()
], Celular);
