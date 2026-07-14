import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { Sucursal } from "./Sucursal";
import { Empleado } from "./Empleado";
import { DetalleTransferencia } from "./DetalleTransferencia";

@Entity()
export class Transferencia extends BaseEntity {
  @PrimaryColumn({ name: 'idtransferencia', type: "varchar", length :255})
  IdTransferencia: string;

  @Column({  name: 'fecha',type: "date" })
  Fecha: Date;

  @Column({  name: 'hora',type: "time", nullable:true })
  Hora: string;
  
    @Column({  name: 'estado',type: "integer", default:1 })
  Estado: number;

  
  @ManyToOne(() => Sucursal, (suO) => suO.TransferenciaOrigen)
  @JoinColumn({name:'idsucursalorigen'})
  SucursalOrigen: Sucursal;

  @ManyToOne(() => Sucursal, (su) => su.TransferenciaDestino, { nullable: true })
  @JoinColumn({name:'idsucursaldestino'})
  SucursalDestino: Sucursal;

  @ManyToOne(() => Empleado, (em) => em.Transferencia, { nullable: true })
  @JoinColumn({name:'idempleado'})
  EmpleadoDestino: Empleado;
 
   @OneToMany(() => DetalleTransferencia, (ingrediente) => ingrediente.Transferencia)
    Detalletransferencia: DetalleTransferencia[];

  @Column({ name: 'tipo', type: "varchar", length :"50"})
  Tipo: string;
  // "SUCURSAL"
  // "VENDEDOR"
}