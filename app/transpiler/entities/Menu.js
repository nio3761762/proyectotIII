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
exports.Menu = void 0;
const typeorm_1 = require("typeorm");
const RolMenu_1 = require("./RolMenu");
const Icono_1 = require("./Icono");
const Enlace_1 = require("./Enlace");
const MenuPermiso_1 = require("./MenuPermiso");
let Menu = class Menu extends typeorm_1.BaseEntity {
};
exports.Menu = Menu;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'idmenu', type: "varchar", length: 50 }),
    __metadata("design:type", String)
], Menu.prototype, "IdMenu", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre', type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Menu.prototype, "Nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'visible', type: "integer" }),
    __metadata("design:type", Number)
], Menu.prototype, "Visible", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Icono_1.Icono, (icono) => icono.Menu),
    (0, typeorm_1.JoinColumn)({ name: "idicono" }),
    __metadata("design:type", Icono_1.Icono)
], Menu.prototype, "Icono", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Enlace_1.Enlace, (enlace) => enlace.Menu),
    (0, typeorm_1.JoinColumn)({ name: "idenlace" }),
    __metadata("design:type", Enlace_1.Enlace)
], Menu.prototype, "Enlace", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => RolMenu_1.Rolmenu, (rolmenu) => rolmenu.menu),
    __metadata("design:type", Array)
], Menu.prototype, "rolMenus", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => MenuPermiso_1.Menupermiso, (rolmenu) => rolmenu.menu),
    __metadata("design:type", Array)
], Menu.prototype, "Menupermiso", void 0);
exports.Menu = Menu = __decorate([
    (0, typeorm_1.Entity)()
    //@Check(`"Estado" IN (0, 1)`)
], Menu);
