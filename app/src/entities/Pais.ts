import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne } from "typeorm";
import bcrypt from "bcryptjs";
import { Persona } from "./Persona";
import { Departamento } from "./Departamento";

@Entity()
//@Check(`"Estado" IN (0, 1)`)
export class Pais extends BaseEntity {
  @PrimaryColumn({ name: 'idpais', type: "varchar", length: 50 })
  IdPais: string;

  @Column({ name: 'nombre', type: "varchar", length: 100 })
  Nombre: string;

  @OneToMany(() => Departamento, (departamento) => departamento.Pais)
  Departamento: Departamento[];
}
