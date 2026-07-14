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
exports.Productomedida = void 0;
const typeorm_1 = require("typeorm");
const Producto_1 = require("./Producto");
const Presentacion_1 = require("./Presentacion");
const DetalleVenta_1 = require("./DetalleVenta");
const PromocionProducto_1 = require("./PromocionProducto");
const DetalleTransferencia_1 = require("./DetalleTransferencia");
const Productomedidaprecio_1 = require("./Productomedidaprecio");
const DetallePedido_1 = require("./DetallePedido");
const RevendedorControlDetalle_1 = require("./RevendedorControlDetalle ");
let Productomedida = class Productomedida extends typeorm_1.BaseEntity {
};
exports.Productomedida = Productomedida;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "idproductomedida", type: "varchar", length: 50 }),
    __metadata("design:type", String)
], Productomedida.prototype, "IdProductoMedida", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fecharegistro", type: "date" }),
    __metadata("design:type", Date)
], Productomedida.prototype, "FechaRegistro", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "cantidad", type: "integer", default: 0 }),
    __metadata("design:type", Number)
], Productomedida.prototype, "Cantidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "precioventa", type: "numeric", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Productomedida.prototype, "PrecioVenta", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "preciomayor", type: "numeric", precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Productomedida.prototype, "PrecioMayor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "comision", type: "numeric", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Productomedida.prototype, "Comision", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "imagen", type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", String)
], Productomedida.prototype, "Imagen", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "estado", type: "integer", default: 1 }),
    __metadata("design:type", Number)
], Productomedida.prototype, "Estado", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => DetalleTransferencia_1.DetalleTransferencia, (comision) => comision.ProductoMedida),
    __metadata("design:type", Array)
], Productomedida.prototype, "DetalleTransferencia", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Producto_1.Producto, (Producto) => Producto.Productomedida),
    (0, typeorm_1.JoinColumn)({ name: "idproducto" }),
    __metadata("design:type", Producto_1.Producto)
], Productomedida.prototype, "Producto", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Presentacion_1.Presentacion, (unidadmedida) => unidadmedida.Productomedida),
    (0, typeorm_1.JoinColumn)({ name: "idpresentacion" }),
    __metadata("design:type", Presentacion_1.Presentacion)
], Productomedida.prototype, "Presentacion", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => RevendedorControlDetalle_1.Revendedorcontroldetalle, (pp) => pp.ProductoMedida),
    __metadata("design:type", Array)
], Productomedida.prototype, "Control", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => PromocionProducto_1.Promocionproducto, (promocionproducto) => promocionproducto.Productomedida),
    __metadata("design:type", Array)
], Productomedida.prototype, "Promocionproducto", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Productomedidaprecio_1.Productomedidaprecio, (detalleventa) => detalleventa.ProductoMedida),
    __metadata("design:type", Array)
], Productomedida.prototype, "Productomedidaprecio", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => DetallePedido_1.Detallepedido, (detalle) => detalle.Productomedida),
    __metadata("design:type", Array)
], Productomedida.prototype, "Detallepedido", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => DetalleVenta_1.Detalleventa, (detalleventa) => detalleventa.Productomedida),
    __metadata("design:type", Array)
], Productomedida.prototype, "Detalleventa", void 0);
exports.Productomedida = Productomedida = __decorate([
    (0, typeorm_1.Entity)()
], Productomedida);
