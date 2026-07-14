import { BaseEntity, Column, Entity, PrimaryColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Documento } from "./Documento";

@Entity()
export class Complemento extends BaseEntity {
  @PrimaryColumn({ name: "idcomplemento", type: "varchar", length: 50 })
  IdComplemento: string; // debe ser string si es varchar

  @Column({ name: "nombre", type: "varchar", length: 50 })
  Nombre: string;

  @OneToMany(() => Documento, (documento) => documento.Complemento)
  Documento: Documento[];
}
