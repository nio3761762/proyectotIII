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
exports.Revendedorcontrolprecio = void 0;
const typeorm_1 = require("typeorm");
const RevendedorControlDetalle_1 = require("./RevendedorControlDetalle ");
let Revendedorcontrolprecio = class Revendedorcontrolprecio extends typeorm_1.BaseEntity {
};
exports.Revendedorcontrolprecio = Revendedorcontrolprecio;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "idrevendedorcontrolprecio", type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Revendedorcontrolprecio.prototype, "IdRevendedorControlPrecio", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => RevendedorControlDetalle_1.Revendedorcontroldetalle, (rc) => rc.Revendedorcontrolprecio),
    (0, typeorm_1.JoinColumn)({ name: "idrevendedorcontroldetalle" }),
    __metadata("design:type", RevendedorControlDetalle_1.Revendedorcontroldetalle)
], Revendedorcontrolprecio.prototype, "RevendedorControlDetalle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "cantidad", type: "numeric", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Revendedorcontrolprecio.prototype, "Cantidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "precioventa", type: "numeric", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Revendedorcontrolprecio.prototype, "PrecioVenta", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "estado", type: "varchar", length: 50, nullable: true }),
    __metadata("design:type", String)
], Revendedorcontrolprecio.prototype, "Estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "observacion", type: "varchar", length: 255, nullable: true, }),
    __metadata("design:type", String)
], Revendedorcontrolprecio.prototype, "Observacion", void 0);
exports.Revendedorcontrolprecio = Revendedorcontrolprecio = __decorate([
    (0, typeorm_1.Entity)()
], Revendedorcontrolprecio);
