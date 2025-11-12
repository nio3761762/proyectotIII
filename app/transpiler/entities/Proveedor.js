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
exports.Proveedor = void 0;
const typeorm_1 = require("typeorm");
const TipoProveedor_1 = require("./TipoProveedor");
const Persona_1 = require("./Persona");
const Estado_1 = require("./Estado");
const Compra_1 = require("./Compra");
let Proveedor = class Proveedor extends typeorm_1.BaseEntity {
};
exports.Proveedor = Proveedor;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'idproveedor', type: "varchar", length: 50 }),
    __metadata("design:type", String)
], Proveedor.prototype, "IdProveedor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'razonsocial', type: "varchar", length: 255 }),
    __metadata("design:type", String)
], Proveedor.prototype, "RazonSocial", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => TipoProveedor_1.Tipoproveedor, (tipoproveedor) => tipoproveedor.Proveedor),
    (0, typeorm_1.JoinColumn)({ name: "idtipoproveedor" }),
    __metadata("design:type", TipoProveedor_1.Tipoproveedor)
], Proveedor.prototype, "Tipoproveedor", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Persona_1.Persona, (persona) => persona.Proveedor),
    (0, typeorm_1.JoinColumn)({ name: "idpersona" }),
    __metadata("design:type", Persona_1.Persona)
], Proveedor.prototype, "Persona", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Estado_1.Estado, (estado) => estado.Proveedor),
    (0, typeorm_1.JoinColumn)({ name: "idestado" }),
    __metadata("design:type", Estado_1.Estado)
], Proveedor.prototype, "Estado", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Compra_1.Compra, (compra) => compra.Proveedor),
    __metadata("design:type", Array)
], Proveedor.prototype, "Compra", void 0);
exports.Proveedor = Proveedor = __decorate([
    (0, typeorm_1.Entity)()
], Proveedor);
