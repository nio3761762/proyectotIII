import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne } from "typeorm";
import { Persona } from "./Persona";
import { Proveedor } from "./Proveedor";

@Entity()
//@Check(`"Estado" IN (0, 1)`)
export class Tipoproveedor extends BaseEntity {
    @PrimaryColumn({ name: 'idtipoproveedor', type: "integer" })
    IdTipoProveedor: number;

    @Column({ name: 'nombre', type: "varchar", length: 150 })
    Nombre: string;

    @OneToMany(() => Proveedor, (proveedor) => proveedor.Tipoproveedor)
    Proveedor: Proveedor[];

}
