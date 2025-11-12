import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import bcrypt from 'bcryptjs';
import { Producto } from './Producto';
import { Estado } from './Estado';
import { Promocionproducto } from './PromocionProducto';
import { Ingrediente } from './Ingrediente';
import { Productomedida } from './ProductoMedida';
import {  Presentacionproducto } from './Presentacionproducto';
import { Categoriamedida } from './CategoriaMedida';

@Entity()
//@Check(`'Estado' IN (0, 1)`)
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

   // @OneToMany(() => Producto, (producto) => producto.Unidadmedida)
   // Producto: Producto[];

   @ManyToOne(() => Estado, (estado) => estado.Unidadmedida)
   @JoinColumn({ name: 'idestado' })
   Estado: Estado;

    @ManyToOne(() => Categoriamedida, (estado) => estado.Unidadmedida, {nullable:true})
   @JoinColumn({ name: 'idcategoriamedida' })
   Categoria: Categoriamedida;

   @OneToMany(() => Ingrediente, (ingrediente) => ingrediente.Unidadmedida)
   Ingrediente: Ingrediente[];

   @OneToMany(() => Productomedida, (productomedida) => productomedida.Unidadmedida)
   Productomedida: Productomedida[];

    @OneToMany(() => Presentacionproducto, (paquete) => paquete.Unidadmedida)
     Paquete: Presentacionproducto[];
   
}
