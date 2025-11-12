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
exports.Menupermiso = void 0;
const typeorm_1 = require("typeorm");
const Menu_1 = require("./Menu");
const Permiso_1 = require("./Permiso");
let Menupermiso = class Menupermiso extends typeorm_1.BaseEntity {
};
exports.Menupermiso = Menupermiso;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'idmenupermiso', type: "varchar", length: 50 }),
    __metadata("design:type", String)
], Menupermiso.prototype, "IdMenuPermiso", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Menu_1.Menu, (menu) => menu.Menupermiso),
    (0, typeorm_1.JoinColumn)({ name: "idmenu" }),
    __metadata("design:type", Menu_1.Menu)
], Menupermiso.prototype, "menu", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Permiso_1.Permiso, (permiso) => permiso.Menupermiso),
    (0, typeorm_1.JoinColumn)({ name: "idpermiso" }),
    __metadata("design:type", Permiso_1.Permiso)
], Menupermiso.prototype, "Permiso", void 0);
exports.Menupermiso = Menupermiso = __decorate([
    (0, typeorm_1.Entity)()
], Menupermiso);
