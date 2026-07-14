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
exports.Producto = void 0;
const typeorm_1 = require("typeorm");
const SubCategoria_1 = require("./SubCategoria");
const ProductoMedida_1 = require("./ProductoMedida");
const DetallePedido_1 = require("./DetallePedido");
const DetalleTransferencia_1 = require("./DetalleTransferencia");
const Inventario_1 = require("./Inventario");
const MovimientoInventario_1 = require("./MovimientoInventario");
const Detalleproduccuin_1 = require("./Detalleproduccuin");
const Receta_1 = require("./Receta");
const HornoProduccto_1 = require("./HornoProduccto");
const DetalleVenta_1 = require("./DetalleVenta");
const PromocionProducto_1 = require("./PromocionProducto");
let Producto = class Producto extends typeorm_1.BaseEntity {
};
exports.Producto = Producto;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'idproducto', type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Producto.prototype, "IdProducto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre', type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Producto.prototype, "Nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'descripcion', type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", String)
], Producto.prototype, "Descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'descripcionlarga', type: "text", nullable: true }),
    __metadata("design:type", String)
], Producto.prototype, "Descripcionlarga", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "cantidad", type: "integer", default: 0 }),
    __metadata("design:type", Number)
], Producto.prototype, "Cantidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fecharegistro", type: "date", nullable: true }),
    __metadata("design:type", Date)
], Producto.prototype, "FechaRegistro", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "horaregistro", type: "time", nullable: true }),
    __metadata("design:type", String)
], Producto.prototype, "HoraRegistro", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fechaactualizacion", type: "date", nullable: true }),
    __metadata("design:type", Date)
], Producto.prototype, "Fechaactualizacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "stockminimo", type: "integer", nullable: true }),
    __metadata("design:type", Number)
], Producto.prototype, "StockMinimo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => SubCategoria_1.Subcategoria, (subcategoria) => subcategoria.Producto, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idsubcategoria" }),
    __metadata("design:type", SubCategoria_1.Subcategoria)
], Producto.prototype, "Subcategoria", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "estado", type: "integer", default: 1 }),
    __metadata("design:type", Number)
], Producto.prototype, "Estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "imagen", type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", String)
], Producto.prototype, "Imagen", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => DetalleTransferencia_1.DetalleTransferencia, (ingrediente) => ingrediente.Producto),
    __metadata("design:type", Array)
], Producto.prototype, "Detalletransferencia", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => DetalleVenta_1.Detalleventa, (ingrediente) => ingrediente.Producto),
    __metadata("design:type", Array)
], Producto.prototype, "Detalleventa", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Inventario_1.Inventario, (ingrediente) => ingrediente.Producto),
    __metadata("design:type", Array)
], Producto.prototype, "Inventario", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => PromocionProducto_1.Promocionproducto, (ingrediente) => ingrediente.Producto),
    __metadata("design:type", Array)
], Producto.prototype, "Promocionproducto", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => MovimientoInventario_1.MovimientoInventario, (ingrediente) => ingrediente.Producto),
    __metadata("design:type", Array)
], Producto.prototype, "Movimiento", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Receta_1.Receta, (ingrediente) => ingrediente.Producto),
    __metadata("design:type", Array)
], Producto.prototype, "Receta", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ProductoMedida_1.Productomedida, (productomedida) => productomedida.Producto),
    __metadata("design:type", Array)
], Producto.prototype, "Productomedida", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => DetallePedido_1.Detallepedido, (detalleventa) => detalleventa.Producto),
    __metadata("design:type", Array)
], Producto.prototype, "Detallepedido", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Detalleproduccuin_1.DetalleProduccion, (consumo) => consumo.Producto),
    __metadata("design:type", Array)
], Producto.prototype, "Produccion", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => HornoProduccto_1.Hornoproducto, he => he.Producto),
    __metadata("design:type", Array)
], Producto.prototype, "Hornoproducto", void 0);
exports.Producto = Producto = __decorate([
    (0, typeorm_1.Entity)()
], Producto);
