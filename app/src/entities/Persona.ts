import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, OneToOne, OneToMany, BaseEntity } from "typeorm";
import { Usuario } from "./Usuario";
import { Celular } from "./Celular";
import { Direccion } from "./DIreccion";
import { Salario } from "./Salario";
import { Venta } from "./Venta";
import { Proveedor } from "./Proveedor";
import { Administrardatos } from "./AdmDatos";
import { Documento } from "./Documento";
import { Empleado } from "./Empleado";
import { Pedido } from "./Pedido";

@Entity()
export class Persona extends BaseEntity {
  @PrimaryColumn({ name: "idpersona", type: "varchar", length: 150 })
  IdPersona: string;

  @Column({ name: "nombre", type: "varchar", length: 100 })
  Nombre: string;

  @Column({ name: "apellidopaterno", type: "varchar", length: 100 })
  ApellidoPaterno: string;

  @Column({ name: "apellidomaterno", type: "varchar", length: 100, nullable: true })
  ApellidoMaterno: string;

  @Column({ name: "fechadenacimiento", type: "date", nullable: true })
  FechaDeNacimiento: Date;

  @Column({ name: "fecharegistro", type: "date" })
  FechaRegistro: Date;

  @Column({ name: "fechaactualizacion", type: "date", nullable: true })
  FechaActualizacion: Date;
  
  @Column({ name: "horaregistro", type: "time", nullable: true })
  HoraRegistro: string;

  @Column({ name: "genero", type: "varchar", length: 100, nullable:true })
  Genero: string;

  @Column({ name: "imagen", type: "varchar", length: 255, nullable: true })
  Imagen: string;  

  @Column({ name: "tipo", type: "varchar", length: 50, nullable: true })
  Tipo: string;  


  @Column({ name: "email", type: "varchar", length: 255,  nullable: true}) 
  Email: string;
  
  @Column({ name: "estado", type: "integer",default: 1}) 
  Estado: number; 
   
  @OneToOne(() => Empleado, (empleado) => empleado.Persona)
Empleado: Empleado;
  //relacion uno a uno con usuario
  @OneToOne(() => Usuario, (usuario) => usuario.Persona)
  Usuario: Usuario;
   
  @OneToOne(() => Direccion, (direccion) => direccion.Persona, { nullable: true })
  @JoinColumn({ name: "iddireccion" })
  Direccion: Direccion;
  
  //relacion uno a muchos con celular
  @OneToMany(() => Celular, (celular) => celular.Persona)
  Celulares: Celular[];

  @OneToMany(() => Documento, (documento) => documento.Persona)
  Documento: Documento[];

  @OneToOne(() => Administrardatos, (dato) => dato.Persona)
  Administrardatos: Administrardatos;

  @OneToMany(() => Venta, (venta) => venta.Persona)
  Venta: Venta[];

  @OneToMany(() => Pedido, (venta) => venta.Persona)
  Pedido: Pedido[];


  @OneToOne(() => Proveedor, proveedor => proveedor.Persona)
Proveedor: Proveedor;

}
