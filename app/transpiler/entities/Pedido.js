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
const DetallePedido_1 = require("./DetallePedido");
const Usuario_1 = require("./Usuario");
const Persona_1 = require("./Persona");
const Sucursal_1 = require("./Sucursal");
const Pago_1 = require("./Pago");
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
    (0, typeorm_1.Column)({ name: "devolucion", type: "text", nullable: true }),
    __metadata("design:type", String)
], Pedido.prototype, "devolucion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total', type: "numeric", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Pedido.prototype, "Total", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'adelanto', type: "numeric", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Pedido.prototype, "Adelanto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "direccionentrega", type: "text", nullable: true }),
    __metadata("design:type", String)
], Pedido.prototype, "DireccionEntrega", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "referenciaentrega", type: "text", nullable: true }),
    __metadata("design:type", String)
], Pedido.prototype, "ReferenciaEntrega", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "linkubicacion", type: "varchar", nullable: true }),
    __metadata("design:type", String)
], Pedido.prototype, "LinkUbicacion", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Venta_1.Venta, (venta) => venta.Pedido),
    __metadata("design:type", Venta_1.Venta)
], Pedido.prototype, "Venta", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => TipoPedido_1.Tipopedido, (tipopedido) => tipopedido.Pedido),
    (0, typeorm_1.JoinColumn)({ name: "idtipopedido" }),
    __metadata("design:type", TipoPedido_1.Tipopedido)
], Pedido.prototype, "Tipopedido", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'estado', type: "integer", default: 1 }),
    __metadata("design:type", Number)
], Pedido.prototype, "Estado", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Usuario_1.Usuario, (usuario) => usuario.Pedido, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idusuario" }),
    __metadata("design:type", Usuario_1.Usuario)
], Pedido.prototype, "Usuario", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Persona_1.Persona, (persona) => persona.Pedido, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idpersona" }),
    __metadata("design:type", Persona_1.Persona)
], Pedido.prototype, "Persona", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Sucursal_1.Sucursal, (sucursal) => sucursal.Pedido, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idsucursal" }),
    __metadata("design:type", Sucursal_1.Sucursal)
], Pedido.prototype, "Sucursal", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => DetallePedido_1.Detallepedido, (distribucion) => distribucion.Pedido),
    __metadata("design:type", Array)
], Pedido.prototype, "Detallepedido", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Pago_1.Pago, (pago) => pago.Pedido),
    __metadata("design:type", Array)
], Pedido.prototype, "Pago", void 0);
exports.Pedido = Pedido = __decorate([
    (0, typeorm_1.Entity)()
], Pedido);
