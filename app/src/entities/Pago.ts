import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import bcrypt from "bcryptjs";
import { Producto } from "./Producto";
import { Metodopago } from "./MetodoPago";
import { Venta } from "./Venta";
import { Pedido } from "./Pedido";

@Entity()
//@Check(`"Estado" IN (0, 1)`)
export class Pago extends BaseEntity {
    @PrimaryColumn({ name: 'idpago', type: "varchar", length: 100 })
    IdPago: string;

    @Column({ name: "monto", type: "numeric", precision: 10, scale: 2 })
    Monto: number;

    @Column({ name: "cambio", type: "numeric", precision: 10, scale: 2 })
    Cambio: number;

    @Column({ name: "fechapago", type: "date" })
    FechaPago: Date;

    @Column({ name: "horapago", type: "time", nullable: true })
    HoraPago: string;

    @ManyToOne(() => Metodopago, (metodopago) => metodopago.Pago)
    @JoinColumn({ name: "idmetodopago" })
    Metodopago: Metodopago;

    @ManyToOne(() => Venta, (venta) => venta.Pago, { nullable: true })
    @JoinColumn({ name: "idventa" })
    Venta: Venta;

    @ManyToOne(() => Pedido, (pedido) => pedido.Pago, { nullable: true })
    @JoinColumn({ name: "idpedido" })
    Pedido: Pedido;


}
