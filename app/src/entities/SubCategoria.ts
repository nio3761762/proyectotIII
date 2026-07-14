import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, JoinColumn, ManyToOne } from "typeorm";
import { Producto } from "./Producto";
import { Categoria } from "./Categoria";
import { Insumo } from "./Insumo";

@Entity()

export class Subcategoria extends BaseEntity {
       @PrimaryColumn({ name: 'idsubcategoria', type: "varchar", length: 50 })
       IdSubCategoria: string;

       @Column({ name: 'nombre', type: "varchar", length: 100 })
       Nombre: string;

       @OneToMany(() => Producto, (producto) => producto.Subcategoria)
       Producto: Producto[];

       @OneToMany(() => Insumo, (producto) => producto.Subcategoria)
       Insumo: Insumo[];

       @ManyToOne(() => Categoria, (categoria) => categoria.Subcategoria)
       @JoinColumn({ name: "idcategoria" })
       Categoria: Categoria;

        @Column({ name: "estado", type: "integer",default: 1}) 
        Estado: number; 
}