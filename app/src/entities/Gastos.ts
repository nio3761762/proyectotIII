import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, OneToOne, OneToMany, BaseEntity } from "typeorm";
import { Sucursal } from "./Sucursal";

@Entity()
export class Gasto extends BaseEntity {
  @PrimaryColumn({ name: "idgasto", type: "varchar", length: 50 })
  IdGasto: string;

  @Column({ name: "servicio", type: "varchar", length: 100 })
  Servicio: string; // Ej: Luz, Agua, Gas, Internet

  @Column({ name: "tipo", type: "varchar", length: 50 })
  Tipo: string; // FIJO | VARIABLE

  @Column({ name: "monto", type: "numeric", precision: 12, scale: 2 })
  Monto: number;

  @Column({ name: "consumo", type: "numeric", precision: 12, scale: 2, default:0 })
  Consumo: number;

  @Column({ name: "fecha", type: "date" })
  Fecha: Date;

  @Column({ name: "periodo", type: "varchar", length: 7 })
  Periodo: string; // Ej: "2026-04" 🔥 importante

  @ManyToOne(() => Sucursal, (s) => s.Gasto)
  @JoinColumn({ name: "idsucursal" })
  Sucursal: Sucursal;

  @Column({ name: "estado", type: "integer", default: 1 })
  Estado: number;

}

