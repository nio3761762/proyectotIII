import {Entity,PrimaryColumn,Column,BaseEntity,ManyToOne,JoinColumn,} from "typeorm";
import { Revendedorcontroldetalle } from "./RevendedorControlDetalle ";

@Entity()
export class Revendedorcontrolprecio extends BaseEntity {

  @PrimaryColumn({name: "idrevendedorcontrolprecio",type: "varchar",length: 100})
  IdRevendedorControlPrecio: string;

  @ManyToOne(() => Revendedorcontroldetalle, (rc) => rc.Revendedorcontrolprecio)
  @JoinColumn({ name: "idrevendedorcontroldetalle" })
  RevendedorControlDetalle: Revendedorcontroldetalle;

  @Column({name: "cantidad",type: "numeric",precision: 10,scale: 2,default:0})
  Cantidad: number;

  @Column({name: "precioventa",type: "numeric", precision: 10,scale: 2,default:0})
  PrecioVenta: number;

  @Column({name: "estado",type: "varchar",length: 50,nullable:true})
  Estado: string;

  @Column({name: "observacion",type: "varchar",length: 255,nullable: true,})
  Observacion: string;
}