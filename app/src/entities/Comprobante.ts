import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import bcrypt from "bcryptjs";
import { Compra } from "./Compra";


@Entity()
//@Check(`"Estado" IN (0, 1)`)
export class Comprobante extends BaseEntity {
  @PrimaryColumn({ name: 'idcomprobante', type: "varchar", length: 50 })
  IdComprobante: string;

  @Column({ name: 'nombre', type: "varchar", length: 100 })
  Nombre: string;

  @OneToMany(() => Compra, (compra) => compra.Comprobante)
  Compra: Compra[];
}
