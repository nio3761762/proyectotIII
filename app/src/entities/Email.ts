import {
  BaseEntity,
  Column,
  Entity,
  PrimaryColumn,
  OneToMany,
  OneToOne,
  JoinColumn
} from "typeorm";
import { Persona } from "./Persona";
import { Administrardatos } from "./AdmDatos";

@Entity()
export class Email extends BaseEntity {
  @PrimaryColumn({ name: "idemail", type: "varchar", length: 150 })
  IdEmail: string;

  @Column({ name: "email", type: "varchar", length: 255 })
  Email: string;

  @OneToOne(() => Persona, (persona) => persona.Email)
  @JoinColumn({ name: "idpersona" })
  Persona: Persona;

    @OneToOne(() => Administrardatos, (dato) => dato.Email)
    Administrardatos: Administrardatos;
}