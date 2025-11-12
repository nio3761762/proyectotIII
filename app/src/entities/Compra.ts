
import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import bcrypt from "bcryptjs";
import { Comprobante } from "./Comprobante";
import { Proveedor } from "./Proveedor";
import { Detallecompra } from "./DetalleCompra";
import { Estado } from "./Estado";


@Entity()
//@Check(`"Estado" IN (0, 1)`)
export class Compra extends BaseEntity {
    @PrimaryColumn({ name: 'idcompra', type: "varchar", length: 50 })
    IdCompra: string;

    @Column({ name: "nrocomprobante", type: "varchar", length: 100 })
    NroComprobante: string;

    @Column({ name: "fechacompra", type: "date" })
    FechaCompra: Date;

    @Column({ name: "horacompra", type: "time", nullable:true })
    HoraCompra: string;

    @ManyToOne(() => Comprobante, (comprobante) => comprobante.Compra, { nullable: true })
    @JoinColumn({ name: "idcomprobante" })
    Comprobante: Comprobante;

    @ManyToOne(() => Proveedor, (proveedor) => proveedor.Compra, { nullable: true })
    @JoinColumn({ name: "idproveedor" })
    Proveedor: Proveedor;

    @OneToMany(() => Detallecompra, (detallecompra) => detallecompra.Compra)
    Detallecompra: Detallecompra[];

      @ManyToOne(() => Estado, (estado) => estado.Compra, {nullable:true})
  @JoinColumn({ name: "idestado" })
  Estado: Estado;

}
