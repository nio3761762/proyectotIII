
import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import bcrypt from "bcryptjs";
import { Estado } from "./Estado";
import { Usuario } from "./Usuario";
import { Persona } from "./Persona";
import { Venta } from "./Venta";
import { Producto } from "./Producto";
import { Promocion } from "./Promocion";
import { Presentacionproducto } from "./Presentacionproducto";

@Entity()
//@Check(`"Estado" IN (0, 1)`)
export class Detalleventa extends BaseEntity {
    @PrimaryColumn({ name: 'iddetalleventa', type: "varchar", length: 100 })
    IdDetalleVenta: string;

    @Column({ name: "cantidad", type: "integer" })
    Cantidad: number;

    @Column({ name: "precio", type: "numeric", precision: 10, scale: 2 })
    Precio: number;

    @Column({ name: "modo", type: "integer", nullable: true })
    Modo: number;

    @ManyToOne(() => Venta, (venta) => venta.Detalleventa)
    @JoinColumn({ name: "idventa" })
    Venta: Venta;

    @ManyToOne(() => Producto, (producto) => producto.Detalleventa, { nullable: true })
    @JoinColumn({ name: "idproducto" })
    Producto: Producto;

    @ManyToOne(() => Promocion, (promocion) => promocion.Detalleventa, { nullable: true })
    @JoinColumn({ name: "idpromocion" })
    Promocion: Promocion;

    @ManyToOne(() => Presentacionproducto, (paquete) => paquete.Detalleventa, { nullable: true })
    @JoinColumn({ name: "idpaquete" })
    Paquete: Presentacionproducto;

    @Column({ name: 'descuento', type: "numeric", precision: 10, scale: 2 , nullable: true})
    Descuento: number;
}

