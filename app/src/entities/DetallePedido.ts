
import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import { Producto } from "./Producto";
import { Promocion } from "./Promocion";
import { Pedido } from "./Pedido";
import { Productomedida } from "./ProductoMedida";

@Entity()
export class Detallepedido extends BaseEntity {
    @PrimaryColumn({ name: 'iddetallepedido', type: "varchar", length: 100 })
    IdDetallePedido: string;

    @Column({ name: "cantidad", type: "integer" })
    Cantidad: number;

    @Column({ name: "cantidad_devuelta", type: "integer", default: 0 })
    CantidadDevuelta: number;

    @Column({ name: "precio", type: "numeric", precision: 10, scale: 2 })
    Precio: number;

    @Column({ name: "subtotal", type: "numeric", precision: 10, scale: 2, default: 0 })
    Subtotal: number; 

    @ManyToOne(() => Pedido, (venta) => venta.Detallepedido)
    @JoinColumn({ name: "idpedido" })
    Pedido: Pedido;

    @ManyToOne(() => Producto, (producto) => producto.Detallepedido, { nullable: true })
    @JoinColumn({ name: "idproducto" })
    Producto: Producto;

    @ManyToOne(() => Productomedida, (producto) => producto.Detallepedido, { nullable: true })
    @JoinColumn({ name: "idproductomedida" })
    Productomedida: Productomedida;

    @ManyToOne(() => Promocion, (promocion) => promocion.Detallepedido, { nullable: true })
    @JoinColumn({ name: "idpromocion" })
    Promocion: Promocion;
}

