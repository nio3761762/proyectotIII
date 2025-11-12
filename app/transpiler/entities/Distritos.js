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
exports.Distritos = void 0;
const typeorm_1 = require("typeorm");
const Ciudad_1 = require("./Ciudad");
const Barrio_1 = require("./Barrio");
let Distritos = class Distritos extends typeorm_1.BaseEntity {
};
exports.Distritos = Distritos;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'iddistrito', type: "varchar", length: 50 }),
    __metadata("design:type", String)
], Distritos.prototype, "IdDistrito", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre', type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Distritos.prototype, "Nombre", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Ciudad_1.Ciudad, (ciudad) => ciudad.Distrito),
    (0, typeorm_1.JoinColumn)({ name: "idciudad" }),
    __metadata("design:type", Ciudad_1.Ciudad)
], Distritos.prototype, "Ciudad", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Barrio_1.Barrio, (barrio) => barrio.Distrito),
    __metadata("design:type", Array)
], Distritos.prototype, "Barrio", void 0);
exports.Distritos = Distritos = __decorate([
    (0, typeorm_1.Entity)()
    //@Check(`"Estado" IN (0, 1)`)
], Distritos);
