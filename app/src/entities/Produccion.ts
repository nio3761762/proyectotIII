import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, PrimaryColumn } from "typeorm";
import { Producto } from "./Producto";
import { Sucursal } from "./Sucursal";
import { Empleado } from "./Empleado";
import { DetalleProduccion } from "./Detalleproduccuin";
import { ProduccionEmpleado } from "./ProduccionEmpleado";
import { Horno } from "./Horno";
import { ProduccionHornoDetalle } from "./Produccionhornodetalle";
import { BajaProducto } from "./BajaProducto";

@Entity()
export class Produccion extends BaseEntity {
  @PrimaryColumn({ name: "idproduccion", type: "varchar", length: 150 })
  IdProduccion: string;

  @Column({name:'fechaproduccion', type: "date",nullable: true})
  FechaProduccion: Date;

  @Column({ name: "horainicio", type: "time", nullable: true })
  HoraInicio: string;

  @Column({ name: "horafin", type: "time", nullable: true })
  HoraFin: string;

  // La sucursal donde se realizó la producción
  @ManyToOne(() => Sucursal, (consumo) => consumo.Produccion)
  @JoinColumn({ name: "idsucursal" })
  Sucursal: Sucursal;


  @Column({ name: "costototal", type: "numeric", precision: 12, scale: 2, default: 0 })
  CostoTotal: number;
  
  @Column({ name: "estado", type: "integer", default: 1 })
  estado: number;

  @Column({ name: "costoinsumos", type: "numeric", precision: 12, scale: 2, default: 0 })
  CostoInsumos: number;

  @Column({ name: "costomanobra", type: "numeric", precision: 12, scale: 2, default: 0 })
  CostoManoObra: number;

  @Column({ name: "costoindirecto", type: "numeric", precision: 12, scale: 2, default: 0 })
  CostoIndirecto: number;

  @Column({ name: "observacion", type: "text", nullable: true })
  Observacion: string;
  
  @OneToMany(() => DetalleProduccion, (d) => d.Produccion)
  Detalle: DetalleProduccion[];

  @OneToMany(() => ProduccionEmpleado, (pe) => pe.Produccion)
  ProduccionEmpleado: ProduccionEmpleado[];

  @OneToMany(() => ProduccionHornoDetalle, he => he.Produccion)
  DetalleHorno: ProduccionHornoDetalle[];

  @OneToMany(() => BajaProducto, (b) => b.Produccion)
  Bajas: BajaProducto[];
}