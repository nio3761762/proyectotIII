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
exports.Envio = void 0;
const typeorm_1 = require("typeorm");
const Pedido_1 = require("./Pedido");
const Empleado_1 = require("./Empleado");
let Envio = class Envio extends typeorm_1.BaseEntity {
};
exports.Envio = Envio;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Envio.prototype, "Id_Envio", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer" }),
    __metadata("design:type", Number)
], Envio.prototype, "Id_Pedido", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer" }),
    __metadata("design:type", Number)
], Envio.prototype, "Empleado_Id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255 }),
    __metadata("design:type", String)
], Envio.prototype, "DireccionEnvio", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", Date)
], Envio.prototype, "FechaEnvio", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer" }),
    __metadata("design:type", Number)
], Envio.prototype, "Estado", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Pedido_1.Pedido, (pedido) => pedido.envio),
    (0, typeorm_1.JoinColumn)({ name: "Id_Pedido" }),
    __metadata("design:type", Pedido_1.Pedido)
], Envio.prototype, "pedido", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Empleado_1.Empleado, (empleado) => empleado.envio),
    (0, typeorm_1.JoinColumn)({ name: "Empleado_Id" }),
    __metadata("design:type", Empleado_1.Empleado)
], Envio.prototype, "empleado", void 0);
exports.Envio = Envio = __decorate([
    (0, typeorm_1.Entity)()
], Envio);
