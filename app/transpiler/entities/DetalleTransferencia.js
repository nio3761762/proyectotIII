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
exports.DetalleTransferencia = void 0;
const typeorm_1 = require("typeorm");
const Transferencia_1 = require("./Transferencia");
const Producto_1 = require("./Producto");
const Insumo_1 = require("./Insumo");
const ProductoMedida_1 = require("./ProductoMedida");
const InsumoMedida_1 = require("./InsumoMedida");
let DetalleTransferencia = class DetalleTransferencia extends typeorm_1.BaseEntity {
};
exports.DetalleTransferencia = DetalleTransferencia;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'iddetalletransferencia', type: "varchar", length: 255 }),
    __metadata("design:type", String)
], DetalleTransferencia.prototype, "IdDetalleTransferencia", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Transferencia_1.Transferencia, (t) => t.Detalletransferencia),
    (0, typeorm_1.JoinColumn)({ name: 'idtransferencia' }),
    __metadata("design:type", Transferencia_1.Transferencia)
], DetalleTransferencia.prototype, "Transferencia", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Producto_1.Producto, (p) => p.Detalletransferencia, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idproducto' }),
    __metadata("design:type", Producto_1.Producto)
], DetalleTransferencia.prototype, "Producto", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Insumo_1.Insumo, (i) => i.Detalletransferencia, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idinsumo' }),
    __metadata("design:type", Insumo_1.Insumo)
], DetalleTransferencia.prototype, "Insumo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => InsumoMedida_1.Insumomedida, (pm) => pm.DetalleTransferencia, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idinsumomedida' }),
    __metadata("design:type", InsumoMedida_1.Insumomedida)
], DetalleTransferencia.prototype, "Insumomedida", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ProductoMedida_1.Productomedida, (pm) => pm.DetalleTransferencia, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'idproductomedida' }),
    __metadata("design:type", ProductoMedida_1.Productomedida)
], DetalleTransferencia.prototype, "ProductoMedida", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cantidad', type: "numeric", precision: 12, scale: 3 }),
    __metadata("design:type", Number)
], DetalleTransferencia.prototype, "Cantidad", void 0);
exports.DetalleTransferencia = DetalleTransferencia = __decorate([
    (0, typeorm_1.Entity)()
], DetalleTransferencia);
