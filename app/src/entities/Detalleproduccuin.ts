import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Produccion } from "./Produccion";
import { Producto } from "./Producto";
import { Empleado } from "./Empleado";

@Entity()
export class DetalleProduccion extends BaseEntity {

  @PrimaryColumn({ name: "iddetalleproduccion", type: "varchar", length: 50 })
  IdDetalleProduccion: string;

  @ManyToOne(() => Produccion, (p) => p.Detalle)
  @JoinColumn({ name: "idproduccion" })
  Produccion: Produccion;

  @ManyToOne(() => Producto, (p) => p.Produccion)
  @JoinColumn({ name: "idproducto" })
  Producto: Producto;

  @ManyToOne(() => Empleado, (e) => e.Produccion)
  @JoinColumn({ name: "idempleado" })
  Empleado: Empleado;

  @Column({ name: "cantidad", type: "numeric", precision: 10, scale: 2 })
  Cantidad: number;

  @Column({ name: "cantidadmala", type: "numeric", precision: 10, scale: 2, default: 0 })
  CantidadMala: number;
  
  @Column({ name: "motivo", type: "text", default: null })
  Motivo: string

  @Column({ name: "costounitario", type: "numeric", precision: 10, scale: 4 })
  CostoUnitario: number;

  @Column({ name: "costototal", type: "numeric", precision: 12, scale: 2 })
  CostoTotal: number;
}