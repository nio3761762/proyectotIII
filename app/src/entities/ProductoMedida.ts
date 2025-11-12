import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, OneToOne, OneToMany, BaseEntity } from "typeorm";
import { Estado } from "./Estado";
import { Producto } from "./Producto";
import { Unidadmedida } from "./UnidadMedida";
import { Precio } from "./Precio";
import { Detallecompra } from "./DetalleCompra";


@Entity()
export class Productomedida extends BaseEntity {
    @PrimaryColumn({ name: "idproductomedida", type: "varchar", length: 50 })
    IdProductoMedida: string;

    @Column({ name: "fecharegistro", type: "date" })
    FechaRegistro: Date;

    @Column({ name: "cantidad", type: "numeric", precision: 10, scale: 3 })
    Cantidad: number;

    @Column({ name: "precioventa", type: "numeric", precision: 10, scale: 2 })
    PrecioVenta: number;

    @Column({ name: "preciomayor", type: "numeric", precision: 10, scale: 2, nullable: true })
    PrecioMayor: number;

    @ManyToOne(() => Producto, (Producto) => Producto.Productomedida)
    @JoinColumn({ name: "idproducto" })
    Producto: Producto;

    @ManyToOne(() => Unidadmedida, (unidadmedida) => unidadmedida.Productomedida)
    @JoinColumn({ name: "idunidadmedida" })
    Unidadmedida: Unidadmedida;


    @OneToMany(() => Detallecompra, (compra) => compra.Productomedida)
    Detallecompra: Detallecompra[];
}
