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
exports.CarritoDeCompras = void 0;
const typeorm_1 = require("typeorm");
const Users_1 = require("./Users");
const ProductoCarrito_1 = require("./ProductoCarrito");
let CarritoDeCompras = class CarritoDeCompras extends typeorm_1.BaseEntity {
};
exports.CarritoDeCompras = CarritoDeCompras;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CarritoDeCompras.prototype, "Id_Carrito", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 8 }),
    __metadata("design:type", String)
], CarritoDeCompras.prototype, "Usuario_Id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", Date)
], CarritoDeCompras.prototype, "Fecha", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer" }),
    __metadata("design:type", Number)
], CarritoDeCompras.prototype, "Estado", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Users_1.Usuario, (usuario) => usuario.carrito),
    (0, typeorm_1.JoinColumn)({ name: "Usuario_Id" }),
    __metadata("design:type", Users_1.Usuario)
], CarritoDeCompras.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ProductoCarrito_1.ProductoCarrito, (productoCarrito) => productoCarrito.carrito),
    __metadata("design:type", Array)
], CarritoDeCompras.prototype, "carritoc", void 0);
exports.CarritoDeCompras = CarritoDeCompras = __decorate([
    (0, typeorm_1.Entity)()
], CarritoDeCompras);
