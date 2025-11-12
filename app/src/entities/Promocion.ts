
import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import bcrypt from "bcryptjs";
import { Estado } from "./Estado";
import { Tipopromocion } from "./Tipopromocion";
import { Promocionproducto } from "./PromocionProducto";
import { Ingrediente } from "./Ingrediente";
import { Detalleventa } from "./DetalleVenta";
import { Rango } from "./Rango";
import { Imagen } from "./Imagen";
import { Detallepedido } from "./DetallePedido";
import { Detalledistribucion } from "./Detalledistribucion";

@Entity()
//@Check(`"Estado" IN (0, 1)`)
export class Promocion extends BaseEntity {
  @PrimaryColumn({ name: 'idpromocion', type: "varchar", length: 100 })
  IdPromocion: string;

  @Column({ name: 'nombre', type: "varchar", length: 100 })
  Nombre: string;

  @Column({ name: 'descripcion', type: "varchar", length: 255 })
  Descripcion: string;

  @Column({ name: "fecharegistro", type: "date" })
  FechaRegistro: Date;

  @Column({ name: "fechaactualizacion", type: "date", nullable: true })
  Fechaactualizacion: Date;

  @ManyToOne(() => Estado, (estado) => estado.Promocion)
  @JoinColumn({ name: "idestado" })
  Estado: Estado;

  @ManyToOne(() => Tipopromocion, (tipopromocion) => tipopromocion.Promocion)
  @JoinColumn({ name: "idtipopromocion" })
  Tipopromocion: Tipopromocion;

  @OneToMany(() => Promocionproducto, (promocion) => promocion.Promocion)
  Promocionproducto: Promocionproducto[];

  @OneToOne(() => Rango, (rango) => rango.Promocion)
  Rango: Rango;

  @OneToOne(() => Imagen, (rango) => rango.Promocion)
  @JoinColumn({ name: "idimagen" })
  Imagen: Imagen;

  @OneToMany(() => Detalleventa, (detalleventa) => detalleventa.Promocion)
  Detalleventa: Detalleventa[];

  @OneToMany(() => Detallepedido, (detalleventa) => detalleventa.Promocion)
  Detallepedido: Detallepedido[];


}