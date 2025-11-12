
import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import bcrypt from "bcryptjs";
import { Subcategoria } from "./SubCategoria";
import { Marca } from "./Marca";
import { Tipoproducto } from "./TipoProducto";
import { Unidadmedida } from "./UnidadMedida";
import { Precio } from "./Precio";
import { Estado } from "./Estado";
import { Imagen } from "./Imagen";
import { Comision } from "./Comision";
import { Promocionproducto } from "./PromocionProducto";
import { Ingrediente } from "./Ingrediente";
import { Detalleventa } from "./DetalleVenta";
import { Productosucursal } from "./ProductoSucursal";
import { Productomedida } from "./ProductoMedida";
import { Presentacionproducto } from "./Presentacionproducto";
import { Detallepedido } from "./DetallePedido";
import { Detalledistribucion } from "./Detalledistribucion";
import { Productostock } from "./ProductoStock";

@Entity()
//@Check(`"Estado" IN (0, 1)`)
export class Producto extends BaseEntity {
  @PrimaryColumn({ name: 'idproducto', type: "varchar", length: 100 })
  IdProducto: string;

  @Column({ name: 'nombre', type: "varchar", length: 100 })
  Nombre: string;
  
  @Column({ name: 'descripcion', type: "varchar", length: 255,  nullable: true })
  Descripcion: string;

  @Column({ name: 'cantidad', type: "integer", nullable: true, default: 0 })                                                                                                  
  Cantidad: number; 

  @Column({ name: "fecharegistro", type: "date", nullable: true })
  FechaRegistro: Date;

  @Column({ name: "horaregistro", type: "time", nullable: true })
  HoraRegistro: string;

  @Column({ name: "fechaactualizacion", type: "date", nullable: true })
  Fechaactualizacion: Date;

  @Column({ name: "fechavencimiento", type: "date", nullable: true })
  FechaVencimiento: Date;

  @Column({ name: "stockminimo", type: "integer", nullable: true })
  StockMinimo: number;

  @ManyToOne(() => Subcategoria, (subcategoria) => subcategoria.Producto, { nullable: true })
  @JoinColumn({ name: "idsubcategoria" })
  Subcategoria: Subcategoria;

  @ManyToOne(() => Estado, (estado) => estado.Producto)
  @JoinColumn({ name: "idestado" })
  Estado: Estado;

  @ManyToOne(() => Marca, (marca) => marca.Producto, { nullable: true })
  @JoinColumn({ name: "idmarca" })
  Marca: Marca;

  @ManyToOne(() => Tipoproducto, (tipoproducto) => tipoproducto.Producto, { nullable: true })
  @JoinColumn({ name: "idtipoproducto" })
  Tipoproducto: Tipoproducto;

  // @ManyToOne(() => Unidadmedida, (medida) => medida.Producto, { nullable: true })
  // @JoinColumn({ name: "idunidadmedida" })
  // Unidadmedida: Unidadmedida;

  @OneToOne(() => Imagen, (imagen) => imagen.Producto, { nullable: true })
  @JoinColumn({ name: "idimagen" })
  Imagen: Imagen;

  // @OneToMany(() => Precio, (precio) => precio.Proucto)
  // Precio: Precio[];

  @OneToMany(() => Comision, (comision) => comision.Producto)
  Comision: Comision[];

  @OneToMany(() => Promocionproducto, (promocionproducto) => promocionproducto.Producto)
  Promocionproducto: Promocionproducto[];

  @OneToMany(() => Ingrediente, (ingrediente) => ingrediente.Ingredientes)
  Ingrediente: Ingrediente[];

  @OneToMany(() => Ingrediente, (ingrediente) => ingrediente.Producto)
  Producto: Ingrediente[];

  @OneToMany(() => Productosucursal, (productosucursal) => productosucursal.Producto)
  Productosucursal: Productosucursal[];

  @OneToMany(() => Productostock, (productosucursal) => productosucursal.Producto)
  Productostock: Productostock[];

  @OneToMany(() => Productomedida, (productomedida) => productomedida.Producto)
  Productomedida: Productomedida[];

   @OneToMany(() => Presentacionproducto, (paquete) => paquete.Producto)
  Paquete: Presentacionproducto[];

  @OneToMany(() => Detalleventa, (detalleventa) => detalleventa.Producto)
  Detalleventa: Detalleventa[];

  @OneToMany(() => Detallepedido, (detalleventa) => detalleventa.Producto)
  Detallepedido: Detallepedido[];

   @OneToMany(() => Detalledistribucion, (detalleventa) => detalleventa.Producto)
  Detalledistribucion: Detalledistribucion[];

}

