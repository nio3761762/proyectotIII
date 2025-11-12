import { BaseEntity, Check,OneToMany, Column, Entity, PrimaryColumn, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import bcrypt from "bcryptjs"; 
import { Producto } from "./Producto";

@Entity()
//@Check(`"Estado" IN (0, 1)`)
export class Marca extends BaseEntity {
    @PrimaryColumn({ name: 'idmarca', type: "varchar", length: 50 })
    IdMarca: string;

    @Column({ name: 'nombre', type: "varchar", length: 100 })
    Nombre: string;

    @OneToMany(() => Producto, (producto) => producto.Marca)
    Producto: Producto[];   
}
