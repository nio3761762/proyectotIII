import {
  Entity, PrimaryColumn, Column,
  OneToOne, JoinColumn, OneToMany, BaseEntity,
  ManyToOne
} from "typeorm";
import { Persona } from "./Persona";
import { EmpleadoSucursal } from "./EmpleadoSucursal";
import { Salario } from "./Salario";
import { EmpleadoCargo } from "./EmpleadoCargo";
import { Transferencia } from "./Transferencia";
import { Produccion } from "./Produccion";
import { ProduccionEmpleado } from "./ProduccionEmpleado";

@Entity()
export class Empleado extends BaseEntity {
  @PrimaryColumn({ name: "idempleado", type: "varchar", length: 150 })
  IdEmpleado: string;

  @OneToOne(() => Persona, (persona) => persona.Empleado)
  @JoinColumn({ name: "idpersona" })
  Persona: Persona;

  @OneToMany(() => EmpleadoCargo, (ec) => ec.Empleado)
  EmpleadoCargos: EmpleadoCargo[];

  @Column({ name: "fechaingreso", type: "date" })
  FechaIngreso: Date;
   
  @Column({ name: "Fechasalida", type: "date", nullable:true })
  FechaSalida: Date;
   
  @Column({ name: "estado", type: "integer", default: 1 })
  Estado: number;

  @OneToMany(() => EmpleadoSucursal, (es) => es.Empleado)
  EmpleadoSucursales: EmpleadoSucursal[];

  @OneToMany(() => ProduccionEmpleado, (es) => es.Empleado)
  Produccion: ProduccionEmpleado[];

  @OneToMany(() => Transferencia, (es) => es.EmpleadoDestino)
  Transferencia: Transferencia[];

   @OneToMany(() => Salario, (salario) => salario.Empleado)
  Salarios: Salario[];
}