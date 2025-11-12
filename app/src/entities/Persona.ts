import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, OneToOne, OneToMany, BaseEntity } from "typeorm";
import { Usuario } from "./Usuario";
import { Tipodocumento } from "./TipoDocumento";
import { Celular } from "./Celular";
import { Direccion } from "./DIreccion";
import { Email } from "./Email";
import { Genero } from "./Genero";
import { Estado } from "./Estado";
import { Imagen } from "./Imagen";
import { Salario } from "./Salario";
import { Cliente } from "./Cliente";
import { Venta } from "./Venta";
import { Proveedor } from "./Proveedor";
import { Administrardatos } from "./AdmDatos";
import { Documento } from "./Documento";
import { Repartidor } from "./Repartidor";

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
  //relacion uno a uno con usuario
  @OneToOne(() => Usuario, (usuario) => usuario.Persona)
  Usuario: Usuario;

  //   @OneToOne(() => Cliente, (cliente) => cliente.Persona)
  // Cliente: Cliente;

  @OneToOne(() => Imagen, (imagen) => imagen.Persona, { nullable: true })
  @JoinColumn({ name: "idimagen" })
  Imagen: Imagen;

  @OneToOne(() => Email, (email) => email.Persona, { nullable: true })
  Email: Email;

  @OneToOne(() => Direccion, (direccion) => direccion.Persona, { nullable: true })
  @JoinColumn({ name: "iddireccion" })
  Direccion: Direccion;

  @ManyToOne(() => Genero, (genero) => genero.Persona, { nullable: true })
  @JoinColumn({ name: "idgenero" })
  Genero: Genero;

  @ManyToOne(() => Estado, (estado) => estado.Persona)
  @JoinColumn({ name: "idestado" })
  Estado: Estado;

  @ManyToOne(() => Salario, (salario) => salario.Persona, { nullable: true })
  @JoinColumn({ name: "idsalario" })
  Salario: Salario;

  //relacion uno a muchos con celular
  @OneToMany(() => Celular, (celular) => celular.Persona)
  Celulares: Celular[];

    @OneToMany(() => Documento, (documento) => documento.Persona)
  Documento: Documento[];

   @OneToOne(() => Administrardatos, (dato) => dato.Persona)
    Administrardatos: Administrardatos;

  @OneToMany(() => Venta, (venta) => venta.Persona)
  Venta: Venta[];

  @OneToOne(() => Proveedor, proveedor => proveedor.Persona)
Proveedor: Proveedor;

@OneToOne(() => Repartidor, (repartidor) => repartidor.Persona)
  Repartidor: Repartidor;

  
}
