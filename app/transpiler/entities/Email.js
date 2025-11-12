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
exports.Email = void 0;
const typeorm_1 = require("typeorm");
const Persona_1 = require("./Persona");
const AdmDatos_1 = require("./AdmDatos");
let Email = class Email extends typeorm_1.BaseEntity {
};
exports.Email = Email;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "idemail", type: "varchar", length: 150 }),
    __metadata("design:type", String)
], Email.prototype, "IdEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "email", type: "varchar", length: 255 }),
    __metadata("design:type", String)
], Email.prototype, "Email", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Persona_1.Persona, (persona) => persona.Email),
    (0, typeorm_1.JoinColumn)({ name: "idpersona" }),
    __metadata("design:type", Persona_1.Persona)
], Email.prototype, "Persona", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => AdmDatos_1.Administrardatos, (dato) => dato.Email),
    __metadata("design:type", AdmDatos_1.Administrardatos)
], Email.prototype, "Administrardatos", void 0);
exports.Email = Email = __decorate([
    (0, typeorm_1.Entity)()
], Email);
