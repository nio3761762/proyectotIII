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
exports.Usuario = void 0;
const typeorm_1 = require("typeorm");
const Persona_1 = require("./Persona");
const RolUsuario_1 = require("./RolUsuario");
const Venta_1 = require("./Venta");
const Pedido_1 = require("./Pedido");
let Usuario = class Usuario extends typeorm_1.BaseEntity {
};
exports.Usuario = Usuario;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'idusuario', type: "varchar", length: 150 }),
    __metadata("design:type", String)
], Usuario.prototype, "IdUsuario", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contrasena', type: "varchar", length: 150 }),
    __metadata("design:type", String)
], Usuario.prototype, "Contrasena", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'username', type: "varchar", length: 150, nullable: true }),
    __metadata("design:type", String)
], Usuario.prototype, "Username", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 10, nullable: true }),
    __metadata("design:type", Object)
], Usuario.prototype, "PinRecuperacion", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Persona_1.Persona, (persona) => persona.Usuario),
    (0, typeorm_1.JoinColumn)({ name: "idpersona" }),
    __metadata("design:type", Persona_1.Persona)
], Usuario.prototype, "Persona", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "estado", type: "integer", default: 1 }),
    __metadata("design:type", Number)
], Usuario.prototype, "Estado", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => RolUsuario_1.Rolusuario, (rolusuario) => rolusuario.Usuario),
    __metadata("design:type", Array)
], Usuario.prototype, "Rolusuario", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Venta_1.Venta, (venta) => venta.Usuario),
    __metadata("design:type", Array)
], Usuario.prototype, "Venta", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Pedido_1.Pedido, (pedido) => pedido.Usuario),
    __metadata("design:type", Array)
], Usuario.prototype, "Pedido", void 0);
exports.Usuario = Usuario = __decorate([
    (0, typeorm_1.Entity)()
    //@Check(`"Estado" IN (0, 1)`)
], Usuario);
