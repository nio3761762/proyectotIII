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
exports.Estado = void 0;
const typeorm_1 = require("typeorm");
const Persona_1 = require("./Persona");
const Usuario_1 = require("./Usuario");
const Rol_1 = require("./Rol");
const Sucursal_1 = require("./Sucursal");
const Celular_1 = require("./Celular");
const Producto_1 = require("./Producto");
const Comision_1 = require("./Comision");
const Categoria_1 = require("./Categoria");
const SubCategoria_1 = require("./SubCategoria");
const UnidadMedida_1 = require("./UnidadMedida");
const Venta_1 = require("./Venta");
const UsuarioSucursal_1 = require("./UsuarioSucursal");
const Presentacionproducto_1 = require("./Presentacionproducto");
const Precio_1 = require("./Precio");
const PromocionProducto_1 = require("./PromocionProducto");
const Promocion_1 = require("./Promocion");
const Proveedor_1 = require("./Proveedor");
const Presentacion_1 = require("./Presentacion");
const Pedido_1 = require("./Pedido");
const CategoriaMedida_1 = require("./CategoriaMedida");
const Entrega_1 = require("./Entrega");
const TrackingLink_1 = require("./TrackingLink");
const Repartidor_1 = require("./Repartidor");
const Distribucion_1 = require("./Distribucion");
const Compra_1 = require("./Compra");
let Estado = class Estado extends typeorm_1.BaseEntity {
};
exports.Estado = Estado;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "idestado", type: "integer" }),
    __metadata("design:type", Number)
], Estado.prototype, "IdEstado", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "nombre", type: "varchar", length: 50 }),
    __metadata("design:type", String)
], Estado.prototype, "Nombre", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Proveedor_1.Proveedor, (proveedor) => proveedor.Estado),
    __metadata("design:type", Array)
], Estado.prototype, "Proveedor", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Persona_1.Persona, (persona) => persona.Estado),
    __metadata("design:type", Array)
], Estado.prototype, "Persona", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Compra_1.Compra, (persona) => persona.Estado),
    __metadata("design:type", Array)
], Estado.prototype, "Compra", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Usuario_1.Usuario, (usuario) => usuario.Estado),
    __metadata("design:type", Array)
], Estado.prototype, "Usuario", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Celular_1.Celular, (celular) => celular.Estado),
    __metadata("design:type", Array)
], Estado.prototype, "Celular", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Rol_1.Rol, (rol) => rol.Estado),
    __metadata("design:type", Array)
], Estado.prototype, "Rol", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Producto_1.Producto, (producto) => producto.Estado),
    __metadata("design:type", Array)
], Estado.prototype, "Producto", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Promocion_1.Promocion, (producto) => producto.Estado),
    __metadata("design:type", Array)
], Estado.prototype, "Promocion", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => PromocionProducto_1.Promocionproducto, (producto) => producto.Estado),
    __metadata("design:type", Array)
], Estado.prototype, "Promocionproducto", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Comision_1.Comision, (comision) => comision.Estado),
    __metadata("design:type", Array)
], Estado.prototype, "Comision", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Categoria_1.Categoria, (categoria) => categoria.Estado),
    __metadata("design:type", Array)
], Estado.prototype, "Categoria", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => SubCategoria_1.Subcategoria, (subcategoria) => subcategoria.Estado),
    __metadata("design:type", Array)
], Estado.prototype, "Subcategoria", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => UnidadMedida_1.Unidadmedida, (unidadmedida) => unidadmedida.Estado),
    __metadata("design:type", Array)
], Estado.prototype, "Unidadmedida", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Venta_1.Venta, (venta) => venta.Estado),
    __metadata("design:type", Array)
], Estado.prototype, "Venta", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Repartidor_1.Repartidor, (venta) => venta.Estado),
    __metadata("design:type", Array)
], Estado.prototype, "Repartidor", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Sucursal_1.Sucursal, (sucursal) => sucursal.Estado),
    __metadata("design:type", Array)
], Estado.prototype, "Sucursal", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Precio_1.Precio, (precio) => precio.Estado),
    __metadata("design:type", Array)
], Estado.prototype, "Precio", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => UsuarioSucursal_1.Usuariosucursal, (sucursal) => sucursal.Estado),
    __metadata("design:type", Array)
], Estado.prototype, "Usuariosucursal", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Presentacionproducto_1.Presentacionproducto, (paquete) => paquete.Estado),
    __metadata("design:type", Array)
], Estado.prototype, "Paquete", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => TrackingLink_1.TrackingLink, (paquete) => paquete.Estado),
    __metadata("design:type", Array)
], Estado.prototype, "TrackingLink", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Presentacion_1.Presentacion, (presentacion) => presentacion.Estado),
    __metadata("design:type", Array)
], Estado.prototype, "Presentacion", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Pedido_1.Pedido, (pedido) => pedido.Estado),
    __metadata("design:type", Array)
], Estado.prototype, "Pedido", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Entrega_1.Entrega, (pedido) => pedido.Estado),
    __metadata("design:type", Array)
], Estado.prototype, "Entrega", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Distribucion_1.Distribucion, (pedido) => pedido.Estado),
    __metadata("design:type", Array)
], Estado.prototype, "Distribuciones", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CategoriaMedida_1.Categoriamedida, (categoria) => categoria.Estado),
    __metadata("design:type", Array)
], Estado.prototype, "Categoriamedida", void 0);
exports.Estado = Estado = __decorate([
    (0, typeorm_1.Entity)()
], Estado);
