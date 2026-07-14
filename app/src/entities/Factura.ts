
import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import bcrypt from "bcryptjs";
import { Venta } from "./Venta";
import { Enlace } from "./Enlace";

@Entity()
//@Check(`"Estado" IN (0, 1)`)
export class Factura extends BaseEntity {
    @PrimaryColumn({ name: 'idfactura', type: "varchar", length: 100 })
    IdFactura: string;

    @Column({ name: "nrofactura", type: "varchar", length: 255 })
    NroFactura: string;

    @Column({ name: "fechaemicion", type: "date" })
    FechaEmicion: Date;

    @Column({ name: "horaemicion", type: "time" })
    HoraEmicion: string;

    @Column({ name: "aprobado", type: "varchar", length: 10 })
    Aprobado: string;
    
    @Column({ name: "nombrefacturacion", type: "varchar", length: 150, nullable:true })
    NombreFacturacion: string;

    @Column({ name: "nitcifacturacion", type: "varchar", length: 50, nullable:true })
    NitCiFacturacion: string;

    @OneToOne(() => Venta, (venta) => venta.Factura)
    @JoinColumn({ name: "idventa" })
    Venta: Venta;

    @OneToOne(() => Enlace, (enlace) => enlace.Factura, {nullable:true})
    @JoinColumn({ name: "idenlace" })
    Enlace: Enlace;


}

