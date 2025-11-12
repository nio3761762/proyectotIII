import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, JoinColumn, ManyToOne } from "typeorm";
import { Producto } from "./Producto";
import { Categoria } from "./Categoria";
import { Estado } from "./Estado";


@Entity()

export class Subcategoria extends BaseEntity {
       @PrimaryColumn({ name: 'idsubcategoria', type: "varchar", length: 50 })
       IdSubCategoria: string;

       @Column({ name: 'nombre', type: "varchar", length: 100 })
       Nombre: string;

       @OneToMany(() => Producto, (producto) => producto.Subcategoria)
       Producto: Producto[];

       @ManyToOne(() => Categoria, (categoria) => categoria.Subcategoria)
       @JoinColumn({ name: "idcategoria" })
       Categoria: Categoria;

       @ManyToOne(() => Estado, (estado) => estado.Subcategoria)
       @JoinColumn({ name: "idestado" })
       Estado: Estado;
}