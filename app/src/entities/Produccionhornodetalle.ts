import { Entity, BaseEntity, PrimaryColumn, ManyToOne, JoinColumn, Column, OneToMany } from "typeorm";
import { Horno } from "./Horno";
import { Produccion } from "./Produccion";
import { Producto } from "./Producto";
import { Hornoproducto } from "./HornoProduccto";

@Entity()
export class ProduccionHornoDetalle extends BaseEntity {

  @PrimaryColumn({ name: "idproduccionhornodetalle", type: "varchar", length: 150 })
  IdProduccionHornoDetalle: string;

  // 🔥 RELACIÓN CON PRODUCCIÓN (cabecera)
  @ManyToOne(() => Produccion, (p) => p.DetalleHorno)
  @JoinColumn({ name: "idproduccion" })
  Produccion: Produccion;

  // 🔥 HORNO UTILIZADO
  @ManyToOne(() => Horno, (h) => h.Detalle)
  @JoinColumn({ name: "idhorno" })
  Horno: Horno;

   @OneToMany(() => Hornoproducto, he => he.ProduccionHornoDetalle)
    Hornoproducto: Hornoproducto[];
       
  // 🔥 ENERGÍA USADA EN ESE TRAMO
  @Column({ name: "tipoenergia", type: "varchar", length: 30 })
  TipoEnergia: string;
  // ELECTRICO | GAS_DOMICILIO | GAS_GARRAFA
  
   @Column({ name: "fecha", type: "date"})
  Fecha: Date;
  // 🔥 CONTROL DE TIEMPO (MUY IMPORTANTE)
  @Column({ name: "horainicio", type: "time" })
  HoraInicio: string;

  @Column({ name: "horafin", type: "time", nullable:true })
  HoraFin: string;

  @Column({ name: "horas", type: "numeric", precision: 5, scale: 2, nullable:true })
  Horas: number;

  // 🔥 CONSUMO DE ENERGÍA (kg gas o kWh)
  @Column({ name: "consumo", type: "numeric", precision: 12, scale: 4, default: 0 })
  Consumo: number;

  // 🔥 COSTO DE ESTE TRAMO
  @Column({ name: "costo", type: "numeric", precision: 12, scale: 2, default: 0 })
  Costo: number;

}