import {
  BaseEntity,
  Column,
  Entity,
  PrimaryColumn,
  OneToMany,
  ManyToOne,
  JoinColumn
} from "typeorm";
import { Complemento } from "./Complemento";
import { Persona } from "./Persona";

@Entity()
export class Documento extends BaseEntity {
  @PrimaryColumn({ name: "iddocumento", type: "varchar", length: 50 })
  IdDocumento: string;

  @Column({ name: "documento", type: "varchar", length: 100 })
  Documento: string;

  @ManyToOne(() => Complemento, (complemento) => complemento.Documento, { nullable: true })
  @JoinColumn({ name: "idcomplemento" })
  Complemento: Complemento;

  @ManyToOne(() => Persona, (persona) => persona.Documento, { nullable: true })
  @JoinColumn({ name: "idpersona" })
  Persona: Persona;


}
