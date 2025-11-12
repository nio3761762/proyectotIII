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
const Marca_1 = require("./Marca");
const TipoProducto_1 = require("./TipoProducto");
const Estado_1 = require("./Estado");
const Imagen_1 = require("./Imagen");
const Comision_1 = require("./Comision");
const PromocionProducto_1 = require("./PromocionProducto");
const Ingrediente_1 = require("./Ingrediente");
const DetalleVenta_1 = require("./DetalleVenta");
const ProductoSucursal_1 = require("./ProductoSucursal");
const ProductoMedida_1 = require("./ProductoMedida");
const Presentacionproducto_1 = require("./Presentacionproducto");
const DetallePedido_1 = require("./DetallePedido");
const Detalledistribucion_1 = require("./Detalledistribucion");
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
    (0, typeorm_1.Column)({ name: 'cantidad', type: "integer", nullable: true, default: 0 }),
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
    (0, typeorm_1.Column)({ name: "fechavencimiento", type: "date", nullable: true }),
    __metadata("design:type", Date)
], Producto.prototype, "FechaVencimiento", void 0);
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
    (0, typeorm_1.ManyToOne)(() => Estado_1.Estado, (estado) => estado.Producto),
    (0, typeorm_1.JoinColumn)({ name: "idestado" }),
    __metadata("design:type", Estado_1.Estado)
], Producto.prototype, "Estado", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Marca_1.Marca, (marca) => marca.Producto, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idmarca" }),
    __metadata("design:type", Marca_1.Marca)
], Producto.prototype, "Marca", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => TipoProducto_1.Tipoproducto, (tipoproducto) => tipoproducto.Producto, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idtipoproducto" }),
    __metadata("design:type", TipoProducto_1.Tipoproducto)
], Producto.prototype, "Tipoproducto", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Imagen_1.Imagen, (imagen) => imagen.Producto, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idimagen" }),
    __metadata("design:type", Imagen_1.Imagen)
], Producto.prototype, "Imagen", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Comision_1.Comision, (comision) => comision.Producto),
    __metadata("design:type", Array)
], Producto.prototype, "Comision", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => PromocionProducto_1.Promocionproducto, (promocionproducto) => promocionproducto.Producto),
    __metadata("design:type", Array)
], Producto.prototype, "Promocionproducto", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Ingrediente_1.Ingrediente, (ingrediente) => ingrediente.Ingredientes),
    __metadata("design:type", Array)
], Producto.prototype, "Ingrediente", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Ingrediente_1.Ingrediente, (ingrediente) => ingrediente.Producto),
    __metadata("design:type", Array)
], Producto.prototype, "Producto", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ProductoSucursal_1.Productosucursal, (productosucursal) => productosucursal.Producto),
    __metadata("design:type", Array)
], Producto.prototype, "Productosucursal", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ProductoMedida_1.Productomedida, (productomedida) => productomedida.Producto),
    __metadata("design:type", Array)
], Producto.prototype, "Productomedida", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Presentacionproducto_1.Presentacionproducto, (paquete) => paquete.Producto),
    __metadata("design:type", Array)
], Producto.prototype, "Paquete", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => DetalleVenta_1.Detalleventa, (detalleventa) => detalleventa.Producto),
    __metadata("design:type", Array)
], Producto.prototype, "Detalleventa", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => DetallePedido_1.Detallepedido, (detalleventa) => detalleventa.Producto),
    __metadata("design:type", Array)
], Producto.prototype, "Detallepedido", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Detalledistribucion_1.Detalledistribucion, (detalleventa) => detalleventa.Producto),
    __metadata("design:type", Array)
], Producto.prototype, "Detalledistribucion", void 0);
exports.Producto = Producto = __decorate([
    (0, typeorm_1.Entity)()
    //@Check(`"Estado" IN (0, 1)`)
], Producto);
