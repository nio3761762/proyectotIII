
import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import bcrypt from "bcryptjs";
import { Tipopromocion } from "./Tipopromocion";
import { Promocionproducto } from "./PromocionProducto";
import { Detalleventa } from "./DetalleVenta";
import { Rango } from "./Rango";
import { Detallepedido } from "./DetallePedido";

@Entity()
export class Promocion extends BaseEntity {
  @PrimaryColumn({ name: 'idpromocion', type: "varchar", length: 100 })
  IdPromocion: string;

  @Column({ name: 'nombre', type: "varchar", length: 100 })
  Nombre: string;

  @Column({ name: 'descripcion', type: "text", nullable:true })
  Descripcion: string;
  
   @Column({ name: "preciopromocion", type: "numeric", precision: 10, scale: 2, default:0 })
  Preciopromocion: number; 

  @Column({ name: "fecharegistro", type: "date" })
  FechaRegistro: Date;

  @Column({ name: "fechaactualizacion", type: "date", nullable: true })
  Fechaactualizacion: Date;
   
  @Column({ name: "limiteuso", type: "integer", nullable: true })
  LimiteUso: number;
  
  @Column({ name: "tipodescuento", type: "varchar", length: 20 , nullable: true })
  TipoDescuento: string; // 'porcentaje' | 'monto'

  @Column({ name: "estado", type: "integer",default: 1}) 
  Estado: number; 

  @ManyToOne(() => Tipopromocion, (tipopromocion) => tipopromocion.Promocion)
  @JoinColumn({ name: "idtipopromocion" })
  Tipopromocion: Tipopromocion;

  @OneToMany(() => Promocionproducto, (promocion) => promocion.Promocion)
  Promocionproducto: Promocionproducto[];

  @OneToOne(() => Rango, (rango) => rango.Promocion)
  Rango: Rango;
 
  @Column({ name: "imagen", type: "varchar", length: 255, nullable: true })
  Imagen: string;  

  @OneToMany(() => Detalleventa, (detalleventa) => detalleventa.Promocion)
  Detalleventa: Detalleventa[];

  @OneToMany(() => Detallepedido, (detalleventa) => detalleventa.Promocion)
  Detallepedido: Detallepedido[];


}