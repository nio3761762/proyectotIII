import { Entity, PrimaryColumn, ManyToOne, Column, OneToMany, JoinColumn, BaseEntity } from "typeorm";
import { Producto } from "./Producto";
import { Ingrediente } from "./Ingrediente";

@Entity()
export class Receta extends BaseEntity{

  @PrimaryColumn({name:'idreceta',type:'varchar', length:150})
  IdReceta: string;

  @ManyToOne(() => Producto, (p) => p.Receta)
  @JoinColumn({name:'idproducto'})
  Producto: Producto;

  @Column({name:'rendimiento', type: "numeric" })
  Rendimiento: number; // 🔥 CUÁNTOS PRODUCTOS PRODUCE

  @Column({name:'tiempohorneado', type: "numeric" })
  TiempoHorneadoMin: number;

  @Column({ name:'cantidadporlata',type: "numeric" })
  CantidadPorLata: number;

  @OneToMany(() => Ingrediente, d => d.Receta)
  Ingredientes: Ingrediente[];
}