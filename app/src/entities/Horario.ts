import { BaseEntity, Column, Entity, PrimaryColumn, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { Sucursal } from "./Sucursal";

@Entity()
export class Horario extends BaseEntity {
  
  @PrimaryColumn({ name: "idhorario", type: "varchar", length: 150 })
  IdHorario: string;
  
   @Column({ name: "dia",  type: "varchar", length: 150, nullable:true})
  Dia: string; 

   @Column({ name: "tipo",  type: "varchar", length: 50, nullable:true})
  Tipo: string;

  @Column({ name: "horaentrada", type: "time" })
  HoraEntrada: string;

  @Column({ name: "horasalida", type: "time" })
  HoraSalida: string;
  
@ManyToOne(() => Sucursal, (sucursal) => sucursal.Horario)
@JoinColumn({ name: "idsucursal" })
Sucursal: Sucursal;
}

