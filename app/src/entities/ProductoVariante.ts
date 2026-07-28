import { Entity, PrimaryColumn, Column, OneToMany, BaseEntity, JoinColumn,ManyToOne } from "typeorm";
import { Sabor } from "./Sabor";
import { Tamanio } from "./Tamanio";



@Entity()
export class Productovariante extends BaseEntity {
  @PrimaryColumn({ name: "idvariante", type: "varchar", length: 100 })
  Idvariante: string;

  @Column({ name: "estado", type: "integer", default: 1 })
  Estado: number; 

 @ManyToOne(() => Sabor, (s) => s.Variante, { nullable: true })
 @JoinColumn({ name: "idsabor" })
   Sabor: Sabor;

   @ManyToOne(() => Tamanio, (s) => s.Variante, { nullable: true })
   @JoinColumn({ name: "idtamanio" })
   Tamanio: Tamanio;

 @Column({ name: "imagen", type: "varchar", length: 255 })
  Imagen: string; 

}



