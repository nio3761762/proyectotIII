import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, OneToOne, OneToMany, BaseEntity } from "typeorm";
import { Estado } from "./Estado";
import { Producto } from "./Producto";
import { Sucursal } from "./Sucursal";
import { Unidadmedida } from "./UnidadMedida";
import { Detalleventa } from "./DetalleVenta";
import { Presentacion } from "./Presentacion";
import { Promocionproducto } from "./PromocionProducto";
import { Imagen } from "./Imagen";
import { Productosucursal } from "./ProductoSucursal";
import { Detallepedido } from "./DetallePedido";
import { Detalledistribucion } from "./Detalledistribucion";


@Entity()
export class Presentacionproducto extends BaseEntity {
  @PrimaryColumn({ name: "idpaquete", type: "varchar", length: 50 })
  IdPaquete: string;

  @Column({ name: "nombre", type: "varchar", length: 150 })
  Nombre: string;

  @Column({ name: "cantidad", type: "integer" })
  Cantidad: number;

  @Column({ name: "fecharegistro", type: "date" })
  FechaRegistro: Date;

  @Column({ name: "precioventa", type: "numeric", precision: 10, scale: 2 })
  PrecioVenta: number;

  @Column({ name: "preciomayor", type: "numeric", precision: 10, scale: 2, nullable: true })
  PrecioMayor: number;

  @ManyToOne(() => Producto, (Producto) => Producto.Paquete)
  @JoinColumn({ name: "idproducto" })
  Producto: Producto;

  @ManyToOne(() => Unidadmedida, (unidadmedida) => unidadmedida.Paquete)
  @JoinColumn({ name: "idunidadmedida" })
  Unidadmedida: Unidadmedida;

  @ManyToOne(() => Estado, (estado) => estado.Paquete)
  @JoinColumn({ name: "idestado" })
  Estado: Estado;

  @ManyToOne(() => Presentacion, (presentacion) => presentacion.Presentacionproducto)
  @JoinColumn({ name: "idpresentacion" })
  Presentacion: Presentacion;
 
  @OneToOne(() => Imagen, (unidadmedida) => unidadmedida.Paquete, {nullable:true})
  @JoinColumn({ name: "idimagen" })
  Imagen: Imagen;

  @OneToMany(() => Detalleventa, (detalleventa) => detalleventa.Paquete)
  Detalleventa: Detalleventa[];

    @OneToMany(() => Detallepedido, (detalleventa) => detalleventa.Paquete)
  Detallepedido: Detallepedido[];

   @OneToMany(() => Promocionproducto, (promocion) => promocion.Paquete)
  Promocionproducto: Promocionproducto[];

   @OneToMany(() => Productosucursal, (paquete) => paquete.Paquete)
  Productosucursal: Productosucursal[];

     @OneToMany(() => Detalledistribucion, (paquete) => paquete.Paquete)
  Detalledistribucion: Detalledistribucion[];


}