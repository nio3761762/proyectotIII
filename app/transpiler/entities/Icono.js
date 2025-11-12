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
exports.Icono = void 0;
const typeorm_1 = require("typeorm");
const Menu_1 = require("./Menu");
let Icono = class Icono extends typeorm_1.BaseEntity {
};
exports.Icono = Icono;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "idicono", type: "varchar", length: 50 }),
    __metadata("design:type", String)
], Icono.prototype, "IdIcono", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "icono", type: "varchar", length: 255 }),
    __metadata("design:type", String)
], Icono.prototype, "Icono", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Menu_1.Menu, (menu) => menu.Icono),
    __metadata("design:type", Menu_1.Menu)
], Icono.prototype, "Menu", void 0);
exports.Icono = Icono = __decorate([
    (0, typeorm_1.Entity)()
], Icono);
