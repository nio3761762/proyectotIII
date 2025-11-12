import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import bcrypt from "bcryptjs";
import { Persona } from "./Persona";
import { Pais } from "./Pais";
import { Ciudad } from "./Ciudad";
import { Barrio } from "./Barrio";

@Entity()
//@Check(`"Estado" IN (0, 1)`)
export class Distritos extends BaseEntity {
    @PrimaryColumn({ name: 'iddistrito', type: "varchar", length: 50 })
    IdDistrito: string;

    @Column({ name: 'nombre', type: "varchar", length: 100 })
    Nombre: string;

    @ManyToOne(() => Ciudad, (ciudad) => ciudad.Distrito)
    @JoinColumn({ name: "idciudad" })
    Ciudad: Ciudad;

    @OneToMany(() => Barrio, (barrio) => barrio.Distrito)
    Barrio: Barrio[];

}
