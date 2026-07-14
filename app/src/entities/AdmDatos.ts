import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, JoinColumn } from "typeorm";
import { Sucursal } from "./Sucursal";
import { Persona } from "./Persona";

@Entity()
export class Administrardatos extends BaseEntity {
    @PrimaryColumn({ name: 'iddatos', type: "integer" })
    IdDatos: number;

    @Column({ name: 'nombre', type: "varchar", length: 100 })
    Nombre: string;

    @Column({ name: 'celular', type: "varchar", length: 20 })
    Celular: string;
     
    @Column({ name: 'email', type: "varchar", length: 255, nullable: true })
    Email : string;

     @Column({ name: 'foto', type: "varchar", length: 255 })
    Foto : string;
    //Relacoion de uno a muchos con Sucurcal 

    @OneToMany(() => Sucursal, (sucursal) => sucursal.Datos)
    sucursal: Sucursal[]; 

    @OneToOne(() => Persona, (persona) => persona.Administrardatos)
    @JoinColumn({ name: "idpropietario" })
    Persona: Persona;   

}
