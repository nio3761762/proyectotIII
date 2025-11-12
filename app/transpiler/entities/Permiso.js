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
exports.Permiso = void 0;
const typeorm_1 = require("typeorm");
const RolMenu_1 = require("./RolMenu");
const MenuPermiso_1 = require("./MenuPermiso");
let Permiso = class Permiso extends typeorm_1.BaseEntity {
};
exports.Permiso = Permiso;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'idpermiso', type: "varchar", length: 50 }),
    __metadata("design:type", String)
], Permiso.prototype, "IdPermiso", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre', type: "varchar", length: 255 }),
    __metadata("design:type", String)
], Permiso.prototype, "Nombre", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => RolMenu_1.Rolmenu, (rolmenu) => rolmenu.Permiso),
    __metadata("design:type", Array)
], Permiso.prototype, "Rolmenu", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => MenuPermiso_1.Menupermiso, (rolmenu) => rolmenu.Permiso),
    __metadata("design:type", Array)
], Permiso.prototype, "Menupermiso", void 0);
exports.Permiso = Permiso = __decorate([
    (0, typeorm_1.Entity)()
    //@Check(`"Estado" IN (0, 1)`)
], Permiso);
