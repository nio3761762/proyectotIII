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
exports.Persona = void 0;
const typeorm_1 = require("typeorm");
const Usuario_1 = require("./Usuario");
const Celular_1 = require("./Celular");
const DIreccion_1 = require("./DIreccion");
const Venta_1 = require("./Venta");
const Proveedor_1 = require("./Proveedor");
const AdmDatos_1 = require("./AdmDatos");
const Documento_1 = require("./Documento");
const Empleado_1 = require("./Empleado");
const Pedido_1 = require("./Pedido");
let Persona = class Persona extends typeorm_1.BaseEntity {
};
exports.Persona = Persona;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "idpersona", type: "varchar", length: 150 }),
    __metadata("design:type", String)
], Persona.prototype, "IdPersona", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "nombre", type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Persona.prototype, "Nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "apellidopaterno", type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Persona.prototype, "ApellidoPaterno", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "apellidomaterno", type: "varchar", length: 100, nullable: true }),
    __metadata("design:type", String)
], Persona.prototype, "ApellidoMaterno", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fechadenacimiento", type: "date", nullable: true }),
    __metadata("design:type", Date)
], Persona.prototype, "FechaDeNacimiento", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fecharegistro", type: "date" }),
    __metadata("design:type", Date)
], Persona.prototype, "FechaRegistro", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fechaactualizacion", type: "date", nullable: true }),
    __metadata("design:type", Date)
], Persona.prototype, "FechaActualizacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "horaregistro", type: "time", nullable: true }),
    __metadata("design:type", String)
], Persona.prototype, "HoraRegistro", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "genero", type: "varchar", length: 100, nullable: true }),
    __metadata("design:type", String)
], Persona.prototype, "Genero", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "imagen", type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", String)
], Persona.prototype, "Imagen", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "tipo", type: "varchar", length: 50, nullable: true }),
    __metadata("design:type", String)
], Persona.prototype, "Tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "email", type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", String)
], Persona.prototype, "Email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "estado", type: "integer", default: 1 }),
    __metadata("design:type", Number)
], Persona.prototype, "Estado", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Empleado_1.Empleado, (empleado) => empleado.Persona),
    __metadata("design:type", Empleado_1.Empleado)
], Persona.prototype, "Empleado", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Usuario_1.Usuario, (usuario) => usuario.Persona),
    __metadata("design:type", Usuario_1.Usuario)
], Persona.prototype, "Usuario", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => DIreccion_1.Direccion, (direccion) => direccion.Persona, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "iddireccion" }),
    __metadata("design:type", DIreccion_1.Direccion)
], Persona.prototype, "Direccion", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Celular_1.Celular, (celular) => celular.Persona),
    __metadata("design:type", Array)
], Persona.prototype, "Celulares", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Documento_1.Documento, (documento) => documento.Persona),
    __metadata("design:type", Array)
], Persona.prototype, "Documento", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => AdmDatos_1.Administrardatos, (dato) => dato.Persona),
    __metadata("design:type", AdmDatos_1.Administrardatos)
], Persona.prototype, "Administrardatos", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Venta_1.Venta, (venta) => venta.Persona),
    __metadata("design:type", Array)
], Persona.prototype, "Venta", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Pedido_1.Pedido, (venta) => venta.Persona),
    __metadata("design:type", Array)
], Persona.prototype, "Pedido", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Proveedor_1.Proveedor, proveedor => proveedor.Persona),
    __metadata("design:type", Proveedor_1.Proveedor)
], Persona.prototype, "Proveedor", void 0);
exports.Persona = Persona = __decorate([
    (0, typeorm_1.Entity)()
], Persona);
