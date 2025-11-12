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
exports.Salario = void 0;
const typeorm_1 = require("typeorm");
const Persona_1 = require("./Persona");
let Salario = class Salario extends typeorm_1.BaseEntity {
};
exports.Salario = Salario;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "idsalario", type: "varchar", length: 150 }),
    __metadata("design:type", String)
], Salario.prototype, "IdSalario", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "salario", type: "decimal", precision: 10, scale: 2, default: 0.00 }),
    __metadata("design:type", Number)
], Salario.prototype, "Salario", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "moneda", type: "varchar", length: 10 }),
    __metadata("design:type", String)
], Salario.prototype, "Moneda", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fecha", type: "date" }),
    __metadata("design:type", Date)
], Salario.prototype, "Fecha", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Persona_1.Persona, (persona) => persona.Salario),
    __metadata("design:type", Array)
], Salario.prototype, "Persona", void 0);
exports.Salario = Salario = __decorate([
    (0, typeorm_1.Entity)()
], Salario);
