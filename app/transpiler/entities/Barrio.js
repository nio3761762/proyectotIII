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
exports.Barrio = void 0;
const typeorm_1 = require("typeorm");
const DIreccion_1 = require("./DIreccion");
const Distritos_1 = require("./Distritos");
let Barrio = class Barrio extends typeorm_1.BaseEntity {
};
exports.Barrio = Barrio;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'idbarrio', type: "varchar", length: 50 }),
    __metadata("design:type", String)
], Barrio.prototype, "IdBarrio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre', type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Barrio.prototype, "Nombre", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Distritos_1.Distritos, (distrito) => distrito.Barrio),
    (0, typeorm_1.JoinColumn)({ name: "iddistrito" }),
    __metadata("design:type", Distritos_1.Distritos)
], Barrio.prototype, "Distrito", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => DIreccion_1.Direccion, (direccion) => direccion.Barrio),
    __metadata("design:type", Array)
], Barrio.prototype, "Direccion", void 0);
exports.Barrio = Barrio = __decorate([
    (0, typeorm_1.Entity)()
    //@Check(`"Estado" IN (0, 1)`)
], Barrio);
