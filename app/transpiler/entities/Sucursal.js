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
exports.Sucursal = void 0;
const typeorm_1 = require("typeorm");
const DIreccion_1 = require("./DIreccion");
const AdmDatos_1 = require("./AdmDatos");
const Horario_1 = require("./Horario");
const Venta_1 = require("./Venta");
const Produccion_1 = require("./Produccion");
const EmpleadoSucursal_1 = require("./EmpleadoSucursal");
const Transferencia_1 = require("./Transferencia");
const Inventario_1 = require("./Inventario");
const MovimientoInventario_1 = require("./MovimientoInventario");
const Gastos_1 = require("./Gastos");
const ProduccionEmpleado_1 = require("./ProduccionEmpleado");
const Horno_1 = require("./Horno");
const Pedido_1 = require("./Pedido");
let Sucursal = class Sucursal extends typeorm_1.BaseEntity {
    some(arg0) {
        throw new Error("Method not implemented.");
    }
};
exports.Sucursal = Sucursal;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "idsucursal", type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Sucursal.prototype, "IdSucursal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "nombre", type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Sucursal.prototype, "Nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "nro", type: "integer" }),
    __metadata("design:type", Number)
], Sucursal.prototype, "Nro", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fecharegistro", type: "date" }),
    __metadata("design:type", Date)
], Sucursal.prototype, "FechaRegistro", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fechaactualizacion", type: "date", nullable: true }),
    __metadata("design:type", Date)
], Sucursal.prototype, "FechaActualizacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "celular", type: "varchar", length: 100, nullable: true }),
    __metadata("design:type", String)
], Sucursal.prototype, "Celular", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "central", type: "integer" }),
    __metadata("design:type", Number)
], Sucursal.prototype, "Central", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "estado", type: "integer", default: 1 }),
    __metadata("design:type", Number)
], Sucursal.prototype, "Estado", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => DIreccion_1.Direccion, (direccion) => direccion.Sucursal),
    (0, typeorm_1.JoinColumn)({ name: "iddireccion" }),
    __metadata("design:type", DIreccion_1.Direccion)
], Sucursal.prototype, "Direccion", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => AdmDatos_1.Administrardatos, (dato) => dato.sucursal),
    (0, typeorm_1.JoinColumn)({ name: "iddatos" }),
    __metadata("design:type", AdmDatos_1.Administrardatos)
], Sucursal.prototype, "Datos", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Gastos_1.Gasto, (venta) => venta.Sucursal),
    __metadata("design:type", Array)
], Sucursal.prototype, "Gasto", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Horario_1.Horario, (horario) => horario.Sucursal),
    __metadata("design:type", Array)
], Sucursal.prototype, "Horario", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Transferencia_1.Transferencia, (venta) => venta.SucursalOrigen),
    __metadata("design:type", Array)
], Sucursal.prototype, "TransferenciaOrigen", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Transferencia_1.Transferencia, (venta) => venta.SucursalDestino),
    __metadata("design:type", Array)
], Sucursal.prototype, "TransferenciaDestino", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Inventario_1.Inventario, (productosucursal) => productosucursal.Sucursal),
    __metadata("design:type", Array)
], Sucursal.prototype, "Inventario", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => MovimientoInventario_1.MovimientoInventario, (ingrediente) => ingrediente.Sucursal),
    __metadata("design:type", Array)
], Sucursal.prototype, "Movimiento", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Venta_1.Venta, (venta) => venta.Sucursal),
    __metadata("design:type", Array)
], Sucursal.prototype, "Venta", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Pedido_1.Pedido, (venta) => venta.Sucursal),
    __metadata("design:type", Array)
], Sucursal.prototype, "Pedido", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Produccion_1.Produccion, (productosucursal) => productosucursal.Sucursal),
    __metadata("design:type", Array)
], Sucursal.prototype, "Produccion", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ProduccionEmpleado_1.ProduccionEmpleado, (productosucursal) => productosucursal.Sucursal),
    __metadata("design:type", Array)
], Sucursal.prototype, "Produccionempleado", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => EmpleadoSucursal_1.EmpleadoSucursal, (es) => es.Sucursal),
    __metadata("design:type", Array)
], Sucursal.prototype, "EmpleadoSucursales", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Horno_1.Horno, (h) => h.Sucursal),
    __metadata("design:type", Array)
], Sucursal.prototype, "Hornos", void 0);
exports.Sucursal = Sucursal = __decorate([
    (0, typeorm_1.Entity)()
], Sucursal);
