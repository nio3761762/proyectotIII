import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Transferencia } from "./Transferencia";
import { Producto } from "./Producto";
import { Insumo } from "./Insumo";
import { Productomedida } from "./ProductoMedida";
import { Insumomedida } from "./InsumoMedida";

@Entity()
export class DetalleTransferencia extends BaseEntity {
  @PrimaryColumn({ name: 'iddetalletransferencia', type: "varchar", length :255})
  IdDetalleTransferencia: string;

  @ManyToOne(() => Transferencia, (t) => t.Detalletransferencia )
   @JoinColumn({name:'idtransferencia'})
  Transferencia: Transferencia;

  @ManyToOne(() => Producto, (p) => p.Detalletransferencia, { nullable: true })
  @JoinColumn({name:'idproducto'})
  Producto: Producto;

  @ManyToOne(() => Insumo, (i) => i.Detalletransferencia, { nullable: true })
  @JoinColumn({name:'idinsumo'})
  Insumo: Insumo;
  
   @ManyToOne(() => Insumomedida, (pm) => pm.DetalleTransferencia, {nullable: true})
  @JoinColumn({name:'idinsumomedida'})
  Insumomedida: Insumomedida;

  @ManyToOne(() => Productomedida, (pm) => pm.DetalleTransferencia, {nullable: true})
  @JoinColumn({name:'idproductomedida'})
  ProductoMedida: Productomedida;


  @Column({name:'cantidad', type: "numeric", precision: 12, scale: 3 })
  Cantidad: number;
}