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
exports.ContadorSecuencias = void 0;
const typeorm_1 = require("typeorm");
let ContadorSecuencias = class ContadorSecuencias extends typeorm_1.BaseEntity {
};
exports.ContadorSecuencias = ContadorSecuencias;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'prefijo', type: "varchar", length: 5 }),
    __metadata("design:type", String)
], ContadorSecuencias.prototype, "prefijo", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'fecha', type: "date" }),
    __metadata("design:type", Date)
], ContadorSecuencias.prototype, "fecha", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ultima_secuencia', type: "integer" }),
    __metadata("design:type", Number)
], ContadorSecuencias.prototype, "ultimaSecuencia", void 0);
exports.ContadorSecuencias = ContadorSecuencias = __decorate([
    (0, typeorm_1.Entity)("contadorsecuencias")
], ContadorSecuencias);
