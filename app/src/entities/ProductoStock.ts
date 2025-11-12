import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, OneToOne, OneToMany, BaseEntity } from "typeorm";
import { Estado } from "./Estado";
import { Producto } from "./Producto";
import { Sucursal } from "./Sucursal";
import { Presentacionproducto } from "./Presentacionproducto";


@Entity()
export class Productostock extends BaseEntity {
  @PrimaryColumn({ name: "idproductostock", type: "varchar", length: 100 })
  IdProductoStock: string;

  @Column({ name: "fecha", type: "date" })
  Fecha: Date;

  @Column({ name: "cantidad", type: "integer" , nullable:true})
  Cantidad: number;

  @ManyToOne(() => Producto, (Producto) => Producto.Productostock, {nullable:true})
  @JoinColumn({ name: "idproducto" })
  Producto: Producto;

  @ManyToOne(() => Sucursal, (sucursal) => sucursal.Productostock, {nullable:true})
  @JoinColumn({ name: "idsucursal" })
  Sucursal: Sucursal;
}
