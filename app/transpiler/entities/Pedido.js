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
exports.Pedido = void 0;
const typeorm_1 = require("typeorm");
const Venta_1 = require("./Venta");
const TipoPedido_1 = require("./TipoPedido");
const Estado_1 = require("./Estado");
const Entrega_1 = require("./Entrega");
const Distribucion_1 = require("./Distribucion");
const DetallePedido_1 = require("./DetallePedido");
let Pedido = class Pedido extends typeorm_1.BaseEntity {
};
exports.Pedido = Pedido;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "idpedido", type: "varchar", length: 50 }),
    __metadata("design:type", String)
], Pedido.prototype, "IdPedido", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fecharegistro", type: "date" }),
    __metadata("design:type", Date)
], Pedido.prototype, "FechaRegistro", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "hora", type: "time" }),
    __metadata("design:type", String)
], Pedido.prototype, "Hora", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "detalle", type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", String)
], Pedido.prototype, "Detalle", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Venta_1.Venta, (venta) => venta.Pedido),
    (0, typeorm_1.JoinColumn)({ name: "idventa" }),
    __metadata("design:type", Venta_1.Venta)
], Pedido.prototype, "Venta", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => TipoPedido_1.Tipopedido, (tipopedido) => tipopedido.Pedido),
    (0, typeorm_1.JoinColumn)({ name: "idtipopedido" }),
    __metadata("design:type", TipoPedido_1.Tipopedido)
], Pedido.prototype, "Tipopedido", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Entrega_1.Entrega, (envio) => envio.Pedido),
    __metadata("design:type", Entrega_1.Entrega)
], Pedido.prototype, "Entrega", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Estado_1.Estado, (estado) => estado.Pedido),
    (0, typeorm_1.JoinColumn)({ name: "idestado" }),
    __metadata("design:type", Estado_1.Estado)
], Pedido.prototype, "Estado", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Distribucion_1.Distribucion, (distribucion) => distribucion.Pedido),
    __metadata("design:type", Distribucion_1.Distribucion)
], Pedido.prototype, "Distribuciones", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => DetallePedido_1.Detallepedido, (distribucion) => distribucion.Pedido),
    __metadata("design:type", Array)
], Pedido.prototype, "Detallepedido", void 0);
exports.Pedido = Pedido = __decorate([
    (0, typeorm_1.Entity)()
], Pedido);
