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
exports.ConsumoInsumo = void 0;
const typeorm_1 = require("typeorm");
const Producto_1 = require("./Producto");
const Produccion_1 = require("./Produccion");
const UnidadMedida_1 = require("./UnidadMedida");
let ConsumoInsumo = class ConsumoInsumo extends typeorm_1.BaseEntity {
};
exports.ConsumoInsumo = ConsumoInsumo;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ConsumoInsumo.prototype, "IdConsumo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", precision: 10, scale: 3 }),
    __metadata("design:type", Number)
], ConsumoInsumo.prototype, "CantidadConsumida", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Producto_1.Producto),
    (0, typeorm_1.JoinColumn)({ name: "idinsumo" }),
    __metadata("design:type", Producto_1.Producto)
], ConsumoInsumo.prototype, "Insumo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Produccion_1.Produccion, (produccion) => produccion.Consumos),
    (0, typeorm_1.JoinColumn)({ name: "idproduccion" }),
    __metadata("design:type", Produccion_1.Produccion)
], ConsumoInsumo.prototype, "Produccion", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => UnidadMedida_1.Unidadmedida),
    (0, typeorm_1.JoinColumn)({ name: "idunidadmedida" }),
    __metadata("design:type", UnidadMedida_1.Unidadmedida)
], ConsumoInsumo.prototype, "Unidadmedida", void 0);
exports.ConsumoInsumo = ConsumoInsumo = __decorate([
    (0, typeorm_1.Entity)()
], ConsumoInsumo);
