import {
  BaseEntity,
  Column,
  Entity,
  PrimaryColumn,
  OneToMany,
  ManyToOne,
  JoinColumn
} from "typeorm";
import { Tipodocumento } from "./TipoDocumento";
import { Complemento } from "./Complemento";
import { Persona } from "./Persona";

@Entity()
export class Documento extends BaseEntity {
  @PrimaryColumn({ name: "iddocumento", type: "varchar", length: 50 })
  IdDocumento: string;

  @Column({ name: "documento", type: "varchar", length: 100 })
  Documento: string;

  @ManyToOne(() => Tipodocumento, (tipodocumento) => tipodocumento.Documento)
  @JoinColumn({ name: "idtipodocumento" })
  Tipodocumento: Tipodocumento;

  @ManyToOne(() => Complemento, (complemento) => complemento.Documento, { nullable: true })
  @JoinColumn({ name: "idcomplemento" })
  Complemento: Complemento;

  @ManyToOne(() => Persona, (persona) => persona.Documento, { nullable: true })
  @JoinColumn({ name: "idpersona" })
  Persona: Persona;


}
