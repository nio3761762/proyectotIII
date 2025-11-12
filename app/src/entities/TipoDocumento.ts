import { BaseEntity, Column, Entity, PrimaryColumn, OneToMany } from "typeorm";
import { Complemento } from "./Complemento";
import { Persona } from "./Persona";
import { Documento } from "./Documento";

@Entity()
export class Tipodocumento extends BaseEntity {
  @PrimaryColumn({ name: "idtipodocumento", type: "varchar", length: 50 })
  IdTipoDocumento: string;

  @Column({ name: "nombre", type: "varchar", length: 50 })
  Nombre: string;

  @OneToMany(() => Documento, (documento) => documento.Tipodocumento)
  Documento: Documento[];
}
