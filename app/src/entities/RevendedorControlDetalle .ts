import {
  Entity,
  PrimaryColumn,
  Column,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Productomedida } from "./ProductoMedida";
import { Revendedorcontrol } from "./RevendedorControl ";
import { Revendedorcontrolprecio } from "./RevendedorControlPrecio";

@Entity()
export class Revendedorcontroldetalle extends BaseEntity {

  @PrimaryColumn({name: "idrevendedorcontroldetalle",type: "varchar",length: 100 })
  IdRevendedorControlDetalle: string;

  @ManyToOne(() => Revendedorcontrol, (es)=> es.Detalles )
  @JoinColumn({ name: "idrevendedorcontrol" })
  RevendedorControl: Revendedorcontrol;

  @ManyToOne(() => Productomedida, (pm) => pm.Control)
  @JoinColumn({ name: "idproductomedida" })
  ProductoMedida: Productomedida;

  @OneToMany(() => Revendedorcontrolprecio, (pp) => pp.RevendedorControlDetalle)
      Revendedorcontrolprecio: Revendedorcontrolprecio[];

  @Column({name: "cantidadentregada",type: "numeric",precision: 10,scale: 2,default: 0})
  CantidadEntregada: number;

  @Column({name: "cantidaddevuelta",type: "numeric",precision: 10,scale: 2,default: 0})
  CantidadDevuelta: number;

  @Column({name: "precioventa",type: "numeric",precision: 10,scale: 2,default: 0})
  PrecioVenta: number;

  @Column({name: "cantidadsincomision",type: "numeric",precision: 10,scale: 2,default: 0})
  CantidadSinComision: number;

  @Column({name: "comisionunitaria",type: "numeric",precision: 10,scale: 2,default: 0})
  ComisionUnitaria: number;

  @Column({name: "motivo",type: "varchar",length: 255,nullable: true})
  Motivo: string;
}