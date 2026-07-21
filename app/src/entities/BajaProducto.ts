import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Produccion } from "./Produccion";
import { Producto } from "./Producto";
import { Sucursal } from "./Sucursal";

@Entity()
export class BajaProducto extends BaseEntity {

  @PrimaryColumn({ name: "idbaja", type: "varchar", length: 50 })
  IdBaja: string;

  @ManyToOne(() => Produccion, (p) => p.Bajas, { nullable: true })
  @JoinColumn({ name: "idproduccion" })
  Produccion: Produccion | null;

  @ManyToOne(() => Sucursal)
  @JoinColumn({ name: "idsucursal" })
  Sucursal: Sucursal;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: "idproducto" })
  Producto: Producto;

  @Column({ name: "cantidad", type: "numeric", precision: 10, scale: 2 })
  Cantidad: number;

  @Column({ name: "motivo", type: "text", default: null })
  Motivo: string;

  @Column({ name: "fecha", type: "date" })
  Fecha: Date;

  @Column({ name: "hora", type: "time" })
  Hora: string;
}
