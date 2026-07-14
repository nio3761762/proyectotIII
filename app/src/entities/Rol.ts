import { BaseEntity, Check, Column, OneToMany, Entity, PrimaryGeneratedColumn, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { Rolmenu } from "./RolMenu";
import { Rolusuario } from "./RolUsuario";

@Entity()
export class Rol extends BaseEntity {
    @PrimaryColumn({ name: 'idrol', type: "varchar", length: 50 })
    IdRol: string;

    @Column({ name: 'nombre', type: "varchar", length: 100 })
    Nombre: string;

    @Column({ name: 'fecharegistro', type: "date" })
    FechaRegistro: Date;

    @Column({ name: 'fechaactualizacion', type: "date", nullable: true })
    FechaActualizacion: Date;

    @OneToMany(() => Rolmenu, (rolmenu) => rolmenu.rol)
    rolMenus: Rolmenu[];

    @OneToMany(() => Rolusuario, (rolusuario) => rolusuario.Rol)
    Rolusuario: Rolusuario[];

    @Column({ name: "estado", type: "integer",default: 1}) 
    Estado: number; 
}
