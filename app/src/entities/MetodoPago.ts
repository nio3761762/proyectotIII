import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import bcrypt from "bcryptjs";
import { Producto } from "./Producto";
import { Pago } from "./Pago";

@Entity()
//@Check(`"Estado" IN (0, 1)`)
export class Metodopago extends BaseEntity {
  @PrimaryColumn({ name: 'idmetodopago', type: "integer" })
  IdMetodoPago: number;

  @Column({ name: 'nombre', type: "varchar", length: 100 })
  Nombre: string;

  @OneToMany(() => Pago, (pago) => pago.Metodopago)
  Pago: Pago[];
}
