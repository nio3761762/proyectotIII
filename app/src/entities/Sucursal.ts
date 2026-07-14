import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, OneToOne, OneToMany, BaseEntity } from "typeorm";
import { Direccion } from "./DIreccion";
import { Administrardatos } from "./AdmDatos";
import { Horario } from "./Horario";
import { Venta } from "./Venta";
import { Produccion } from "./Produccion";
import { EmpleadoSucursal } from "./EmpleadoSucursal";
import { Transferencia } from "./Transferencia";
import { Inventario } from "./Inventario";
import { MovimientoInventario } from "./MovimientoInventario";
import { Gasto } from "./Gastos";
import { ProduccionEmpleado } from "./ProduccionEmpleado";
import { Horno } from "./Horno";
import { Pedido } from "./Pedido";

@Entity()
export class Sucursal extends BaseEntity {
  some(arg0: (us: any) => boolean): boolean {
    throw new Error("Method not implemented.");
  }
  @PrimaryColumn({ name: "idsucursal", type: "varchar", length: 100 })
  IdSucursal: string;

  @Column({ name: "nombre", type: "varchar", length: 100 })
  Nombre: string;

  @Column({ name: "nro", type: "integer" })
  Nro: number;

  @Column({ name: "fecharegistro", type: "date" })
  FechaRegistro: Date;

  @Column({ name: "fechaactualizacion", type: "date" , nullable:true})
  FechaActualizacion: Date;

  @Column({ name: "celular", type: "varchar", length: 100, nullable:true })
  Celular: string;
   
  @Column({ name: "central", type: "integer" })
  Central: number;

  @Column({ name: "estado", type: "integer",default: 1}) 
  Estado: number; 
  
  //relacion uno a uno con Direccion
  @OneToOne(() => Direccion, (direccion) => direccion.Sucursal)
  @JoinColumn({ name: "iddireccion" })
  Direccion: Direccion;

  // Relacion de muchos a uno con  Administrar datos
  @ManyToOne(() => Administrardatos, (dato) => dato.sucursal)
  @JoinColumn({ name: "iddatos" })
  Datos : Administrardatos;
   
     @OneToMany(() => Gasto, (venta) => venta.Sucursal)
  Gasto: Gasto[];

  @OneToMany(() => Horario, (horario) => horario.Sucursal)
  Horario: Horario[];

   @OneToMany(() => Transferencia, (venta) => venta.SucursalOrigen)
  TransferenciaOrigen: Transferencia[];

   @OneToMany(() => Transferencia, (venta) => venta.SucursalDestino)
  TransferenciaDestino: Transferencia[];
   
   
  @OneToMany(() => Inventario, (productosucursal) => productosucursal.Sucursal)
  Inventario: Inventario[];
 
 @OneToMany(() => MovimientoInventario, (ingrediente) => ingrediente.Sucursal)
      Movimiento: Inventario[]; 
 

 @OneToMany(() => Venta, (venta) => venta.Sucursal)
  Venta: Venta[];
   @OneToMany(() => Pedido, (venta) => venta.Sucursal)
  Pedido: Pedido[];

   @OneToMany(() => Produccion, (productosucursal) => productosucursal.Sucursal)
  Produccion: Produccion[];

  
   @OneToMany(() => ProduccionEmpleado, (productosucursal) => productosucursal.Sucursal)
  Produccionempleado: ProduccionEmpleado[];

 @OneToMany(() => EmpleadoSucursal, (es) => es.Sucursal)
  EmpleadoSucursales: EmpleadoSucursal[];

  @OneToMany(() => Horno, (h) => h.Sucursal)
  Hornos: Horno[];
}
