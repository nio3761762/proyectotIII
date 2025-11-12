
import { Entity, Column, PrimaryColumn, BaseEntity, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { Repartidor } from "./Repartidor";
import { Entrega } from "./Entrega";

@Entity()
export class  SeguimientoEntrega extends BaseEntity {

  @PrimaryColumn({ name: "idseguimiento", type: "varchar", length: 100 })
  IdSeguimiento: string;

  // Muchos registros de seguimiento pertenecen a un repartidor
  // @ManyToOne(() => Repartidor)
  // @JoinColumn({ name: "idrepartidor" })
  // Repartidor: Repartidor;

  @ManyToOne(() => Entrega, (entrega) => entrega.Seguimiento )
  @JoinColumn({ name: "identrega" })
  Entrega: Entrega;

  @Column({ name: "latitud", type: "decimal", precision: 10, scale: 8 })
  Latitud: number;

  @Column({ name: "longitud", type: "decimal", precision: 11, scale: 8 })
  Longitud: number;

  @CreateDateColumn({ name: "fecha_hora_ubicacion", type: "timestamp" })
  FechaHoraUbicacion: Date;

  
}
