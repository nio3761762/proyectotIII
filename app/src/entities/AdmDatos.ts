import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, JoinColumn } from "typeorm";
import { Sucursal } from "./Sucursal";
import { Imagen } from "./Imagen";
import { Persona } from "./Persona";
import { Email } from "./Email";

@Entity()
//@Check(`"Estado" IN (0, 1)`)
export class Administrardatos extends BaseEntity {
    @PrimaryColumn({ name: 'iddatos', type: "integer" })
    IdDatos: number;

    @Column({ name: 'nombre', type: "varchar", length: 100 })
    Nombre: string;

    @Column({ name: 'celular', type: "varchar", length: 20 })
    Celular: string;

    //Relacoion de uno a muchos con Sucurcal 
    @OneToMany(() => Sucursal, (sucursal) => sucursal.Datos)
    sucursal: Sucursal[];

    @OneToOne(() => Imagen, (imagen) => imagen.Administrardatos)
    @JoinColumn({ name: "foto" })
    Imagen: Imagen;   

    @OneToOne(() => Persona, (persona) => persona.Administrardatos)
    @JoinColumn({ name: "idpropietario" })
    Persona: Persona;   

    @OneToOne(() => Email, (email) => email.Administrardatos)
    @JoinColumn({ name: "idemail" })
    Email: Email;   
}
