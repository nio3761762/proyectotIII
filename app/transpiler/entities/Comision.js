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
exports.Comision = void 0;
const typeorm_1 = require("typeorm");
let Comision = class Comision extends typeorm_1.BaseEntity {
};
exports.Comision = Comision;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'idcomision', type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Comision.prototype, "IdComision", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre', type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", String)
], Comision.prototype, "Nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cantidad', type: "integer" }),
    __metadata("design:type", Number)
], Comision.prototype, "Cantidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'porcentaje', type: "numeric", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Comision.prototype, "Porcentaje", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'preciocomision', type: "numeric", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Comision.prototype, "Preciocomision", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "estado", type: "integer", default: 1 }),
    __metadata("design:type", Number)
], Comision.prototype, "Estado", void 0);
exports.Comision = Comision = __decorate([
    (0, typeorm_1.Entity)()
    //@Check(`"Estado" IN (0, 1)`)
], Comision);
