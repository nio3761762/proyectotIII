import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, OneToOne, OneToMany, BaseEntity } from "typeorm";
import { Estado } from "./Estado";
import { Producto } from "./Producto";
import { Sucursal } from "./Sucursal";
import { Presentacionproducto } from "./Presentacionproducto";


@Entity()
export class Productosucursal extends BaseEntity {
  @PrimaryColumn({ name: "idproductosucursal", type: "varchar", length: 100 })
  IdProductoSucursal: string;

  @Column({ name: "fecha", type: "date" })
  Fecha: Date;

  @Column({ name: "cantidad", type: "integer" , nullable:true})
  Cantidad: number;

  @ManyToOne(() => Producto, (Producto) => Producto.Productosucursal, {nullable:true})
  @JoinColumn({ name: "idproducto" })
  Producto: Producto;

  @ManyToOne(() => Presentacionproducto, (Producto) => Producto.Productosucursal, {nullable:true})
  @JoinColumn({ name: "idpaquete" })
  Paquete: Presentacionproducto;
  

  @ManyToOne(() => Sucursal, (sucursal) => sucursal.Productosucursal)
  @JoinColumn({ name: "idsucursal" })
  Sucursal: Sucursal;
  
  @Column({ name: "stockminimo", type: "integer", nullable:true })
  StockMinimo: number;

  @Column({ name: "fecha_alerta_stock", type: "timestamp", nullable: true })
  FechaAlertaStock: Date | null;

  // @Column({ name: "stockmaximo", type: "integer" })
  // StockMaximo: number;

  // @ManyToOne(() => Estado, (estado) => estado.Productosucursal)
  // @JoinColumn({ name: "idestado" })
  // Estado: Estado;
}
