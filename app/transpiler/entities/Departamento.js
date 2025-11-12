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
exports.Departamento = void 0;
const typeorm_1 = require("typeorm");
const Pais_1 = require("./Pais");
const Ciudad_1 = require("./Ciudad");
let Departamento = class Departamento extends typeorm_1.BaseEntity {
};
exports.Departamento = Departamento;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'iddepto', type: "varchar", length: 50 }),
    __metadata("design:type", String)
], Departamento.prototype, "IdDepto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre', type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Departamento.prototype, "Nombre", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Pais_1.Pais, (pais) => pais.Departamento),
    (0, typeorm_1.JoinColumn)({ name: "idpais" }),
    __metadata("design:type", Pais_1.Pais)
], Departamento.prototype, "Pais", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Ciudad_1.Ciudad, (ciudad) => ciudad.Departamento),
    __metadata("design:type", Array)
], Departamento.prototype, "Ciudad", void 0);
exports.Departamento = Departamento = __decorate([
    (0, typeorm_1.Entity)()
    //@Check(`"Estado" IN (0, 1)`)
], Departamento);
