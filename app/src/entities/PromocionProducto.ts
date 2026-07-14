
import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import { Promocion } from "./Promocion";
import { Producto } from "./Producto";
import { Productomedida } from "./ProductoMedida";


@Entity()
export class Promocionproducto extends BaseEntity {
  @PrimaryColumn({ name: 'idpromocionproducto', type: "varchar", length: 100 })
  IdPromocionProducto: string;

  @Column({ name: 'cantidad', type: "integer" })
  Cantidad: number;
   
  @Column({ name: 'descuento', type: "numeric", precision: 10, scale: 2 })
  Descuento: number;
   
  @Column({ name: "precio", type: "numeric", precision: 10, scale: 2, default:0 })
  Precio: number;

  @ManyToOne(() => Producto, (producto) => producto.Promocionproducto, {nullable:true})
  @JoinColumn({ name: "idproducto" })
  Producto: Producto;

  @ManyToOne(() => Productomedida, (producto) => producto.Promocionproducto, {nullable:true})
  @JoinColumn({ name: "idproductomedida" })
  Productomedida: Productomedida;
 
  @ManyToOne(() => Promocion, (promocion) => promocion.Promocionproducto)
  @JoinColumn({ name: "idpromocion" })
  Promocion: Promocion;

  @Column({ name: "estado", type: "integer",default: 1}) 
  Estado: number; 
  
}