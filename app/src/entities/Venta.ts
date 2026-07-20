import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import { Usuario } from "./Usuario";
import { Persona } from "./Persona";
import { Detalleventa } from "./DetalleVenta";
import { Factura } from "./Factura";
import { Pago } from "./Pago";
import { Pedido } from "./Pedido";
import { Sucursal } from "./Sucursal";

@Entity()
export class Venta extends BaseEntity {
  @PrimaryColumn({ name: 'idventa', type: "varchar", length: 100 })
  IdVenta: string;

  @Column({ name: "fechaventa", type: "date", nullable:true })
  FechaVenta: Date;

  @Column({ name: "horaventa", type: "time" , nullable:true})
  HoraVenta: string;
  
  @Column({ name: "preciototal", type: "numeric", precision: 10, scale: 2, default:0 })
  PrecioTotal: number;

  @Column({ name: "gastoextra", type: "numeric", precision: 10, scale: 2, default: 0 })
  GastoExtra: number;

  @Column({ name: "estado", type: "integer",default: 1}) 
  Estado: number; 
  
  @ManyToOne(() => Usuario, (usuario) => usuario.Venta,{nullable:true})
  @JoinColumn({ name: "idusuario" })
  Usuario: Usuario;

  @ManyToOne(() => Persona, (persona) => persona.Venta,{nullable:true})
  @JoinColumn({ name: "idpersona" })
  Persona: Persona;

  @ManyToOne(() => Sucursal, (sucursal) => sucursal.Venta,{nullable:true})
  @JoinColumn({ name: "idsucursal" })
  Sucursal: Sucursal;

  @OneToMany(() => Detalleventa, (detalleventa) => detalleventa.Venta)
  Detalleventa: Detalleventa[];

  @OneToOne(() => Factura, (factura) => factura.Venta)
  Factura: Factura;

  @OneToMany(() => Pago, (pago) => pago.Venta)
  Pago: Pago[];
  
  @OneToOne(() => Pedido, (pedido) => pedido.Venta, { nullable:true})
   @JoinColumn({ name: "idpedido" })
  Pedido: Pedido;
}

