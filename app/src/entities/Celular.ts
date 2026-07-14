import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, JoinColumn, ManyToOne } from "typeorm";
import { Persona } from "./Persona";


@Entity()
export class Celular extends BaseEntity {
    @PrimaryColumn({ name: 'idcelular', type: "varchar", length: 50 })
    IdCelular: string;

    @Column({ name: 'numero', type: "varchar", length: 20 })
    Numero: string;

    @ManyToOne(() => Persona, (persona) => persona.Celulares)
    @JoinColumn({ name: "idpersona" })
    Persona: Persona;

    @Column({ name: "estado", type: "integer",default: 1}) 
    Estado: number;
}