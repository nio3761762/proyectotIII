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
exports.Venta = void 0;
const typeorm_1 = require("typeorm");
const Estado_1 = require("./Estado");
const Usuario_1 = require("./Usuario");
const Persona_1 = require("./Persona");
const DetalleVenta_1 = require("./DetalleVenta");
const Factura_1 = require("./Factura");
const Pago_1 = require("./Pago");
const Pedido_1 = require("./Pedido");
const Sucursal_1 = require("./Sucursal");
let Venta = class Venta extends typeorm_1.BaseEntity {
};
exports.Venta = Venta;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'idventa', type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Venta.prototype, "IdVenta", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fechaventa", type: "date", nullable: true }),
    __metadata("design:type", Date)
], Venta.prototype, "FechaVenta", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "horaventa", type: "time", nullable: true }),
    __metadata("design:type", String)
], Venta.prototype, "HoraVenta", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Estado_1.Estado, (estado) => estado.Venta),
    (0, typeorm_1.JoinColumn)({ name: "idestado" }),
    __metadata("design:type", Estado_1.Estado)
], Venta.prototype, "Estado", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Usuario_1.Usuario, (usuario) => usuario.Venta, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idusuario" }),
    __metadata("design:type", Usuario_1.Usuario)
], Venta.prototype, "Usuario", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Persona_1.Persona, (persona) => persona.Venta, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idpersona" }),
    __metadata("design:type", Persona_1.Persona)
], Venta.prototype, "Persona", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Sucursal_1.Sucursal, (sucursal) => sucursal.Venta, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idsucursal" }),
    __metadata("design:type", Sucursal_1.Sucursal)
], Venta.prototype, "Sucursal", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => DetalleVenta_1.Detalleventa, (detalleventa) => detalleventa.Venta),
    __metadata("design:type", Array)
], Venta.prototype, "Detalleventa", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Factura_1.Factura, (factura) => factura.Venta),
    __metadata("design:type", Factura_1.Factura)
], Venta.prototype, "Factura", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Pago_1.Pago, (pago) => pago.Venta),
    __metadata("design:type", Array)
], Venta.prototype, "Pago", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Pedido_1.Pedido, (pedido) => pedido.Venta),
    __metadata("design:type", Pedido_1.Pedido)
], Venta.prototype, "Pedido", void 0);
exports.Venta = Venta = __decorate([
    (0, typeorm_1.Entity)()
    //@Check(`"Estado" IN (0, 1)`)
], Venta);
