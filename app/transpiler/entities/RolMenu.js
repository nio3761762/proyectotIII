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
exports.Rolmenu = void 0;
const typeorm_1 = require("typeorm");
const Rol_1 = require("./Rol");
const Menu_1 = require("./Menu");
const Permiso_1 = require("./Permiso");
let Rolmenu = class Rolmenu extends typeorm_1.BaseEntity {
};
exports.Rolmenu = Rolmenu;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'idrolmenu', type: "varchar", length: 50 }),
    __metadata("design:type", String)
], Rolmenu.prototype, "IdRolMenu", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecharegistro', type: "date" }),
    __metadata("design:type", Date)
], Rolmenu.prototype, "FechaRegistro", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Rol_1.Rol, (rol) => rol.rolMenus),
    (0, typeorm_1.JoinColumn)({ name: "idrol" }),
    __metadata("design:type", Rol_1.Rol)
], Rolmenu.prototype, "rol", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Permiso_1.Permiso, (permiso) => permiso.Rolmenu, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "idpermiso" }),
    __metadata("design:type", Permiso_1.Permiso)
], Rolmenu.prototype, "Permiso", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Menu_1.Menu, (menu) => menu.rolMenus),
    (0, typeorm_1.JoinColumn)({ name: "idmenu" }),
    __metadata("design:type", Menu_1.Menu)
], Rolmenu.prototype, "menu", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'permitido', type: "integer" }),
    __metadata("design:type", Number)
], Rolmenu.prototype, "Permitido", void 0);
exports.Rolmenu = Rolmenu = __decorate([
    (0, typeorm_1.Entity)()
], Rolmenu);
