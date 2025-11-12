import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, JoinColumn, ManyToOne } from "typeorm";
import bcrypt from "bcryptjs";
import { Persona } from "./Persona";
import { Estado } from "./Estado";
import { Rolusuario } from "./RolUsuario";
import { Venta } from "./Venta";
import { Usuariosucursal } from "./UsuarioSucursal";

@Entity()
//@Check(`"Estado" IN (0, 1)`)
export class Usuario extends BaseEntity {
  @PrimaryColumn({ name: 'idusuario', type: "varchar", length: 150 })
  IdUsuario: string;

  @Column({ name: 'contrasena', type: "varchar", length: 150 })
  Contrasena: string;

  @Column({ name: 'pin', type: "varchar", length: 150 })
  Pin: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  Token: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  RToken: string | null;

  @Column({ type: "varchar", length: 10, nullable: true })
  PinRecuperacion: string | null;

  @OneToOne(() => Persona, (persona) => persona.Usuario)
  @JoinColumn({ name: "idpersona" })
  Persona: Persona;

  @ManyToOne(() => Estado, (estado) => estado.Usuario)
  @JoinColumn({ name: "idestado" })
  Estado: Estado;

  @OneToMany(() => Rolusuario, (rolusuario) => rolusuario.Usuario)
  Rolusuario: Rolusuario[];

   @OneToMany(() => Usuariosucursal, (usuariosucursal) =>  usuariosucursal.Usuario)
   Usuariosucursal:  Usuariosucursal[];

  @OneToMany(() => Venta, (venta) => venta.Usuario)
  Venta: Venta[];
}
