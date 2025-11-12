import {
  BaseEntity,
  Column,
  Entity,
  PrimaryColumn,
  OneToMany
} from "typeorm";
import { Persona } from "./Persona";

@Entity()
export class Genero extends BaseEntity {
  @PrimaryColumn({ name: "idgenero", type: "integer" })
  IdGenero: number;

  @Column({ name: "nombre", type: "varchar", length: 50 })
  Nombre: string;

  @OneToMany(() => Persona, (persona) => persona.Genero)
  Persona: Persona[];
}