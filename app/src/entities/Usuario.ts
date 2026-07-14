import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, JoinColumn, ManyToOne } from "typeorm";
import bcrypt from "bcryptjs";
import { Persona } from "./Persona";
import { Rolusuario } from "./RolUsuario";
import { Venta } from "./Venta";
import { Pedido } from "./Pedido";

@Entity()
//@Check(`"Estado" IN (0, 1)`)
export class Usuario extends BaseEntity {
  @PrimaryColumn({ name: 'idusuario', type: "varchar", length: 150 })
  IdUsuario: string;

  @Column({ name: 'contrasena', type: "varchar", length: 150 })
  Contrasena: string;
  
  @Column({ name: 'username', type: "varchar", length: 150, nullable:true })
  Username   : string;  

  // @Column({ name: 'pin', type: "varchar", length: 150 })
  // Pin: string;

  @Column({ type: "varchar", length: 10, nullable: true })
  PinRecuperacion: string | null;

  @OneToOne(() => Persona, (persona) => persona.Usuario)
  @JoinColumn({ name: "idpersona" })
  Persona: Persona;

  @Column({ name: "estado", type: "integer",default: 1}) 
  Estado: number; 

  @OneToMany(() => Rolusuario, (rolusuario) => rolusuario.Usuario)
  Rolusuario: Rolusuario[];

  @OneToMany(() => Venta, (venta) => venta.Usuario)
  Venta: Venta[];

  @OneToMany(() => Pedido, (pedido) => pedido.Usuario)
  Pedido: Pedido[];
}
