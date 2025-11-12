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
exports.Ciudad = void 0;
const typeorm_1 = require("typeorm");
const Departamento_1 = require("./Departamento");
const Distritos_1 = require("./Distritos");
let Ciudad = class Ciudad extends typeorm_1.BaseEntity {
};
exports.Ciudad = Ciudad;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'idciudad', type: "varchar", length: 50 }),
    __metadata("design:type", String)
], Ciudad.prototype, "IdCiudad", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre', type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Ciudad.prototype, "Nombre", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Departamento_1.Departamento, (departamento) => departamento.Ciudad),
    (0, typeorm_1.JoinColumn)({ name: "iddepto" }),
    __metadata("design:type", Departamento_1.Departamento)
], Ciudad.prototype, "Departamento", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Distritos_1.Distritos, (distrito) => distrito.Ciudad),
    __metadata("design:type", Array)
], Ciudad.prototype, "Distrito", void 0);
exports.Ciudad = Ciudad = __decorate([
    (0, typeorm_1.Entity)()
    //@Check(`"Estado" IN (0, 1)`)
], Ciudad);
