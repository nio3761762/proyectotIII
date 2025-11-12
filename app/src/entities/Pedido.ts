import { BaseEntity, Column, Entity, PrimaryColumn, OneToMany, OneToOne, JoinColumn, ManyToOne } from "typeorm";
import { Venta } from "./Venta";
import { Tipopedido } from "./TipoPedido";
import { Estado } from "./Estado";
import { Entrega } from "./Entrega";
import { Distribucion } from "./Distribucion";
import { Detallepedido } from "./DetallePedido";

@Entity()
export class Pedido extends BaseEntity {
    @PrimaryColumn({ name: "idpedido", type: "varchar", length: 50 })
    IdPedido: string;

    @Column({ name: "fecharegistro", type: "date" })
    FechaRegistro: Date;

    @Column({ name: "hora", type: "time" })
    Hora: string;

    @Column({ name: "detalle", type: "varchar", length: 255, nullable: true })
    Detalle: string;

    // @Column({ name: 'total', type: "numeric", precision: 10, scale: 2 })
    // Total: number;

    @OneToOne(() => Venta, (venta) => venta.Pedido)
    @JoinColumn({ name: "idventa" })
    Venta: Venta;

    @ManyToOne(() => Tipopedido, (tipopedido) => tipopedido.Pedido)
    @JoinColumn({ name: "idtipopedido" })
    Tipopedido: Tipopedido;

    @OneToOne(() => Entrega, (envio) => envio.Pedido)
    Entrega: Entrega;

    @ManyToOne(() => Estado, (estado) => estado.Pedido)
    @JoinColumn({ name: "idestado" })
    Estado: Estado;

    @OneToOne(() => Distribucion, (distribucion) => distribucion.Pedido)
    Distribuciones: Distribucion;

     @OneToMany(() => Detallepedido, (distribucion) => distribucion.Pedido)
    Detallepedido: Detallepedido[];
}