import { Entity, Column, PrimaryColumn, BaseEntity, OneToMany } from "typeorm";
import { Repartidor } from "./Repartidor";

@Entity()
export class EmpresaReparto extends BaseEntity {

  @PrimaryColumn({ name: "idempresareparto", type: "varchar", length: 150 })
  IdEmpresaReparto: string;

  @Column({ name: "nombreempresa", type: "varchar", length: 100, unique: true })
  NombreEmpresa: string;

  @OneToMany(() => Repartidor, (repartidor) => repartidor.EmpresaReparto)
  Repartidores: Repartidor[];
}
