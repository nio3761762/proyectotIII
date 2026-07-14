import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { Insumo } from "./Insumo";
import { Producto } from "./Producto";
import { Sucursal } from "./Sucursal";
import { MovimientoInventario } from "./MovimientoInventario";
import { Unidadmedida } from "./UnidadMedida";

@Entity()
export class Inventario extends BaseEntity {
  @PrimaryColumn({ name: "idinventario", type: "varchar", length: 150 })
  IdInventario: string;

  @ManyToOne(() => Insumo, (i) => i.Inventario, { nullable: true })
  @JoinColumn({ name: "idinsumo" })
  Insumo: Insumo;

  @ManyToOne(() => Producto, (p) => p.Inventario, { nullable: true })
  @JoinColumn({ name: "idproducto" })
  Producto: Producto;

  @ManyToOne(() => Sucursal, (s) => s.Inventario)
  @JoinColumn({ name: "idsucursal" })
  Sucursal: Sucursal;

  @Column({name: 'stock', type: "numeric", precision: 12, scale: 3 })
  Stock: number; // SIEMPRE en unidad base (ej: gramos)

  @Column({name: 'cantidad', type: "integer",default:0 })
  Cantidad: number; // Cantidad original (ej: quintales, bolsas)

  @ManyToOne(() => Unidadmedida, { nullable: true })
  @JoinColumn({ name: "idunidadmedida" })
  Unidadmedida: Unidadmedida; // Unidad original (ej: Bolsas)
  
  @Column({name:"preciounitario", type: "numeric", precision: 14, scale: 6, default:0 })
  Preciounitario: number;

  // 🔥 COSTO REAL UNITARIO DEL LOTE
  @Column({name:"costounitario", type: "numeric", precision: 14, scale: 6 })
  CostoUnitario: number;

  // 🔥 FECHA DE ENTRADA (FIFO)
  @Column({name:"fechaingreso", type: "timestamp", nullable:true })
  FechaIngreso: Date;

  // 🔥 REFERENCIA (COMPRA, PRODUCCIÓN, TRANSFERENCIA)
  @Column({name:"idreferencia", type: "varchar", length: 150, nullable: true })
  IdReferencia: string;

  @Column({name:"tipoorigen", type: "varchar", length: 30, nullable:true })
  TipoOrigen: string;
  // COMPRA | PRODUCCION | TRANSFERENCIA

  @Column({name:"estado", type: "integer", default: 1 })
  Estado: number;

    @OneToMany(() => MovimientoInventario, (productosucursal) => productosucursal.Inventario)
  Movimiento: MovimientoInventario[];
}
