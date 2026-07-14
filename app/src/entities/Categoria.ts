import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, JoinColumn, ManyToOne } from "typeorm";
import { Subcategoria } from "./SubCategoria";

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

  @Column({ name: "imagen", type: "varchar", length: 255, nullable: true })
  Imagen: string;  
  
  @Column({ name: "estado", type: "integer",default: 1}) 
  Estado: number; 


}