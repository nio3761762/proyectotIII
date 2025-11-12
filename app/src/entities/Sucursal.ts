import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, OneToOne, OneToMany, BaseEntity } from "typeorm";
import { Direccion } from "./DIreccion";
import { Administrardatos } from "./AdmDatos";
import { Estado } from "./Estado";
import { Horario } from "./Horario";
import { Usuariosucursal } from "./UsuarioSucursal";
import { Productosucursal } from "./ProductoSucursal";
import { Venta } from "./Venta";
import { Distribucion } from "./Distribucion";
import { Productostock } from "./ProductoStock";

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

  @Column({ name: "celular", type: "varchar", length: 100 })
  Celular: string;
   
  @Column({ name: "central", type: "integer" })
  Central: number;
  //relacion uno a uno con Direccion
  @OneToOne(() => Direccion, (direccion) => direccion.Sucursal)
  @JoinColumn({ name: "iddireccion" })
  Direccion: Direccion;

  // Relacion de muchos a uno con  Administrar datos
  @ManyToOne(() => Administrardatos, (dato) => dato.sucursal)
  @JoinColumn({ name: "iddatos" })
  Datos: Administrardatos;


  @ManyToOne(() => Estado, (estado) => estado.Sucursal)
  @JoinColumn({ name: "idestado" })
  Estado: Estado;


  @ManyToOne(() => Horario, (horario) => horario.Sucursal)
  @JoinColumn({ name: "idhorario" })
  Horario: Horario;

   @OneToMany(() => Usuariosucursal, (usuariosucursal) => usuariosucursal.Sucursal)
  Usuariosucursal: Usuariosucursal[];

 @OneToMany(() => Venta, (venta) => venta.Sucursal)
  Venta: Venta[];

  @OneToMany(() => Distribucion, (venta) => venta.Sucursal)
  Distribucion: Distribucion[];

     @OneToMany(() => Productosucursal, (productosucursal) => productosucursal.Sucursal)
  Productosucursal: Productosucursal[];

      @OneToMany(() => Productostock, (productosucursal) => productosucursal.Sucursal)
  Productostock: Productostock[];
}
