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
exports.Presentacion = void 0;
const typeorm_1 = require("typeorm");
const Presentacionproducto_1 = require("./Presentacionproducto");
const Estado_1 = require("./Estado");
let Presentacion = class Presentacion extends typeorm_1.BaseEntity {
};
exports.Presentacion = Presentacion;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'idpresentacion', type: "varchar", length: 50 }),
    __metadata("design:type", String)
], Presentacion.prototype, "IdPresentacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre', type: "varchar", length: 50 }),
    __metadata("design:type", String)
], Presentacion.prototype, "Nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fecharegistro", type: "date" }),
    __metadata("design:type", Date)
], Presentacion.prototype, "FechaRegistro", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fechaactualizacion", type: "date", nullable: true }),
    __metadata("design:type", Date)
], Presentacion.prototype, "FechaActualizacion", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Presentacionproducto_1.Presentacionproducto, (paquete) => paquete.Presentacion),
    __metadata("design:type", Array)
], Presentacion.prototype, "Presentacionproducto", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Estado_1.Estado, (estado) => estado.Presentacion),
    (0, typeorm_1.JoinColumn)({ name: "idestado" }),
    __metadata("design:type", Estado_1.Estado)
], Presentacion.prototype, "Estado", void 0);
exports.Presentacion = Presentacion = __decorate([
    (0, typeorm_1.Entity)()
    //@Check(`"Estado" IN (0, 1)`)
], Presentacion);
