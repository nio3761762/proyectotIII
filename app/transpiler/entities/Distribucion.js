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
exports.Distribucion = void 0;
const typeorm_1 = require("typeorm");
const Entrega_1 = require("./Entrega");
const Pedido_1 = require("./Pedido");
const Estado_1 = require("./Estado");
const Sucursal_1 = require("./Sucursal");
const Detalledistribucion_1 = require("./Detalledistribucion");
let Distribucion = class Distribucion extends typeorm_1.BaseEntity {
};
exports.Distribucion = Distribucion;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "iddistribucion", type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Distribucion.prototype, "IdDistribucion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fecha_distribucion", type: "date" }),
    __metadata("design:type", Date)
], Distribucion.prototype, "FechaDistribucion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "hora_distribucion", type: "time" }),
    __metadata("design:type", String)
], Distribucion.prototype, "HoraDistribucion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "origen", type: "varchar", length: 50 }),
    __metadata("design:type", String)
], Distribucion.prototype, "Origen", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Estado_1.Estado, (repartidor) => repartidor.Distribuciones),
    (0, typeorm_1.JoinColumn)({ name: "idestado" }),
    __metadata("design:type", Estado_1.Estado)
], Distribucion.prototype, "Estado", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Pedido_1.Pedido, (repartidor) => repartidor.Distribuciones, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idpedido" }),
    __metadata("design:type", Pedido_1.Pedido)
], Distribucion.prototype, "Pedido", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Sucursal_1.Sucursal, (sucursal) => sucursal.Distribucion, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idsucursal" }),
    __metadata("design:type", Object)
], Distribucion.prototype, "Sucursal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "observacion", type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", String)
], Distribucion.prototype, "Observacion", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Detalledistribucion_1.Detalledistribucion, (detalleventa) => detalleventa.Distribucion),
    __metadata("design:type", Array)
], Distribucion.prototype, "Detalledistribucion", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Entrega_1.Entrega, (pedido) => pedido.Distribucion),
    __metadata("design:type", Entrega_1.Entrega)
], Distribucion.prototype, "Entrega", void 0);
exports.Distribucion = Distribucion = __decorate([
    (0, typeorm_1.Entity)()
], Distribucion);
