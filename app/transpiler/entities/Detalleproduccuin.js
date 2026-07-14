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
exports.DetalleProduccion = void 0;
const typeorm_1 = require("typeorm");
const Produccion_1 = require("./Produccion");
const Producto_1 = require("./Producto");
const Empleado_1 = require("./Empleado");
let DetalleProduccion = class DetalleProduccion extends typeorm_1.BaseEntity {
};
exports.DetalleProduccion = DetalleProduccion;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "iddetalleproduccion", type: "varchar", length: 50 }),
    __metadata("design:type", String)
], DetalleProduccion.prototype, "IdDetalleProduccion", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Produccion_1.Produccion, (p) => p.Detalle),
    (0, typeorm_1.JoinColumn)({ name: "idproduccion" }),
    __metadata("design:type", Produccion_1.Produccion)
], DetalleProduccion.prototype, "Produccion", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Producto_1.Producto, (p) => p.Produccion),
    (0, typeorm_1.JoinColumn)({ name: "idproducto" }),
    __metadata("design:type", Producto_1.Producto)
], DetalleProduccion.prototype, "Producto", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Empleado_1.Empleado, (e) => e.Produccion),
    (0, typeorm_1.JoinColumn)({ name: "idempleado" }),
    __metadata("design:type", Empleado_1.Empleado)
], DetalleProduccion.prototype, "Empleado", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "cantidad", type: "numeric", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], DetalleProduccion.prototype, "Cantidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "cantidadmala", type: "numeric", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DetalleProduccion.prototype, "CantidadMala", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "motivo", type: "text", default: null }),
    __metadata("design:type", String)
], DetalleProduccion.prototype, "Motivo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "costounitario", type: "numeric", precision: 10, scale: 4 }),
    __metadata("design:type", Number)
], DetalleProduccion.prototype, "CostoUnitario", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "costototal", type: "numeric", precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], DetalleProduccion.prototype, "CostoTotal", void 0);
exports.DetalleProduccion = DetalleProduccion = __decorate([
    (0, typeorm_1.Entity)()
], DetalleProduccion);
