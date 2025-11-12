import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, JoinColumn, ManyToOne } from "typeorm";
import { Rol } from "./Rol";
import { Menu } from "./Menu";
import { Permiso } from "./Permiso";

@Entity()
export class Rolmenu extends BaseEntity {
    @PrimaryColumn({ name: 'idrolmenu', type: "varchar", length: 50 })
    IdRolMenu: string;

    @Column({ name: 'fecharegistro', type: "date" })
    FechaRegistro: Date;

    @ManyToOne(() => Rol, (rol) => rol.rolMenus)
    @JoinColumn({ name: "idrol" })
    rol: Rol;

    @ManyToOne(() => Permiso, (permiso) => permiso.Rolmenu, { nullable: true })
    @JoinColumn({ name: "idpermiso" })
    Permiso: Permiso;

    @ManyToOne(() => Menu, (menu) => menu.rolMenus)
    @JoinColumn({ name: "idmenu" })
    menu: Menu;

    @Column({ name: 'permitido', type: "integer" })
    Permitido: number;


}
