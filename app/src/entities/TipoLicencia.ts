import { Entity, Column, PrimaryColumn, BaseEntity, OneToMany } from "typeorm";
import { Repartidor } from "./Repartidor";

@Entity()
export class TipoLicencia extends BaseEntity {

  @PrimaryColumn({ name: "idtipolicencia", type: "varchar", length: 150 })
  IdTipoLicencia: string;

  @Column({ name: "nombretipolicencia", type: "varchar", length: 100, unique: true })
  NombreTipoLicencia: string;

  @OneToMany(() => Repartidor, (repartidor) => repartidor.TipoLicencia)
  Repartidores: Repartidor[];
}
