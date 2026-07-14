import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, PrimaryColumn } from "typeorm";
import { Productomedida } from "./ProductoMedida";

@Entity()
export class Productomedidaprecio extends BaseEntity {

   @PrimaryColumn({ name: "idproductomedidaprecio", type: "varchar", length: 100 })
  IdProductoMedidaPrecio: string;

  @Column({ name: "cantidadminima", type: "integer" })
  CantidadMinima: number;

  @Column({ name: "precio", type: "numeric", precision: 10, scale: 2 })
  Precio: number;

  @Column({ name: "estado", type: "integer", default:1 })
  Estado: number; 

  @ManyToOne(() => Productomedida, (pm) => pm.Productomedidaprecio)
  @JoinColumn({ name: "idproductomedida" })
  ProductoMedida: Productomedida;
}