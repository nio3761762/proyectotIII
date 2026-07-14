import { Entity, PrimaryColumn, Column, OneToMany, BaseEntity } from "typeorm";
import { Empleado } from "./Empleado";
import { EmpleadoCargo } from "./EmpleadoCargo";

@Entity()
export class Cargo extends BaseEntity {
  @PrimaryColumn({ name: "idcargo", type: "varchar", length: 100 })
  IdCargo: string;

  @Column({ name: "nombre", type: "varchar", length: 100 })
  Nombre: string; 
  @Column({ name: "descripcion", type: "text", nullable:true })
  Descripcion: string; 
  
 @OneToMany(() => EmpleadoCargo, (ec) => ec.Cargo)
EmpleadoCargos: EmpleadoCargo[];
}