import {
  BaseEntity,
  Column,
  Entity,
  PrimaryColumn,
  OneToMany,
  OneToOne
} from "typeorm";
import { Menu } from "./Menu";

@Entity()
export class Icono extends BaseEntity {
  @PrimaryColumn({ name: "idicono", type: "varchar", length: 50 })
  IdIcono: string;

  @Column({ name: "icono", type: "varchar", length: 255 })
  Icono: string;

  @OneToOne(() => Menu, (menu) => menu.Icono)
  Menu: Menu;
}