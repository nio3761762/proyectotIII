import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import { Unidadmedida } from "./UnidadMedida";
import { Insumo } from "./Insumo";
import { Receta } from "./Receta";

@Entity()
export class Ingrediente extends BaseEntity {
  @PrimaryColumn({ name: 'idingrediente', type: "varchar", length: 100 })
  IdIngrediente: string;

  @Column({ name: 'peso', type: "numeric", precision: 10, scale: 3 })
  Peso: number; 

  @Column({ name: 'pesoconvertido', type: "numeric", precision: 12, scale: 3, default:0 })
  Pesoconvertido: number;

  @ManyToOne(() => Insumo, (producto) => producto.Ingrediente , {nullable:true})
  @JoinColumn({ name: "idinsumo" })
  Insumo: Insumo;

   @ManyToOne(() => Receta, (ingrediente) => ingrediente.Ingredientes)
   @JoinColumn({name:'idreceta'})
   Receta: Receta;
 

  @ManyToOne(() => Unidadmedida, (unidadmedida) => unidadmedida.Ingrediente)
  @JoinColumn({ name: "idunidadmedida" })
  Unidadmedida: Unidadmedida;
}