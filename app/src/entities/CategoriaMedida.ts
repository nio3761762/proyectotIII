import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, JoinColumn, ManyToOne } from "typeorm";
import { Subcategoria } from "./SubCategoria";
import { Estado } from "./Estado";
import { Imagen } from "./Imagen";
import { Unidadmedida } from "./UnidadMedida";

@Entity()
export class Categoriamedida extends BaseEntity {
  @PrimaryColumn({ name: 'idcategoriamedida', type: "varchar", length: 50 })
  IdCategoriaMedida: string;

  @Column({ name: 'nombre', type: "varchar", length: 100 })
  Nombre: string;

  @Column({ name: "fecharegistro", type: "date", nullable:true })
  FechaRegistro: Date;

  @Column({ name: "fechaactualizacion", type: "date", nullable: true })
  FechaActualizacion: Date;

  @OneToMany(() => Unidadmedida, (medida) => medida.Categoria)
  Unidadmedida: Unidadmedida[];

  @ManyToOne(() => Estado, (estado) => estado.Categoriamedida)
  @JoinColumn({ name: "idestado" })
  Estado: Estado;

}