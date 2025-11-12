import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import bcrypt from "bcryptjs";
import { Producto } from "./Producto";
import { Promocion } from "./Promocion";

@Entity()
//@Check(`"Estado" IN (0, 1)`)
export class Tipopromocion extends BaseEntity {
  @PrimaryColumn({ name: 'idtipopromocion', type: "integer" })
  IdTipoPromocion: number;

  @Column({ name: 'nombre', type: "varchar", length: 100 })
  Nombre: string;

  @OneToMany(() => Promocion, (promocion) => promocion.Tipopromocion)
  Promocion: Promocion[];
}
