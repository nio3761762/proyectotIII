import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, JoinColumn, ManyToOne } from "typeorm";
import { Rol } from "./Rol";
import { Usuario } from "./Usuario";

@Entity()
//@Check(`"Estado" IN (0, 1)`)
export class Rolusuario extends BaseEntity {
    @PrimaryColumn({ name: 'idrolusuario', type: "varchar", length: 50 })
    IdRolUsuario: string;

    @Column({ name: 'fecharegistro', type: "date" })
    FechaRegistro: Date;

    @Column({ name: 'fechaactualizacion', type: "date", nullable: true })
    FechaActualizacion: Date;

    @ManyToOne(() => Rol, (rol) => rol.Rolusuario)
    @JoinColumn({ name: "idrol" })
    Rol: Rol;

    @ManyToOne(() => Usuario, (usuario) => usuario.Rolusuario)
    @JoinColumn({ name: "idusuario" })
    Usuario: Usuario;

}
