import { Entity, BaseEntity, PrimaryColumn, ManyToOne, JoinColumn, Column } from "typeorm";
import { Horno } from "./Horno";
import { Produccion } from "./Produccion";
import { Producto } from "./Producto";
import { ProduccionHornoDetalle } from "./Produccionhornodetalle";
import { Empleado } from "./Empleado";

@Entity()
export class Hornoproducto extends BaseEntity {

  @PrimaryColumn({ name: "idhornoproducto", type: "varchar", length: 150 })
  Idhornoproducto: string;

  // 🔥 RELACIÓN CON PRODUCCIÓN (cabecera)
  @ManyToOne(() => ProduccionHornoDetalle, (p) => p.Hornoproducto)
  @JoinColumn({ name: "idproduccionhornodetalle" })
  ProduccionHornoDetalle: ProduccionHornoDetalle;

  // 🔥 PRODUCTO QUE SE PRODUJO EN ESE HORNO
  @ManyToOne(() => Producto, (p) => p.Hornoproducto)
  @JoinColumn({ name: "idproducto" })
  Producto: Producto;

  // 🔥 EMPLEADO QUE REALIZÓ LA SALIDA
  @ManyToOne(() => Empleado, (e) => e.Produccion)
  @JoinColumn({ name: "idempleado" })
  Empleado: Empleado;

  // 🔥 CUÁNTOS SE PRODUJERON EN ESE HORNO
  @Column({ name: "cantidad", type: "numeric", precision: 12, scale: 2 })
  Cantidad: number;

  @Column({ name: "hora", type: "time", nullable: true })
  Hora: string;
}