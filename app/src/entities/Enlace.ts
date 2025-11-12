import {
  BaseEntity,
  Column,
  Entity,
  PrimaryColumn,
  OneToMany,
  OneToOne
} from "typeorm";
import { Menu } from "./Menu";
import { Factura } from "./Factura";

@Entity()
export class Enlace extends BaseEntity {
  @PrimaryColumn({ name: "idenlace", type: "varchar", length: 50 })
  IdEnlace: string;

  @Column({ name: "enlace", type: "varchar", length: 255 })
  Enlace: string;

  @OneToOne(() => Menu, (menu) => menu.Enlace)
  Menu: Menu;

  @OneToOne(() => Factura, (factura) => factura.Enlace)
  Factura: Factura;
}