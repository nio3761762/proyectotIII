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
exports.Insumo = void 0;
const typeorm_1 = require("typeorm");
const SubCategoria_1 = require("./SubCategoria");
const Marca_1 = require("./Marca");
const Ingrediente_1 = require("./Ingrediente");
const InsumoMedida_1 = require("./InsumoMedida");
const DetalleTransferencia_1 = require("./DetalleTransferencia");
const Inventario_1 = require("./Inventario");
const MovimientoInventario_1 = require("./MovimientoInventario");
const DetalleCompra_1 = require("./DetalleCompra");
const ConfiguracionEnergia_1 = require("./ConfiguracionEnergia");
let Insumo = class Insumo extends typeorm_1.BaseEntity {
};
exports.Insumo = Insumo;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'idinsumo', type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Insumo.prototype, "IdInsumo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre', type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Insumo.prototype, "Nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'descripcion', type: "text", nullable: true }),
    __metadata("design:type", String)
], Insumo.prototype, "Descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fecharegistro", type: "date", nullable: true }),
    __metadata("design:type", Date)
], Insumo.prototype, "FechaRegistro", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "horaregistro", type: "time", nullable: true }),
    __metadata("design:type", String)
], Insumo.prototype, "HoraRegistro", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fechaactualizacion", type: "date", nullable: true }),
    __metadata("design:type", Date)
], Insumo.prototype, "Fechaactualizacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "stockminimo", type: "integer", nullable: true }),
    __metadata("design:type", Number)
], Insumo.prototype, "StockMinimo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => SubCategoria_1.Subcategoria, (sc) => sc.Insumo, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idsubcategoria" }),
    __metadata("design:type", SubCategoria_1.Subcategoria)
], Insumo.prototype, "Subcategoria", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "estado", type: "integer", default: 1 }),
    __metadata("design:type", Number)
], Insumo.prototype, "Estado", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Marca_1.Marca, (m) => m.Insumo, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idmarca" }),
    __metadata("design:type", Marca_1.Marca)
], Insumo.prototype, "Marca", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "imagen", type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", String)
], Insumo.prototype, "Imagen", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ConfiguracionEnergia_1.ConfiguracionEnergia, (i) => i.Insumo),
    __metadata("design:type", Array)
], Insumo.prototype, "Configuracionenergia", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => DetalleTransferencia_1.DetalleTransferencia, (i) => i.Insumo),
    __metadata("design:type", Array)
], Insumo.prototype, "Detalletransferencia", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Inventario_1.Inventario, (i) => i.Insumo),
    __metadata("design:type", Array)
], Insumo.prototype, "Inventario", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => MovimientoInventario_1.MovimientoInventario, (i) => i.Insumo),
    __metadata("design:type", Array)
], Insumo.prototype, "Movimiento", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => InsumoMedida_1.Insumomedida, (i) => i.Insumo),
    __metadata("design:type", Array)
], Insumo.prototype, "Insumomedida", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => DetalleCompra_1.Detallecompra, (i) => i.Insumo),
    __metadata("design:type", Array)
], Insumo.prototype, "Detallecompra", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Ingrediente_1.Ingrediente, (i) => i.Insumo),
    __metadata("design:type", Array)
], Insumo.prototype, "Ingrediente", void 0);
exports.Insumo = Insumo = __decorate([
    (0, typeorm_1.Entity)()
], Insumo);
