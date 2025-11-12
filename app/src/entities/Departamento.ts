import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import bcrypt from "bcryptjs";
import { Persona } from "./Persona";
import { Pais } from "./Pais";
import { Ciudad } from "./Ciudad";

@Entity()
//@Check(`"Estado" IN (0, 1)`)
export class Departamento extends BaseEntity {
    @PrimaryColumn({ name: 'iddepto', type: "varchar", length: 50 })
    IdDepto: string;

    @Column({ name: 'nombre', type: "varchar", length: 100 })
    Nombre: string;

    @ManyToOne(() => Pais, (pais) => pais.Departamento)
    @JoinColumn({ name: "idpais" })
    Pais: Pais;

    @OneToMany(() => Ciudad, (ciudad) => ciudad.Departamento)
    Ciudad: Ciudad[];
}
