import { BaseEntity, Column, Entity, PrimaryColumn, OneToMany } from "typeorm";
import { Pedido } from "./Pedido";

@Entity()
export class Tipopedido extends BaseEntity {
  @PrimaryColumn({ name: "idtipopedido", type: "varchar", length: 50 })
  IdTipoPedido: string;

  @Column({ name: "nombre", type: "varchar", length: 50 })
  Nombre: string;

  @OneToMany(() => Pedido, (pedido) => pedido.Tipopedido)
  Pedido: Pedido[];
}
