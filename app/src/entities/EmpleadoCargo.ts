import {
  Entity, PrimaryColumn, Column,
  ManyToOne, JoinColumn, BaseEntity
} from "typeorm";
import { Empleado } from "./Empleado";
import { Cargo } from "./Cargo";

@Entity()
export class EmpleadoCargo extends BaseEntity {
  @PrimaryColumn({ name: "idempleadocargo", type: "varchar", length: 150 })
  IdEmpleadoCargo: string;

  @ManyToOne(() => Empleado, (empleado) => empleado.EmpleadoCargos)
  @JoinColumn({ name: "idempleado" })
  Empleado: Empleado;

  @ManyToOne(() => Cargo, (cargo) => cargo.EmpleadoCargos)
  @JoinColumn({ name: "idcargo" })
  Cargo: Cargo;

  @Column({ name: "fechainicio", type: "date" })
  FechaInicio: Date;

  @Column({ name: "fechafin", type: "date", nullable: true })
  FechaFin: Date;

  @Column({ name: "estado", type: "integer", default: 1 })
  Estado: number;
}