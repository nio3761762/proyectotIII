
import { Entity, Column, PrimaryColumn, BaseEntity, ManyToOne, JoinColumn, OneToMany, OneToOne } from "typeorm";
import { Repartidor } from "./Repartidor";
import { Entrega } from "./Entrega";
import { Pedido } from "./Pedido";
import { Estado } from "./Estado";
import { Sucursal } from "./Sucursal";
import { Detalledistribucion } from "./Detalledistribucion";

@Entity()
export class Distribucion extends BaseEntity {

  @PrimaryColumn({ name: "iddistribucion", type: "varchar", length: 100 })
  IdDistribucion: string;

  @Column({ name: "fecha_distribucion", type: "date" })
  FechaDistribucion: Date;
  
  @Column({ name: "hora_distribucion", type: "time" })
  HoraDistribucion: string;

  @Column({ name: "origen", type: "varchar", length: 50 })
  Origen: string;


  @ManyToOne(() => Estado, (repartidor) => repartidor.Distribuciones)
  @JoinColumn({ name: "idestado" })
  Estado: Estado;

  // Muchas hojas de distribución pertenecen a un repartidor
  // @ManyToOne(() => Repartidor, (repartidor) => repartidor.Distribuciones)
  // @JoinColumn({ name: "idrepartidor" })
  // Repartidor: Repartidor;

  @OneToOne(() => Pedido, (repartidor) => repartidor.Distribuciones, { nullable: true })
  @JoinColumn({ name: "idpedido" })
  Pedido: Pedido;

  @ManyToOne(() => Sucursal, (sucursal) => sucursal.Distribucion, { nullable: true })
  @JoinColumn({ name: "idsucursal" })
  Sucursal: Sucursal | null; 

  
    @Column({ name: "observacion", type: "varchar", length:255, nullable:true })
    Observacion: string;

  @OneToMany(() => Detalledistribucion, (detalleventa) => detalleventa.Distribucion)
  Detalledistribucion : Detalledistribucion[];

   @OneToOne(() => Entrega, (pedido) => pedido.Distribucion)
      Entrega: Entrega;
  // Una hoja de distribución tiene muchos envíos
}
