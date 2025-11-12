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
exports.Reportes = void 0;
const typeorm_1 = require("typeorm");
const Users_1 = require("./Users");
let Reportes = class Reportes extends typeorm_1.BaseEntity {
};
exports.Reportes = Reportes;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Reportes.prototype, "Id_Reporte", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 8 }),
    __metadata("design:type", String)
], Reportes.prototype, "Usuario_Id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", Date)
], Reportes.prototype, "FechaCreacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 200 }),
    __metadata("design:type", String)
], Reportes.prototype, "FiltrosAplicados", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 300 }),
    __metadata("design:type", String)
], Reportes.prototype, "UbicacionArchivo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Reportes.prototype, "Tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer" }),
    __metadata("design:type", Number)
], Reportes.prototype, "Estado", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Users_1.Usuario, (usuario) => usuario.reporte),
    (0, typeorm_1.JoinColumn)({ name: "Usuario_Id" }),
    __metadata("design:type", Users_1.Usuario)
], Reportes.prototype, "usuario", void 0);
exports.Reportes = Reportes = __decorate([
    (0, typeorm_1.Entity)()
], Reportes);
