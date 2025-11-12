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
exports.Tipopromocion = void 0;
const typeorm_1 = require("typeorm");
const Promocion_1 = require("./Promocion");
let Tipopromocion = class Tipopromocion extends typeorm_1.BaseEntity {
};
exports.Tipopromocion = Tipopromocion;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'idtipopromocion', type: "integer" }),
    __metadata("design:type", Number)
], Tipopromocion.prototype, "IdTipoPromocion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre', type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Tipopromocion.prototype, "Nombre", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Promocion_1.Promocion, (promocion) => promocion.Tipopromocion),
    __metadata("design:type", Array)
], Tipopromocion.prototype, "Promocion", void 0);
exports.Tipopromocion = Tipopromocion = __decorate([
    (0, typeorm_1.Entity)()
    //@Check(`"Estado" IN (0, 1)`)
], Tipopromocion);
