import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, JoinColumn, ManyToOne } from "typeorm";
import { Tipoproveedor } from "./TipoProveedor";
import { Persona } from "./Persona";
import { Compra } from "./Compra";

@Entity()
export class Proveedor extends BaseEntity {
  @PrimaryColumn({ name: 'idproveedor', type: "varchar", length: 50 })
  IdProveedor: string;

  @Column({ name: 'razonsocial', type: "varchar", length: 255 })
  RazonSocial: string;

  @Column({ name: 'nit', type: "integer", nullable:true})
  Nit: number;
  
  @Column({ name: "estado", type: "integer",default: 1}) 
  Estado: number; 

  @ManyToOne(() => Tipoproveedor, (tipoproveedor) => tipoproveedor.Proveedor)
  @JoinColumn({ name: "idtipoproveedor" })
  Tipoproveedor: Tipoproveedor;

  @OneToOne(() => Persona, (persona) => persona.Proveedor)
  @JoinColumn({ name: "idpersona" })
  Persona: Persona; 

  @OneToMany(() => Compra, (compra) => compra.Proveedor)
  Compra: Compra[];
}