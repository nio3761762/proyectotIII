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
exports.MovimientoInventario = void 0;
const typeorm_1 = require("typeorm");
const Insumo_1 = require("./Insumo");
const Producto_1 = require("./Producto");
const Sucursal_1 = require("./Sucursal");
const Inventario_1 = require("./Inventario");
let MovimientoInventario = class MovimientoInventario extends typeorm_1.BaseEntity {
};
exports.MovimientoInventario = MovimientoInventario;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "idmovimiento", type: "varchar", length: 150 }),
    __metadata("design:type", String)
], MovimientoInventario.prototype, "IdMovimiento", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tipo', type: "varchar", length: 150, nullable: true }),
    __metadata("design:type", String)
], MovimientoInventario.prototype, "Tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cantidad', type: "numeric", precision: 12, scale: 3 }),
    __metadata("design:type", Number)
], MovimientoInventario.prototype, "Cantidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha', type: "timestamp" }),
    __metadata("design:type", Date)
], MovimientoInventario.prototype, "Fecha", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Insumo_1.Insumo, (i) => i.Movimiento, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idinsumo" }),
    __metadata("design:type", Insumo_1.Insumo)
], MovimientoInventario.prototype, "Insumo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Producto_1.Producto, (p) => p.Movimiento, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idproducto" }),
    __metadata("design:type", Producto_1.Producto)
], MovimientoInventario.prototype, "Producto", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Sucursal_1.Sucursal, (s) => s.Movimiento),
    (0, typeorm_1.JoinColumn)({ name: "idsucursal" }),
    __metadata("design:type", Sucursal_1.Sucursal)
], MovimientoInventario.prototype, "Sucursal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "costounitario", type: "numeric", precision: 14, scale: 6, nullable: true }),
    __metadata("design:type", Number)
], MovimientoInventario.prototype, "CostoUnitario", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "costototal", type: "numeric", precision: 14, scale: 3, nullable: true }),
    __metadata("design:type", Number)
], MovimientoInventario.prototype, "CostoTotal", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Inventario_1.Inventario, (inv) => inv.Movimiento, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idinventario" }),
    __metadata("design:type", Inventario_1.Inventario)
], MovimientoInventario.prototype, "Inventario", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'idreferencia', type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], MovimientoInventario.prototype, "IdReferencia", void 0);
exports.MovimientoInventario = MovimientoInventario = __decorate([
    (0, typeorm_1.Entity)()
], MovimientoInventario);
