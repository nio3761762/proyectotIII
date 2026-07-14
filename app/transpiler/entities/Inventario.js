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
exports.Inventario = void 0;
const typeorm_1 = require("typeorm");
const Insumo_1 = require("./Insumo");
const Producto_1 = require("./Producto");
const Sucursal_1 = require("./Sucursal");
const MovimientoInventario_1 = require("./MovimientoInventario");
const UnidadMedida_1 = require("./UnidadMedida");
let Inventario = class Inventario extends typeorm_1.BaseEntity {
};
exports.Inventario = Inventario;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "idinventario", type: "varchar", length: 150 }),
    __metadata("design:type", String)
], Inventario.prototype, "IdInventario", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Insumo_1.Insumo, (i) => i.Inventario, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idinsumo" }),
    __metadata("design:type", Insumo_1.Insumo)
], Inventario.prototype, "Insumo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Producto_1.Producto, (p) => p.Inventario, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idproducto" }),
    __metadata("design:type", Producto_1.Producto)
], Inventario.prototype, "Producto", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Sucursal_1.Sucursal, (s) => s.Inventario),
    (0, typeorm_1.JoinColumn)({ name: "idsucursal" }),
    __metadata("design:type", Sucursal_1.Sucursal)
], Inventario.prototype, "Sucursal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'stock', type: "numeric", precision: 12, scale: 3 }),
    __metadata("design:type", Number)
], Inventario.prototype, "Stock", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cantidad', type: "integer", default: 0 }),
    __metadata("design:type", Number)
], Inventario.prototype, "Cantidad", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => UnidadMedida_1.Unidadmedida, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idunidadmedida" }),
    __metadata("design:type", UnidadMedida_1.Unidadmedida)
], Inventario.prototype, "Unidadmedida", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "preciounitario", type: "numeric", precision: 14, scale: 6, default: 0 }),
    __metadata("design:type", Number)
], Inventario.prototype, "Preciounitario", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "costounitario", type: "numeric", precision: 14, scale: 6 }),
    __metadata("design:type", Number)
], Inventario.prototype, "CostoUnitario", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fechaingreso", type: "timestamp", nullable: true }),
    __metadata("design:type", Date)
], Inventario.prototype, "FechaIngreso", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "idreferencia", type: "varchar", length: 150, nullable: true }),
    __metadata("design:type", String)
], Inventario.prototype, "IdReferencia", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "tipoorigen", type: "varchar", length: 30, nullable: true }),
    __metadata("design:type", String)
], Inventario.prototype, "TipoOrigen", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "estado", type: "integer", default: 1 }),
    __metadata("design:type", Number)
], Inventario.prototype, "Estado", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => MovimientoInventario_1.MovimientoInventario, (productosucursal) => productosucursal.Inventario),
    __metadata("design:type", Array)
], Inventario.prototype, "Movimiento", void 0);
exports.Inventario = Inventario = __decorate([
    (0, typeorm_1.Entity)()
], Inventario);
