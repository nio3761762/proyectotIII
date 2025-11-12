import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, OneToOne, OneToMany, BaseEntity } from "typeorm";
import { Estado } from "./Estado";
import { Usuario } from "./Usuario";
import { Sucursal } from "./Sucursal";

@Entity()
export class Usuariosucursal extends BaseEntity {
    @PrimaryColumn({ name: "idusuariosucursal", type: "varchar", length: 100 })
    IdUsuarioSucursal: string;

    @Column({ name: "fechaasignado", type: "date" })
    FechaAsignado: Date;

    @Column({ name: "fechaactualizacion", type: "date", nullable: true })
    FechaActualizacion: Date;

    @ManyToOne(() => Estado, (estado) => estado.Usuariosucursal)
    @JoinColumn({ name: "idestado" })
    Estado: Estado;

    @ManyToOne(() => Usuario, (usuario) => usuario.Usuariosucursal)
    @JoinColumn({ name: "idusuario" })
    Usuario: Usuario;


    @ManyToOne(() => Sucursal, (sucursal) => sucursal.Usuariosucursal)
    @JoinColumn({ name: "idsucursal" })
    Sucursal: Sucursal;

}
