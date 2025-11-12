import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import bcrypt from "bcryptjs";
import { Producto } from "./Producto";
import { Unidadmedida } from "./UnidadMedida";

@Entity()
//@Check(`"Estado" IN (0, 1)`)
export class Ingrediente extends BaseEntity {
  @PrimaryColumn({ name: 'idingrediente', type: "varchar", length: 100 })
  IdIngrediente: string;

  @Column({ name: 'peso', type: "numeric", precision: 10, scale: 3 })
  Peso: number;

  @ManyToOne(() => Producto, (producto) => producto.Ingrediente)
  @JoinColumn({ name: "idproductoingrediente" })
  Ingredientes: Producto;

  @ManyToOne(() => Producto, (producto) => producto.Producto)
  @JoinColumn({ name: "idproducto" })
  Producto: Producto;

  @ManyToOne(() => Unidadmedida, (unidadmedida) => unidadmedida.Ingrediente)
  @JoinColumn({ name: "idunidadmedida" })
  Unidadmedida: Unidadmedida;
}