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
exports.Documento = void 0;
const typeorm_1 = require("typeorm");
const TipoDocumento_1 = require("./TipoDocumento");
const Complemento_1 = require("./Complemento");
const Persona_1 = require("./Persona");
let Documento = class Documento extends typeorm_1.BaseEntity {
};
exports.Documento = Documento;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "iddocumento", type: "varchar", length: 50 }),
    __metadata("design:type", String)
], Documento.prototype, "IdDocumento", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "documento", type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Documento.prototype, "Documento", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => TipoDocumento_1.Tipodocumento, (tipodocumento) => tipodocumento.Documento),
    (0, typeorm_1.JoinColumn)({ name: "idtipodocumento" }),
    __metadata("design:type", TipoDocumento_1.Tipodocumento)
], Documento.prototype, "Tipodocumento", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Complemento_1.Complemento, (complemento) => complemento.Documento, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idcomplemento" }),
    __metadata("design:type", Complemento_1.Complemento)
], Documento.prototype, "Complemento", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Persona_1.Persona, (persona) => persona.Documento, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idpersona" }),
    __metadata("design:type", Persona_1.Persona)
], Documento.prototype, "Persona", void 0);
exports.Documento = Documento = __decorate([
    (0, typeorm_1.Entity)()
], Documento);
