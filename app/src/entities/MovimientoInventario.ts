import { Entity, BaseEntity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Insumo } from "./Insumo";
import { Producto } from "./Producto";
import { Sucursal } from "./Sucursal";
import { Inventario } from "./Inventario";

@Entity()
export class MovimientoInventario extends BaseEntity {
  @PrimaryColumn({ name: "idmovimiento", type: "varchar", length: 150 })
  IdMovimiento: string;

  @Column({ name:'tipo',type: "varchar", length: 150, nullable:true })
  Tipo: string;
  // SALIDA_PRODUCCION
  // ENTRADA_PRODUCCION
  // SALIDA_VENDEDOR
  // SALIDA_ORIGENS
  // ENTRADA_DESTINOS

  @Column({ name:'cantidad',type: "numeric", precision: 12, scale: 3 })
  Cantidad: number;

  @Column({  name:'fecha', type: "timestamp" })
  Fecha: Date;

  @ManyToOne(() => Insumo, (i) => i.Movimiento,{ nullable: true })
  @JoinColumn({ name: "idinsumo" })
  Insumo: Insumo;

  @ManyToOne(() => Producto,(p) => p.Movimiento, { nullable: true })
  @JoinColumn({ name: "idproducto" })
  Producto: Producto;

  @ManyToOne(() => Sucursal, (s) => s.Movimiento)
  @JoinColumn({ name: "idsucursal" })
  Sucursal: Sucursal;
   
  
  // 🔥 COSTOS HISTÓRICOS
  @Column({ name:"costounitario",type: "numeric", precision: 14, scale: 6, nullable: true })
  CostoUnitario: number;

  @Column({ name:"costototal",type: "numeric", precision: 14, scale: 3, nullable: true })
  CostoTotal: number;

  // 🔥 LOTE AFECTADO
@ManyToOne(() => Inventario, (inv) => inv.Movimiento, { nullable: true })
@JoinColumn({ name: "idinventario" })
Inventario: Inventario;

  @Column({ name:'idreferencia', type:'varchar', length:150 ,nullable: true })
  IdReferencia: string; // id
}