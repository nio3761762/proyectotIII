import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import bcrypt from "bcryptjs";
import { Persona } from "./Persona";
import { Departamento } from "./Departamento";
import { Barrio } from "./Barrio";
import { Distritos } from "./Distritos";

@Entity()
//@Check(`"Estado" IN (0, 1)`)
export class Ciudad extends BaseEntity {
    @PrimaryColumn({ name: 'idciudad', type: "varchar", length: 50 })
    IdCiudad: string;

    @Column({ name: 'nombre', type: "varchar", length: 100 })
    Nombre: string;

    @ManyToOne(() => Departamento, (departamento) => departamento.Ciudad)
    @JoinColumn({ name: "iddepto" })
    Departamento: Departamento;

    @OneToMany(() => Distritos, (distrito) => distrito.Ciudad)
    Distrito: Distritos[];
}
