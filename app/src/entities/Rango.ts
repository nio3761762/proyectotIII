import { BaseEntity, Column, Entity, PrimaryColumn, OneToMany, OneToOne, JoinColumn } from "typeorm";
import { Sucursal } from "./Sucursal";
import { Promocion } from "./Promocion";

@Entity()
export class Rango extends BaseEntity {
  @PrimaryColumn({ name: "idrango", type: "varchar", length: 50 })
  IdRango: string;

  @Column({ name: "horainicio", type: "time" })
  HoraInicio: string;

  @Column({ name: "horafin", type: "time" })
  HoraFin: string;

  @Column({ name: "fechainicio", type: "date" })
  FechaInicio: Date;

  @Column({ name: "fechafin", type: "date" })
  FechaFin: Date;

  @OneToOne(() => Promocion, (promocion) => promocion.Rango)
  @JoinColumn({ name: "idpromocion" })
  Promocion: Promocion;
}