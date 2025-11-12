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
exports.Presentacionproducto = void 0;
const typeorm_1 = require("typeorm");
const Estado_1 = require("./Estado");
const Producto_1 = require("./Producto");
const UnidadMedida_1 = require("./UnidadMedida");
const DetalleVenta_1 = require("./DetalleVenta");
const Presentacion_1 = require("./Presentacion");
const PromocionProducto_1 = require("./PromocionProducto");
const Imagen_1 = require("./Imagen");
const ProductoSucursal_1 = require("./ProductoSucursal");
const DetallePedido_1 = require("./DetallePedido");
const Detalledistribucion_1 = require("./Detalledistribucion");
let Presentacionproducto = class Presentacionproducto extends typeorm_1.BaseEntity {
};
exports.Presentacionproducto = Presentacionproducto;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "idpaquete", type: "varchar", length: 50 }),
    __metadata("design:type", String)
], Presentacionproducto.prototype, "IdPaquete", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "nombre", type: "varchar", length: 150 }),
    __metadata("design:type", String)
], Presentacionproducto.prototype, "Nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "cantidad", type: "integer" }),
    __metadata("design:type", Number)
], Presentacionproducto.prototype, "Cantidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fecharegistro", type: "date" }),
    __metadata("design:type", Date)
], Presentacionproducto.prototype, "FechaRegistro", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "precioventa", type: "numeric", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Presentacionproducto.prototype, "PrecioVenta", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "preciomayor", type: "numeric", precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Presentacionproducto.prototype, "PrecioMayor", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Producto_1.Producto, (Producto) => Producto.Paquete),
    (0, typeorm_1.JoinColumn)({ name: "idproducto" }),
    __metadata("design:type", Producto_1.Producto)
], Presentacionproducto.prototype, "Producto", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => UnidadMedida_1.Unidadmedida, (unidadmedida) => unidadmedida.Paquete),
    (0, typeorm_1.JoinColumn)({ name: "idunidadmedida" }),
    __metadata("design:type", UnidadMedida_1.Unidadmedida)
], Presentacionproducto.prototype, "Unidadmedida", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Estado_1.Estado, (estado) => estado.Paquete),
    (0, typeorm_1.JoinColumn)({ name: "idestado" }),
    __metadata("design:type", Estado_1.Estado)
], Presentacionproducto.prototype, "Estado", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Presentacion_1.Presentacion, (presentacion) => presentacion.Presentacionproducto),
    (0, typeorm_1.JoinColumn)({ name: "idpresentacion" }),
    __metadata("design:type", Presentacion_1.Presentacion)
], Presentacionproducto.prototype, "Presentacion", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Imagen_1.Imagen, (unidadmedida) => unidadmedida.Paquete, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idimagen" }),
    __metadata("design:type", Imagen_1.Imagen)
], Presentacionproducto.prototype, "Imagen", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => DetalleVenta_1.Detalleventa, (detalleventa) => detalleventa.Paquete),
    __metadata("design:type", Array)
], Presentacionproducto.prototype, "Detalleventa", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => DetallePedido_1.Detallepedido, (detalleventa) => detalleventa.Paquete),
    __metadata("design:type", Array)
], Presentacionproducto.prototype, "Detallepedido", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => PromocionProducto_1.Promocionproducto, (promocion) => promocion.Paquete),
    __metadata("design:type", Array)
], Presentacionproducto.prototype, "Promocionproducto", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ProductoSucursal_1.Productosucursal, (paquete) => paquete.Paquete),
    __metadata("design:type", Array)
], Presentacionproducto.prototype, "Productosucursal", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Detalledistribucion_1.Detalledistribucion, (paquete) => paquete.Paquete),
    __metadata("design:type", Array)
], Presentacionproducto.prototype, "Detalledistribucion", void 0);
exports.Presentacionproducto = Presentacionproducto = __decorate([
    (0, typeorm_1.Entity)()
], Presentacionproducto);
