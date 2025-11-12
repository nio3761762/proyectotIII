import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, JoinColumn, ManyToOne } from "typeorm";
import { Tipoproveedor } from "./TipoProveedor";
import { Persona } from "./Persona";
import { Estado } from "./Estado";
import { Compra } from "./Compra";

@Entity()

export class Proveedor extends BaseEntity {
  @PrimaryColumn({ name: 'idproveedor', type: "varchar", length: 50 })
  IdProveedor: string;

  @Column({ name: 'razonsocial', type: "varchar", length: 255 })
  RazonSocial: string;

  @ManyToOne(() => Tipoproveedor, (tipoproveedor) => tipoproveedor.Proveedor)
  @JoinColumn({ name: "idtipoproveedor" })
  Tipoproveedor: Tipoproveedor;

  @OneToOne(() => Persona, (persona) => persona.Proveedor)
  @JoinColumn({ name: "idpersona" })
  Persona: Persona;

  @ManyToOne(() => Estado, (estado) => estado.Proveedor)
  @JoinColumn({ name: "idestado" })
  Estado: Estado;

  @OneToMany(() => Compra, (compra) => compra.Proveedor)
  Compra: Compra[];
}