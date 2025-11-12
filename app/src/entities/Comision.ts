import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import bcrypt from "bcryptjs";
import { Estado } from "./Estado";
import { Producto } from "./Producto";

@Entity()
//@Check(`"Estado" IN (0, 1)`)
export class Comision extends BaseEntity {
    @PrimaryColumn({ name: 'idcomision', type: "varchar", length: 100 })
    IdComision: number;

    @Column({ name: 'cantidad', type: "integer" })
    Cantidad: number;

    @Column({ name: 'porcentaje', type: "numeric", precision: 10, scale: 2 })
    Porcentaje: number;

    @ManyToOne(() => Producto, (producto) => producto.Comision)
    @JoinColumn({ name: "idproducto" })
    Producto: Producto;

    @ManyToOne(() => Estado, (estado) => estado.Comision)
    @JoinColumn({ name: "idestado" })
    Estado: Estado;

}

