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
const Email_1 = require("./Email");
const Genero_1 = require("./Genero");
const Estado_1 = require("./Estado");
const Imagen_1 = require("./Imagen");
const Salario_1 = require("./Salario");
const Venta_1 = require("./Venta");
const Proveedor_1 = require("./Proveedor");
const AdmDatos_1 = require("./AdmDatos");
const Documento_1 = require("./Documento");
const Repartidor_1 = require("./Repartidor");
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
    (0, typeorm_1.OneToOne)(() => Usuario_1.Usuario, (usuario) => usuario.Persona),
    __metadata("design:type", Usuario_1.Usuario)
], Persona.prototype, "Usuario", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Imagen_1.Imagen, (imagen) => imagen.Persona, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idimagen" }),
    __metadata("design:type", Imagen_1.Imagen)
], Persona.prototype, "Imagen", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Email_1.Email, (email) => email.Persona, { nullable: true }),
    __metadata("design:type", Email_1.Email)
], Persona.prototype, "Email", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => DIreccion_1.Direccion, (direccion) => direccion.Persona, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "iddireccion" }),
    __metadata("design:type", DIreccion_1.Direccion)
], Persona.prototype, "Direccion", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Genero_1.Genero, (genero) => genero.Persona, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idgenero" }),
    __metadata("design:type", Genero_1.Genero)
], Persona.prototype, "Genero", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Estado_1.Estado, (estado) => estado.Persona),
    (0, typeorm_1.JoinColumn)({ name: "idestado" }),
    __metadata("design:type", Estado_1.Estado)
], Persona.prototype, "Estado", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Salario_1.Salario, (salario) => salario.Persona, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idsalario" }),
    __metadata("design:type", Salario_1.Salario)
], Persona.prototype, "Salario", void 0);
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
    (0, typeorm_1.OneToOne)(() => Proveedor_1.Proveedor, proveedor => proveedor.Persona),
    __metadata("design:type", Proveedor_1.Proveedor)
], Persona.prototype, "Proveedor", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Repartidor_1.Repartidor, (repartidor) => repartidor.Persona),
    __metadata("design:type", Repartidor_1.Repartidor)
], Persona.prototype, "Repartidor", void 0);
exports.Persona = Persona = __decorate([
    (0, typeorm_1.Entity)()
], Persona);
