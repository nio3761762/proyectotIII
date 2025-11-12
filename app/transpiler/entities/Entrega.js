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
exports.Entrega = void 0;
const typeorm_1 = require("typeorm");
const DIreccion_1 = require("./DIreccion");
const Pedido_1 = require("./Pedido");
const TipoEntrega_1 = require("./TipoEntrega");
const Estado_1 = require("./Estado");
const SeguimientoRepartidor_1 = require("./SeguimientoRepartidor");
const Repartidor_1 = require("./Repartidor");
const Distribucion_1 = require("./Distribucion");
let Entrega = class Entrega extends typeorm_1.BaseEntity {
};
exports.Entrega = Entrega;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "identrega", type: "varchar", length: 50 }),
    __metadata("design:type", String)
], Entrega.prototype, "IdEntrega", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fechaentrega", type: "date" }),
    __metadata("design:type", Date)
], Entrega.prototype, "FechaEntrega", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "horaentrega", type: "time" }),
    __metadata("design:type", String)
], Entrega.prototype, "HoraEntrega", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'costoentrega', type: "numeric", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Entrega.prototype, "CostoEntrega", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => DIreccion_1.Direccion, (direccion) => direccion.Entrega),
    (0, typeorm_1.JoinColumn)({ name: "iddireccion" }),
    __metadata("design:type", DIreccion_1.Direccion)
], Entrega.prototype, "Direccion", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => TipoEntrega_1.Tipoentrega, (tipoentrega) => tipoentrega.Entrega),
    (0, typeorm_1.JoinColumn)({ name: "idtipoentrega" }),
    __metadata("design:type", TipoEntrega_1.Tipoentrega)
], Entrega.prototype, "Tipoentrega", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Pedido_1.Pedido, (pedido) => pedido.Entrega, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idpedido" }),
    __metadata("design:type", Pedido_1.Pedido)
], Entrega.prototype, "Pedido", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Distribucion_1.Distribucion, (pedido) => pedido.Entrega, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "iddistribucion" }),
    __metadata("design:type", Distribucion_1.Distribucion)
], Entrega.prototype, "Distribucion", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Estado_1.Estado, (estado) => estado.Entrega),
    (0, typeorm_1.JoinColumn)({ name: "idestado" }),
    __metadata("design:type", Estado_1.Estado)
], Entrega.prototype, "Estado", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Repartidor_1.Repartidor, (repartidor) => repartidor.Entrega, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idrepartidor" }),
    __metadata("design:type", Repartidor_1.Repartidor)
], Entrega.prototype, "Repartidor", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => SeguimientoRepartidor_1.SeguimientoEntrega, (repartidor) => repartidor.Entrega),
    __metadata("design:type", Array)
], Entrega.prototype, "Seguimiento", void 0);
exports.Entrega = Entrega = __decorate([
    (0, typeorm_1.Entity)()
], Entrega);
