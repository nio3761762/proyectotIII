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
exports.Pago = void 0;
const typeorm_1 = require("typeorm");
const MetodoPago_1 = require("./MetodoPago");
const Venta_1 = require("./Venta");
const Pedido_1 = require("./Pedido");
let Pago = class Pago extends typeorm_1.BaseEntity {
};
exports.Pago = Pago;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'idpago', type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Pago.prototype, "IdPago", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "monto", type: "numeric", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Pago.prototype, "Monto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "cambio", type: "numeric", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Pago.prototype, "Cambio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fechapago", type: "date" }),
    __metadata("design:type", Date)
], Pago.prototype, "FechaPago", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "horapago", type: "time", nullable: true }),
    __metadata("design:type", String)
], Pago.prototype, "HoraPago", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => MetodoPago_1.Metodopago, (metodopago) => metodopago.Pago),
    (0, typeorm_1.JoinColumn)({ name: "idmetodopago" }),
    __metadata("design:type", MetodoPago_1.Metodopago)
], Pago.prototype, "Metodopago", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Venta_1.Venta, (venta) => venta.Pago, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idventa" }),
    __metadata("design:type", Venta_1.Venta)
], Pago.prototype, "Venta", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Pedido_1.Pedido, (pedido) => pedido.Pago, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idpedido" }),
    __metadata("design:type", Pedido_1.Pedido)
], Pago.prototype, "Pedido", void 0);
exports.Pago = Pago = __decorate([
    (0, typeorm_1.Entity)()
    //@Check(`"Estado" IN (0, 1)`)
], Pago);
