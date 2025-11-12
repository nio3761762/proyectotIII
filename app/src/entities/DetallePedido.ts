
import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import bcrypt from "bcryptjs";
import { Estado } from "./Estado";
import { Usuario } from "./Usuario";
import { Persona } from "./Persona";
import { Venta } from "./Venta";
import { Producto } from "./Producto";
import { Promocion } from "./Promocion";
import { Presentacionproducto } from "./Presentacionproducto";
import { Pedido } from "./Pedido";

@Entity()
//@Check(`"Estado" IN (0, 1)`)
export class Detallepedido extends BaseEntity {
    @PrimaryColumn({ name: 'iddetallepedido', type: "varchar", length: 100 })
    IdDetallePedido: string;

    @Column({ name: "cantidad", type: "integer" })
    Cantidad: number;

    @Column({ name: "precio", type: "numeric", precision: 10, scale: 2 })
    Precio: number;

    @Column({ name: "modo", type: "integer", nullable: true })
    Modo: number;

    @ManyToOne(() => Pedido, (venta) => venta.Detallepedido)
    @JoinColumn({ name: "idpedido" })
    Pedido: Pedido;

    @ManyToOne(() => Producto, (producto) => producto.Detallepedido, { nullable: true })
    @JoinColumn({ name: "idproducto" })
    Producto: Producto;

    @ManyToOne(() => Promocion, (promocion) => promocion.Detallepedido, { nullable: true })
    @JoinColumn({ name: "idpromocion" })
    Promocion: Promocion;

    @ManyToOne(() => Presentacionproducto, (paquete) => paquete.Detallepedido, { nullable: true })
    @JoinColumn({ name: "idpaquete" })
    Paquete: Presentacionproducto;
    nuevoDetalleventa: Venta;

}

