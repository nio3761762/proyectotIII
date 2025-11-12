import { BaseEntity, Column, Entity, PrimaryColumn, OneToMany } from "typeorm";
import { Sucursal } from "./Sucursal";

@Entity()
export class Horario extends BaseEntity {
  @PrimaryColumn({ name: "idhorario", type: "varchar", length: 150 })
  IdHorario: string;

  @Column({ name: "horaentrada", type: "time" })
  HoraEntrada: string;

  @Column({ name: "horasalida", type: "time" })
  HoraSalida: string;

  @OneToMany(() => Sucursal, (sucursal) => sucursal.Horario)
  Sucursal: Sucursal[];
}