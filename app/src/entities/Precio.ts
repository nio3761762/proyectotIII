import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import bcrypt from "bcryptjs";
import { Producto } from "./Producto";
import { Estado } from "./Estado";
import { Productomedida } from "./ProductoMedida";

@Entity()
//@Check(`"Estado" IN (0, 1)`)
export class Precio extends BaseEntity {
    @PrimaryColumn({ name: 'idprecio', type: "varchar", length: 100 })
    IdPrecio: string;

    @Column({ name: 'precio', type: 'numeric', precision: 10, scale: 2 })
    Precio: number;

    @Column({ name: "fecharegistro", type: "date" })
    FechaRegistro: Date;

    // @ManyToOne(() => Producto, (producto) => producto.Precio)
    // @JoinColumn({ name: "idproducto" })
    // Proucto: Producto;

    @ManyToOne(() => Estado, (estado) => estado.Precio)
    @JoinColumn({ name: "idestado" })
    Estado: Estado;

  //    @OneToMany(() => Productomedida, (precio) => precio.Precio)
  // Productomedida: Productomedida[];

}