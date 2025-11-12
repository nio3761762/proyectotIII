import { BaseEntity, Column, Entity, PrimaryColumn, OneToMany } from "typeorm";
import { Entrega } from "./Entrega";

@Entity()
export class Tipoentrega extends BaseEntity {
  @PrimaryColumn({ name: "idtipoentrega", type: "varchar", length: 50 })
  IdTipoEntrega: string;

  @Column({ name: "nombre", type: "varchar", length: 50 })
  Nombre: string;

  @OneToMany(() => Entrega, (entrega) => entrega.Tipoentrega)
  Entrega: Entrega[];
}