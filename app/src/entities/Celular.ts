import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, JoinColumn, ManyToOne } from "typeorm";
import { Rol } from "./Rol";
import { Menu } from "./Menu";
import { Persona } from "./Persona";
import { Estado } from "./Estado";

@Entity()
export class Celular extends BaseEntity {
    @PrimaryColumn({ name: 'idcelular', type: "varchar", length: 50 })
    IdCelular: string;

    @Column({ name: 'numero', type: "varchar", length: 20 })
    Numero: string;

    @ManyToOne(() => Persona, (persona) => persona.Celulares)
    @JoinColumn({ name: "idpersona" })
    Persona: Persona;

    @ManyToOne(() => Estado, (estado) => estado.Celular)
    @JoinColumn({ name: "idestado" })
    Estado: Estado;
}