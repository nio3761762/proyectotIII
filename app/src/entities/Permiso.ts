import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne } from "typeorm";
import bcrypt from "bcryptjs";
import { Rolusuario } from "./RolUsuario";
import { Rolmenu } from "./RolMenu";
import { Menupermiso } from "./MenuPermiso";


@Entity()
//@Check(`"Estado" IN (0, 1)`)
export class Permiso extends BaseEntity {
  @PrimaryColumn({ name: 'idpermiso', type: "varchar", length: 50 })
  IdPermiso: string;

  @Column({ name: 'nombre', type: "varchar", length: 255 })
  Nombre: string;

  @OneToMany(() => Rolmenu, (rolmenu) => rolmenu.Permiso)
  Rolmenu: Rolmenu[];

  @OneToMany(() => Menupermiso, (rolmenu) => rolmenu.Permiso)
  Menupermiso: Menupermiso[];
}
