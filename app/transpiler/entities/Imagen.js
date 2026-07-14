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
exports.Imagen = void 0;
const typeorm_1 = require("typeorm");
const Persona_1 = require("./Persona");
const Producto_1 = require("./Producto");
const Categoria_1 = require("./Categoria");
const Presentacionproducto_1 = require("./Presentacionproducto");
const Promocion_1 = require("./Promocion");
let Imagen = class Imagen extends typeorm_1.BaseEntity {
};
exports.Imagen = Imagen;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "idimagen", type: "varchar", length: 255 }),
    __metadata("design:type", String)
], Imagen.prototype, "IdImagen", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "url", type: "varchar", length: 255 }),
    __metadata("design:type", String)
], Imagen.prototype, "Url", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Persona_1.Persona, (persona) => persona.Imagen),
    __metadata("design:type", Persona_1.Persona)
], Imagen.prototype, "Persona", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Categoria_1.Categoria, (categoria) => categoria.Imagen),
    __metadata("design:type", Categoria_1.Categoria)
], Imagen.prototype, "Categoria", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Producto_1.Producto, (producto) => producto.Imagen),
    __metadata("design:type", Producto_1.Producto)
], Imagen.prototype, "Producto", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Presentacionproducto_1.Presentacionproducto, (dato) => dato.Imagen),
    __metadata("design:type", Presentacionproducto_1.Presentacionproducto)
], Imagen.prototype, "Paquete", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Promocion_1.Promocion, (rango) => rango.Imagen),
    __metadata("design:type", Promocion_1.Promocion)
], Imagen.prototype, "Promocion", void 0);
exports.Imagen = Imagen = __decorate([
    (0, typeorm_1.Entity)()
], Imagen);
