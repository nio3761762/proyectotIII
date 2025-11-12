import { BaseEntity, Column, Entity, PrimaryColumn, OneToMany } from "typeorm";
import { Persona } from "./Persona";
import { Usuario } from "./Usuario";
import { Rol } from "./Rol";
import { Sucursal } from "./Sucursal";
import { Celular } from "./Celular";
import { Producto } from "./Producto";
import { Comision } from "./Comision";
import { Categoria } from "./Categoria";
import { Subcategoria } from "./SubCategoria";
import { Unidadmedida } from "./UnidadMedida";
import { Venta } from "./Venta";
import { Usuariosucursal } from "./UsuarioSucursal";
import { Presentacionproducto } from "./Presentacionproducto";
import { Precio } from "./Precio";
import { Promocionproducto } from "./PromocionProducto";
import { Promocion } from "./Promocion";
import { Proveedor } from "./Proveedor";
import { Presentacion } from "./Presentacion";
import { Pedido } from "./Pedido";
import { Categoriamedida } from "./CategoriaMedida";
import { Entrega } from "./Entrega";
import { TrackingLink } from "./TrackingLink";
import { Repartidor } from "./Repartidor";
import { Distribucion } from "./Distribucion";
import { Compra } from "./Compra";

@Entity()
export class Estado extends BaseEntity {
  @PrimaryColumn({ name: "idestado", type: "integer" })
  IdEstado: number;

  @Column({ name: "nombre", type: "varchar", length: 50 })
  Nombre: string;
  
  @OneToMany(() => Proveedor, (proveedor) => proveedor.Estado)
  Proveedor: Proveedor[];

  @OneToMany(() => Persona, (persona) => persona.Estado)
  Persona: Persona[];

  @OneToMany(() => Compra, (persona) => persona.Estado)
  Compra: Compra[];

  @OneToMany(() => Usuario, (usuario) => usuario.Estado)
  Usuario: Usuario[];

  @OneToMany(() => Celular, (celular) => celular.Estado)
  Celular: Celular[];

  @OneToMany(() => Rol, (rol) => rol.Estado)
  Rol: Rol[];

  @OneToMany(() => Producto, (producto) => producto.Estado)
  Producto: Producto[];

  @OneToMany(() => Promocion, (producto) => producto.Estado)
  Promocion: Promocion[];

  @OneToMany(() => Promocionproducto, (producto) => producto.Estado)
  Promocionproducto: Promocionproducto[];

  @OneToMany(() => Comision, (comision) => comision.Estado)
  Comision: Comision[];

  @OneToMany(() => Categoria, (categoria) => categoria.Estado)
  Categoria: Categoria[];

  @OneToMany(() => Subcategoria, (subcategoria) => subcategoria.Estado)
  Subcategoria: Subcategoria[];

  @OneToMany(() => Unidadmedida, (unidadmedida) => unidadmedida.Estado)
  Unidadmedida: Unidadmedida[];

  @OneToMany(() => Venta, (venta) => venta.Estado)
  Venta: Venta[];
  
   @OneToMany(() => Repartidor, (venta) => venta.Estado)
  Repartidor: Repartidor[];

  @OneToMany(() => Sucursal, (sucursal) => sucursal.Estado)
  Sucursal: Sucursal[];

  @OneToMany(() => Precio, (precio) => precio.Estado)
  Precio: Precio[];

  @OneToMany(() => Usuariosucursal, (sucursal) => sucursal.Estado)
  Usuariosucursal: Usuariosucursal[];

  @OneToMany(() => Presentacionproducto, (paquete) => paquete.Estado)
  Paquete: Presentacionproducto[];
   
@OneToMany(() => TrackingLink, (paquete) => paquete.Estado)
  TrackingLink: TrackingLink[];

   @OneToMany(() => Presentacion, (presentacion) => presentacion.Estado)
  Presentacion: Presentacion[];

   @OneToMany(() => Pedido, (pedido) => pedido.Estado)
  Pedido: Pedido[];

  @OneToMany(() => Entrega, (pedido) => pedido.Estado)
  Entrega: Entrega[];

   @OneToMany(() => Distribucion, (pedido) => pedido.Estado)
  Distribuciones: Distribucion[];


  @OneToMany(() => Categoriamedida, (categoria) => categoria.Estado)
  Categoriamedida: Categoriamedida[];
}