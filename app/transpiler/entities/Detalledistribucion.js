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
exports.Detalledistribucion = void 0;
const typeorm_1 = require("typeorm");
const Producto_1 = require("./Producto");
const Presentacionproducto_1 = require("./Presentacionproducto");
const Distribucion_1 = require("./Distribucion");
let Detalledistribucion = class Detalledistribucion extends typeorm_1.BaseEntity {
};
exports.Detalledistribucion = Detalledistribucion;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'iddetalledistribucion', type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Detalledistribucion.prototype, "IdDetalleDistribucion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "cantidad", type: "integer" }),
    __metadata("design:type", Number)
], Detalledistribucion.prototype, "Cantidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "precio", type: "numeric", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Detalledistribucion.prototype, "Precio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "cantidaddevueltas", type: "integer", nullable: true }),
    __metadata("design:type", Number)
], Detalledistribucion.prototype, "Cantidaddevuelta", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "modo", type: "integer", nullable: true }),
    __metadata("design:type", Number)
], Detalledistribucion.prototype, "Modo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Distribucion_1.Distribucion, (venta) => venta.Detalledistribucion),
    (0, typeorm_1.JoinColumn)({ name: "iddistribucion" }),
    __metadata("design:type", Distribucion_1.Distribucion)
], Detalledistribucion.prototype, "Distribucion", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Producto_1.Producto, (producto) => producto.Detalledistribucion, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idproducto" }),
    __metadata("design:type", Producto_1.Producto)
], Detalledistribucion.prototype, "Producto", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Presentacionproducto_1.Presentacionproducto, (paquete) => paquete.Detalledistribucion, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idpaquete" }),
    __metadata("design:type", Presentacionproducto_1.Presentacionproducto)
], Detalledistribucion.prototype, "Paquete", void 0);
exports.Detalledistribucion = Detalledistribucion = __decorate([
    (0, typeorm_1.Entity)()
    //@Check(`"Estado" IN (0, 1)`)
], Detalledistribucion);
