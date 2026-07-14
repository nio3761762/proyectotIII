import { Entity, PrimaryColumn, Column, BaseEntity } from "typeorm";

@Entity()
export class GastoGeneral extends BaseEntity {
  @PrimaryColumn({ name: "idgastogeneral", type: "varchar", length: 100 })
  IdGastoGeneral: string;

  @Column({ name: "nombre", type: "varchar", length: 255 })
  Nombre: string;

  @Column({ name: "fecha", type: "date" })
  Fecha: Date;

  @Column({ name: "costo", type: "numeric", precision: 12, scale: 2 })
  Costo: number;

  @Column({ name: "estado", type: "integer", default: 1 })
  Estado: number;
}
