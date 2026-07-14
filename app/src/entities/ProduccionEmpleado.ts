import { Entity, BaseEntity, PrimaryColumn, ManyToOne, JoinColumn, Column } from "typeorm";
import { Empleado } from "./Empleado";
import { Produccion } from "./Produccion";
import { Sucursal } from "./Sucursal";

@Entity()
export class ProduccionEmpleado extends BaseEntity {

  @PrimaryColumn({ name: "idproduccionempleado", type: "varchar", length: 50 })
  IdProduccionEmpleado: string;

  @ManyToOne(() => Produccion, (p) => p.ProduccionEmpleado, {nullable:true})
  @JoinColumn({ name: "idproduccion" })
  Produccion: Produccion;

  @ManyToOne(() => Empleado , (em) => em.Produccion)
  @JoinColumn({ name: "idempleado" })
  Empleado: Empleado;

  @ManyToOne(() => Sucursal, (s) => s.Produccionempleado)
  @JoinColumn({ name: "idsucursal" })
  Sucursal: Sucursal;
  
  @Column({ name: "fecha", type: "date", nullable:true })
  Fecha: Date; 

  @Column({ name: "horainicio", type: "time" })
  HoraInicio: string;

  @Column({ name: "horafin", type: "time", nullable:true  })
  HoraFin: string;

  @Column({ name: "horas", type: "numeric", precision: 5, scale: 2 })
  Horas: number;

  @Column({ name: "costohora", type: "numeric", precision: 10, scale: 2 })
  CostoHora: number;

  @Column({ name: "costototal", type: "numeric", precision: 12, scale: 2 })
  CostoTotal: number;
}