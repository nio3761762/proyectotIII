import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, JoinColumn, ManyToOne } from "typeorm";
import { Subcategoria } from "./SubCategoria";
import { Estado } from "./Estado";
import { Imagen } from "./Imagen";

@Entity()
export class Categoria extends BaseEntity {
  @PrimaryColumn({ name: 'idcategoria', type: "varchar", length: 50 })
  IdCategoria: string;

  @Column({ name: 'nombre', type: "varchar", length: 100 })
  Nombre: string;

  @Column({ name: "fecharegistro", type: "date" })
  FechaRegistro: Date;

  @Column({ name: "fechaactualizacion", type: "date", nullable: true })
  FechaActualizacion: Date;

  @OneToMany(() => Subcategoria, (subcategoria) => subcategoria.Categoria)
  Subcategoria: Subcategoria[];

  @ManyToOne(() => Estado, (estado) => estado.Categoria)
  @JoinColumn({ name: "idestado" })
  Estado: Estado;

  @ManyToOne(() => Imagen, (imagen) => imagen.Categoria, {nullable: true})
  @JoinColumn({ name: "idimagen" })
  Imagen: Imagen;
  // estado
  // foto

}