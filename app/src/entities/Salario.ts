import {
  BaseEntity,
  Column,
  Entity,
  PrimaryColumn,
  OneToMany,
  ManyToOne,
  JoinColumn
} from "typeorm";
import { Empleado } from "./Empleado";

@Entity()
export class Salario extends BaseEntity {
  @PrimaryColumn({ name: "idsalario", type: "varchar", length: 150 })
  IdSalario: string;

  @Column({ name: "salario", type: "numeric", precision: 10, scale: 2, default: 0.00 })
  Salario: number;

  @Column({ name: "fechainicio", type: "date", nullable: true })
  FechaInicio: Date;

  @Column({ name: "fechafin", type: "date", nullable: true })
  FechaFin: Date;

  @Column({ name: "estado", type: "integer", default: 1 })
  Estado: number;
  
  @ManyToOne(() => Empleado, (empleado) => empleado.Salarios,{nullable:true})
  @JoinColumn({ name: "idempleado" })
  Empleado: Empleado;

}