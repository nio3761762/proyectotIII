import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, JoinColumn, ManyToOne } from "typeorm";
import bcrypt from "bcryptjs";
import { Persona } from "./Persona";
import { Estado } from "./Estado";
import { Rolusuario } from "./RolUsuario";

@Entity()
//@Check(`"Estado" IN (0, 1)`)
export class Cliente extends BaseEntity {
    @PrimaryColumn({ name: 'idcliente', type: "varchar", length: 150 })
    IdCliente: string;

    // @OneToOne(() => Persona, (persona) => persona.Cliente)
    // @JoinColumn({ name: "idpersona" })
    // Persona: Persona;
}
