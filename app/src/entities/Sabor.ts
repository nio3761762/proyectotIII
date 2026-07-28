import { Entity, PrimaryColumn, Column, OneToMany, BaseEntity } from "typeorm";
import { Productovariante } from "./ProductoVariante";

@Entity()
export class Sabor extends BaseEntity {
  @PrimaryColumn({ name: "idsabor", type: "varchar", length: 100 })
  Idsabor: string;

  @Column({ name: "nombre", type: "varchar", length: 100 })
  Nombre: string; 


  @OneToMany(() => Productovariante, (p) => p.Sabor)
         Variante: Productovariante[];
}