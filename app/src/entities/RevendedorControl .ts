import {
  Entity,
  PrimaryColumn,
  Column,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Empleado } from "./Empleado";
import { Persona } from "./Persona";
import { Sucursal } from "./Sucursal";
import { Revendedorcontroldetalle } from "./RevendedorControlDetalle ";

@Entity()
export class Revendedorcontrol extends BaseEntity {

  @PrimaryColumn({name: "idrevendedorcontrol",type: "varchar",length: 100})
  IdRevendedorControl: string;

  @Column({name: "fecha",type: "date"})
  Fecha: Date;

  @Column({name: "hora",type: "time", nullable: true})
  Hora: string;

  @Column({name: "observacion",type: "text",nullable: true})
  Observacion: string;

  @Column({name: "estado", type: "integer", default: 1})
  Estado: number;

  @ManyToOne(() => Persona, { nullable: true })
  @JoinColumn({ name: "idpersona" })
  Persona: Persona | null;

  @ManyToOne(() => Empleado, { nullable: true })
  @JoinColumn({ name: "idempleado" })
  Empleado: Empleado | null;

  @ManyToOne(() => Sucursal)
  @JoinColumn({ name: "idsucursal" })
  Sucursal: Sucursal;

  @OneToMany(() => Revendedorcontroldetalle,(detalle) => detalle.RevendedorControl)
  Detalles: Revendedorcontroldetalle[];
}