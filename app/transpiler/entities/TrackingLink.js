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
exports.TrackingLink = void 0;
const typeorm_1 = require("typeorm");
const Repartidor_1 = require("./Repartidor");
const Estado_1 = require("./Estado");
let TrackingLink = class TrackingLink extends typeorm_1.BaseEntity {
};
exports.TrackingLink = TrackingLink;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "idtracking", type: "varchar", length: 50 }),
    __metadata("design:type", String)
], TrackingLink.prototype, "IdTracking", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "token", type: "varchar", length: 255 }),
    __metadata("design:type", String)
], TrackingLink.prototype, "Token", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Repartidor_1.Repartidor, (repartidor) => repartidor.TrackingLink),
    (0, typeorm_1.JoinColumn)({ name: "idrepartidor" }),
    __metadata("design:type", Repartidor_1.Repartidor)
], TrackingLink.prototype, "Repartidor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fechaexpiracion", type: "date" }),
    __metadata("design:type", Date)
], TrackingLink.prototype, "FechaExpiracion", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Estado_1.Estado, (estado) => estado.TrackingLink),
    (0, typeorm_1.JoinColumn)({ name: "idestado" }),
    __metadata("design:type", Estado_1.Estado)
], TrackingLink.prototype, "Estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fechacreacion", type: "date" }),
    __metadata("design:type", Date)
], TrackingLink.prototype, "FechaCreacion", void 0);
exports.TrackingLink = TrackingLink = __decorate([
    (0, typeorm_1.Entity)()
], TrackingLink);
