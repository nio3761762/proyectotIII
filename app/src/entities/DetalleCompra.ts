
import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import bcrypt from "bcryptjs";
import { Comprobante } from "./Comprobante";
import { Proveedor } from "./Proveedor";
import { Compra } from "./Compra";
import { Productomedida } from "./ProductoMedida";


@Entity()
//@Check(`"Estado" IN (0, 1)`)
export class Detallecompra extends BaseEntity {
    @PrimaryColumn({ name: 'iddetallecompra', type: "varchar", length: 50 })
    IdDetalleCompra: string;

    @Column({ name: 'descripcion', type: "varchar", length: 255, nullable: true })
    Descripcion: string;

    @Column({ name: "cantidad", type: "integer" })
    Cantidad: number;

    @Column({ name: "precio", type: "numeric", precision: 10, scale: 2 })
    Precio: number;

    @Column({ name: "fechavencimiento", type: "date" })
    FechaVencimineto: Date;

    @ManyToOne(() => Productomedida, (comprobante) => comprobante.Detallecompra, { nullable: true })
    @JoinColumn({ name: "idmedida" })
    Productomedida: Productomedida;

    @ManyToOne(() => Compra, (compra) => compra.Detallecompra)
    @JoinColumn({ name: "idcompra" })
    Compra: Compra;

}

