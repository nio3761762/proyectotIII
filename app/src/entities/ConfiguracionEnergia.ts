import { Entity, BaseEntity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Insumo } from "./Insumo";

@Entity()
export class ConfiguracionEnergia extends BaseEntity {

  @PrimaryColumn({ name: "idconfig", type: "varchar", length: 100 })
  IdConfig: string;

  @Column({ name: "tipoenergia", type: "varchar", length: 30 })
  TipoEnergia: string;
  // ELECTRICO | GAS_DOMICILIO | GAS_GARRAFA

  @ManyToOne(() => Insumo, (i) => i.Configuracionenergia, { nullable: true })
  @JoinColumn({ name: "idinsumo" })
  Insumo: Insumo;
  // null si es eléctrico

  @Column({ name: "estado", type: "integer", default: 1 })
  Estado: number;
}