import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, JoinColumn, ManyToOne } from "typeorm";
import { Rol } from "./Rol";
import { Menu } from "./Menu";
import { Permiso } from "./Permiso";

@Entity()
export class Menupermiso extends BaseEntity {
    @PrimaryColumn({ name: 'idmenupermiso', type: "varchar", length: 50 })
    IdMenuPermiso: string;


    @ManyToOne(() => Menu, (menu) => menu.Menupermiso)
    @JoinColumn({ name: "idmenu" })
    menu: Menu;

    @ManyToOne(() => Permiso, (permiso) => permiso.Menupermiso)
    @JoinColumn({ name: "idpermiso" })
    Permiso: Permiso;
}
