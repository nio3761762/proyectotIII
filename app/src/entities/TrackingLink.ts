
import { Entity, Column, PrimaryColumn, BaseEntity, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { Repartidor } from "./Repartidor";
import { Estado } from "./Estado";

@Entity()
export class TrackingLink extends BaseEntity {

  // Token único (ej: un UUID) que se usará en la URL.
  @PrimaryColumn({ name: "idtracking", type: "varchar", length: 50 })
  IdTracking: string;

  @Column({ name: "token", type: "varchar", length: 255 })
  Token: string;

  // Varios enlaces pueden pertenecer a un repartidor (aunque podrías tener solo uno activo a la vez).
  @ManyToOne(() => Repartidor, (repartidor)=> repartidor.TrackingLink)
  @JoinColumn({ name: "idrepartidor" })
  Repartidor: Repartidor;

  @Column({ name: "fechaexpiracion", type: "date" })
  FechaExpiracion: Date;

  @ManyToOne(() => Estado, (estado) => estado.TrackingLink)
  @JoinColumn({ name: "idestado" })
  Estado: Estado;

  @Column({ name: "fechacreacion", type: "date" })
  FechaCreacion: Date;

}
