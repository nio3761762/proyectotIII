import { Entity, PrimaryColumn, Column, OneToMany, BaseEntity } from "typeorm";
import { Productovariante } from "./ProductoVariante";

@Entity()
export class Tamanio extends BaseEntity {
  @PrimaryColumn({ name: "idtamanio", type: "varchar", length: 100 })
  Idtamanio: string;

  @Column({ name: "nombre", type: "varchar", length: 100 })
  Nombre: string; 


   @OneToMany(() => Productovariante, (p) => p.Tamanio)
           Variante: Productovariante[];

}