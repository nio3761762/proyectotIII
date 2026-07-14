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
exports.Revendedorcontroldetalle = void 0;
const typeorm_1 = require("typeorm");
const ProductoMedida_1 = require("./ProductoMedida");
const RevendedorControl_1 = require("./RevendedorControl ");
const RevendedorControlPrecio_1 = require("./RevendedorControlPrecio");
let Revendedorcontroldetalle = class Revendedorcontroldetalle extends typeorm_1.BaseEntity {
};
exports.Revendedorcontroldetalle = Revendedorcontroldetalle;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "idrevendedorcontroldetalle", type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Revendedorcontroldetalle.prototype, "IdRevendedorControlDetalle", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => RevendedorControl_1.Revendedorcontrol, (es) => es.Detalles),
    (0, typeorm_1.JoinColumn)({ name: "idrevendedorcontrol" }),
    __metadata("design:type", RevendedorControl_1.Revendedorcontrol)
], Revendedorcontroldetalle.prototype, "RevendedorControl", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ProductoMedida_1.Productomedida, (pm) => pm.Control),
    (0, typeorm_1.JoinColumn)({ name: "idproductomedida" }),
    __metadata("design:type", ProductoMedida_1.Productomedida)
], Revendedorcontroldetalle.prototype, "ProductoMedida", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => RevendedorControlPrecio_1.Revendedorcontrolprecio, (pp) => pp.RevendedorControlDetalle),
    __metadata("design:type", Array)
], Revendedorcontroldetalle.prototype, "Revendedorcontrolprecio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "cantidadentregada", type: "numeric", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Revendedorcontroldetalle.prototype, "CantidadEntregada", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "cantidaddevuelta", type: "numeric", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Revendedorcontroldetalle.prototype, "CantidadDevuelta", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "precioventa", type: "numeric", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Revendedorcontroldetalle.prototype, "PrecioVenta", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "cantidadsincomision", type: "numeric", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Revendedorcontroldetalle.prototype, "CantidadSinComision", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "comisionunitaria", type: "numeric", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Revendedorcontroldetalle.prototype, "ComisionUnitaria", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "motivo", type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", String)
], Revendedorcontroldetalle.prototype, "Motivo", void 0);
exports.Revendedorcontroldetalle = Revendedorcontroldetalle = __decorate([
    (0, typeorm_1.Entity)()
], Revendedorcontroldetalle);
