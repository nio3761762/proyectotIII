import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import bcrypt from 'bcryptjs';
import { Ingrediente } from './Ingrediente';
import { Categoriamedida } from './CategoriaMedida';
import { Insumomedida } from './InsumoMedida';

@Entity()
export class Unidadmedida extends BaseEntity {
   @PrimaryColumn({ name: 'idunidadmedida', type: 'integer' })
   IdUnidadMedida: number;

   @Column({ name: 'nombre', type: 'varchar', length: 100 })
   Nombre: string;

   @Column({ name: 'abreviatura', type: 'varchar', length: 100 })
   Abreviatura: string;

   @Column({ name: 'cantidad', type: 'numeric', precision: 10, scale: 3 })
   Cantidad: number;

   @Column({ name: 'fecharegistro', type: 'date' })
   FechaRegistro: Date;

   @Column({ name: "estado", type: "integer",default: 1}) 
   Estado: number; 

    @ManyToOne(() => Categoriamedida, (estado) => estado.Unidadmedida, {nullable:true})
   @JoinColumn({ name: 'idcategoriamedida' })
   Categoria: Categoriamedida;

   @OneToMany(() => Ingrediente, (ingrediente) => ingrediente.Unidadmedida)
   Ingrediente: Ingrediente[];

   @OneToMany(() => Insumomedida, (productomedida) => productomedida.Unidadmedida)
   Insumomedida: Insumomedida[];
   
}
