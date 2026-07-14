import {
  Entity, PrimaryColumn, Column,
  ManyToOne, JoinColumn, BaseEntity
} from "typeorm";
import { Empleado } from "./Empleado";
import { Sucursal } from "./Sucursal";

@Entity()
export class EmpleadoSucursal extends BaseEntity {
  @PrimaryColumn({ name: "idempleadosucursal", type: "varchar", length: 150 })
  IdEmpleadoSucursal: string;

  @ManyToOne(() => Empleado, (empleado) => empleado.EmpleadoSucursales)
  @JoinColumn({ name: "idempleado" })
  Empleado: Empleado;

  @ManyToOne(() => Sucursal, (sucursal) => sucursal.EmpleadoSucursales)
  @JoinColumn({ name: "idsucursal" })
  Sucursal: Sucursal;

  @Column({ name: "fechainicio", type: "date" })
  FechaInicio: Date;

  @Column({ name: "fechafin", type: "date", nullable: true })
  FechaFin: Date;

  @Column({ name: "estado", type: "integer", default: 1 })
  Estado: number;
}