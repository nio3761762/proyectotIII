import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, JoinColumn } from "typeorm";
import { Rolmenu } from "./RolMenu";
import { Icono } from "./Icono";
import { Enlace } from "./Enlace";
import { Menupermiso } from "./MenuPermiso";

@Entity()
//@Check(`"Estado" IN (0, 1)`)
export class Menu extends BaseEntity {
   @PrimaryColumn({ name: 'idmenu', type: "varchar", length: 50 })
   IdMenu: string;

   @Column({ name: 'nombre', type: "varchar", length: 100 })
   Nombre: string;

   @Column({ name: 'visible', type: "integer" })
   Visible: number;

   @OneToOne(() => Icono, (icono) => icono.Menu, { nullable:true})
   @JoinColumn({ name: "idicono" })
   Icono: Icono;

   @OneToOne(() => Enlace, (enlace) => enlace.Menu)
   @JoinColumn({ name: "idenlace" })
   Enlace: Enlace;

   @OneToMany(() => Rolmenu, (rolmenu) => rolmenu.menu)
   rolMenus: Rolmenu[];

   @OneToMany(() => Menupermiso, (rolmenu) => rolmenu.menu)
   Menupermiso: Menupermiso[];

}
