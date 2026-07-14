import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import { Persona } from "./Persona";
import { Barrio } from "./Barrio";
import { Sucursal } from "./Sucursal";

@Entity()
export class Direccion extends BaseEntity {
  @PrimaryColumn({ name: 'iddireccion', type: "varchar", length: 255 })
  IdDireccion: string;

  @Column({ name: 'direccion', type: "varchar", length: 255, nullable: true  })
  Direccion: string;

  @Column({ name: 'referencia', type: "varchar", length: 120, nullable: true  })
  Referencia: string;

  @Column({ name: 'ubicacion', type: "varchar", length: 255, nullable: true  })
  Ubicacion: string;

  @ManyToOne(() => Barrio, (barrio) => barrio.Direccion,{ nullable: true })
  @JoinColumn({ name: "idbarrio" })
  Barrio: Barrio;

  @OneToOne(() => Persona, (persona) => persona.Direccion)
  Persona: Persona;

  @OneToOne(() => Sucursal  , (sucursal) => sucursal.Direccion)
  Sucursal:Sucursal;

}
