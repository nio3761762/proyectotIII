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
exports.Enlace = void 0;
const typeorm_1 = require("typeorm");
const Menu_1 = require("./Menu");
const Factura_1 = require("./Factura");
let Enlace = class Enlace extends typeorm_1.BaseEntity {
};
exports.Enlace = Enlace;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "idenlace", type: "varchar", length: 50 }),
    __metadata("design:type", String)
], Enlace.prototype, "IdEnlace", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "enlace", type: "varchar", length: 255 }),
    __metadata("design:type", String)
], Enlace.prototype, "Enlace", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Menu_1.Menu, (menu) => menu.Enlace),
    __metadata("design:type", Menu_1.Menu)
], Enlace.prototype, "Menu", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Factura_1.Factura, (factura) => factura.Enlace),
    __metadata("design:type", Factura_1.Factura)
], Enlace.prototype, "Factura", void 0);
exports.Enlace = Enlace = __decorate([
    (0, typeorm_1.Entity)()
], Enlace);
