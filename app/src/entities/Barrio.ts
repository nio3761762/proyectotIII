import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import bcrypt from "bcryptjs";
import { Ciudad } from "./Ciudad";
import { Direccion } from "./DIreccion";
import { Distritos } from "./Distritos";

@Entity()
//@Check(`"Estado" IN (0, 1)`)
export class Barrio extends BaseEntity {
    @PrimaryColumn({ name: 'idbarrio', type: "varchar", length: 50 })
    IdBarrio: string;

    @Column({ name: 'nombre', type: "varchar", length: 100 })
    Nombre: string;

    @ManyToOne(() => Distritos, (distrito) => distrito.Barrio)
    @JoinColumn({ name: "iddistrito" })
    Distrito: Distritos;

    @OneToMany(() => Direccion, (direccion) => direccion.Barrio)
    Direccion: Direccion[];
}
