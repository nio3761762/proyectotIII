
import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import bcrypt from "bcryptjs";
import { Estado } from "./Estado";
import { Tipopromocion } from "./Tipopromocion";
import { Promocion } from "./Promocion";
import { Producto } from "./Producto";
import { Unidadmedida } from "./UnidadMedida";
import { Presentacionproducto } from "./Presentacionproducto";

@Entity()
//@Check(`"Estado" IN (0, 1)`)
export class Promocionproducto extends BaseEntity {
  @PrimaryColumn({ name: 'idpromocionproducto', type: "varchar", length: 100 })
  IdPromocionProducto: string;

  @Column({ name: 'cantidad', type: "integer" })
  Cantidad: number;

  @Column({ name: 'descuento', type: "numeric", precision: 10, scale: 2 })
  Descuento: number;

  @ManyToOne(() => Producto, (producto) => producto.Promocionproducto,{nullable:true})
  @JoinColumn({ name: "idproducto" })
  Producto: Producto;

  @ManyToOne(() => Presentacionproducto, (presentacion) => presentacion.Promocionproducto,{nullable:true})
  @JoinColumn({ name: "idpaquete" })
  Paquete: Presentacionproducto;

  @ManyToOne(() => Promocion, (promocion) => promocion.Promocionproducto)
  @JoinColumn({ name: "idpromocion" })
  Promocion: Promocion;

  @ManyToOne(() => Estado, (estado) => estado.Promocionproducto)
  @JoinColumn({ name: "idestado" })
  Estado: Estado;
  
}