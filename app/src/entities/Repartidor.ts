
import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn, BaseEntity, OneToMany, ManyToOne } from "typeorm";
import { Persona } from "./Persona";
import { Distribucion } from "./Distribucion";
import { EmpresaReparto } from "./EmpresaReparto";
import { Estado } from "./Estado";
import { TipoLicencia } from "./TipoLicencia";
import { TrackingLink } from "./TrackingLink";
import { Entrega } from "./Entrega";

@Entity()
export class Repartidor extends BaseEntity {

  @PrimaryColumn({ name: "idrepartidor", type: "varchar", length: 150 })
  IdRepartidor: string;

  @ManyToOne(() => Estado, (estado) => estado.Repartidor)
  @JoinColumn({ name: "idestado" })
  Estado: Estado;
  
  @Column({ name: "tipovehiculo", type: "varchar", length: 100, nullable: true })
  TipoVehiculo: string;

  @Column({ name: "placavehiculo", type: "varchar", length: 20, nullable: true, unique: true })
  PlacaVehiculo: string;

  @Column({ name: "numerolicencia", type: "varchar", length: 50, nullable: true })
  NumeroLicencia: string;

  @ManyToOne(() => EmpresaReparto, empresaReparto => empresaReparto.Repartidores)
  @JoinColumn({ name: "idempresareparto" })
  EmpresaReparto: EmpresaReparto;

  @ManyToOne(() => TipoLicencia, tipoLicencia => tipoLicencia.Repartidores)
  @JoinColumn({ name: "idtipolicencia" })
  TipoLicencia: TipoLicencia;

  // Relación 1 a 1 con Persona (el repartidor ES una persona)
  @OneToOne(() => Persona ,(persona) => persona.Repartidor )
  @JoinColumn({ name: "idpersona" })
  Persona: Persona;
  
  @OneToMany(() => TrackingLink, (paquete) => paquete.Repartidor)
    TrackingLink: TrackingLink[];
  // Un repartidor puede tener muchas hojas de distribución
  // @OneToMany(() => Distribucion, (distribucion) => distribucion.Repartidor)
  // Distribuciones: Distribucion[];

@OneToMany(() => Entrega, (paquete) => paquete.Repartidor)
    Entrega: Entrega[];
}
