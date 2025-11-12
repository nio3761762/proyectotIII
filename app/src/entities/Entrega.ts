import { BaseEntity, Column, Entity, PrimaryColumn, OneToMany, OneToOne, JoinColumn, ManyToOne } from "typeorm";
import { Venta } from "./Venta";
import { Tipopedido } from "./TipoPedido";
import { Direccion } from "./DIreccion";
import { Pedido } from "./Pedido";
import { Tipoentrega } from "./TipoEntrega";
import { Estado } from "./Estado";
import { SeguimientoEntrega } from "./SeguimientoRepartidor";
import { Repartidor } from "./Repartidor";
import { Distribucion } from "./Distribucion";

@Entity()
export class Entrega extends BaseEntity {
  @PrimaryColumn({ name: "identrega", type: "varchar", length: 50 })
  IdEntrega: string;

  @Column({ name: "fechaentrega", type: "date" })
  FechaEntrega: Date;

  @Column({ name: "horaentrega", type: "time" })
  HoraEntrega: string;

  @Column({ name: 'costoentrega', type: "numeric", precision: 10, scale: 2 })
  CostoEntrega: number;

  @ManyToOne(() => Direccion, (direccion) => direccion.Entrega)
  @JoinColumn({ name: "iddireccion" })
  Direccion: Direccion;

  @ManyToOne(() => Tipoentrega, (tipoentrega) => tipoentrega.Entrega)
  @JoinColumn({ name: "idtipoentrega" })
  Tipoentrega: Tipoentrega;

  @OneToOne(() => Pedido, (pedido) => pedido.Entrega, { nullable: true })
  @JoinColumn({ name: "idpedido" })
  Pedido: Pedido;

  @OneToOne(() => Distribucion, (pedido) => pedido.Entrega, { nullable: true })
  @JoinColumn({ name: "iddistribucion" })
  Distribucion: Distribucion;

  @ManyToOne(() => Estado, (estado) => estado.Entrega)
  @JoinColumn({ name: "idestado" })
  Estado: Estado;

  @ManyToOne(() => Repartidor, (repartidor) => repartidor.Entrega, { nullable: true })
  @JoinColumn({ name: "idrepartidor" })
  Repartidor: Repartidor;

  @OneToMany(() => SeguimientoEntrega, (repartidor) => repartidor.Entrega)
  Seguimiento: SeguimientoEntrega[];
}