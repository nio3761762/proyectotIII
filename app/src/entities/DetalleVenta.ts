
import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import { Venta } from "./Venta";
import { Producto } from "./Producto";
import { Promocion } from "./Promocion";
import { Productomedida } from "./ProductoMedida";

@Entity()
//@Check(`"Estado" IN (0, 1)`)
export class Detalleventa extends BaseEntity {
    @PrimaryColumn({ name: 'iddetalleventa', type: "varchar", length: 100 })
    IdDetalleVenta: string;

    @Column({ name: "cantidad", type: "integer" })
    Cantidad: number;

    @Column({ name: "precio", type: "numeric", precision: 10, scale: 2 })
    Precio: number;

    @ManyToOne(() => Venta, (venta) => venta.Detalleventa)
    @JoinColumn({ name: "idventa" })
    Venta: Venta;
   
     @ManyToOne(() => Producto, (producto) => producto.Detalleventa, { nullable: true })
    @JoinColumn({ name: "idproducto" })
    Producto: Producto;
     
    @ManyToOne(() => Productomedida, (producto) => producto.Detalleventa, { nullable: true })
    @JoinColumn({ name: "idproductomedida" })
    Productomedida: Productomedida;

    @ManyToOne(() => Promocion, (promocion) => promocion.Detalleventa, { nullable: true })
    @JoinColumn({ name: "idpromocion" })
    Promocion: Promocion;

    @Column({ name: 'descuento', type: "numeric", precision: 10, scale: 2 , default:0 })
    Descuento: number;
}

