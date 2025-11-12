import {
  BaseEntity,
  Column,
  Entity,
  PrimaryColumn,
  OneToMany
} from "typeorm";
import { Persona } from "./Persona";

@Entity()
export class Salario extends BaseEntity {
  @PrimaryColumn({ name: "idsalario", type: "varchar", length: 150 })
  IdSalario: string;

  @Column({ name: "salario", type: "decimal", precision: 10, scale: 2, default: 0.00 })
  Salario: number;

  @Column({ name: "moneda", type: "varchar", length: 10 })
  Moneda: string;

  @Column({ name: "fecha", type: "date" })
  Fecha: Date;

  @OneToMany(() => Persona, (persona) => persona.Salario)
  Persona: Persona[];
}