
import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import bcrypt from "bcryptjs";
import { Estado } from "./Estado";
import { Usuario } from "./Usuario";
import { Persona } from "./Persona";
import { Venta } from "./Venta";
import { Producto } from "./Producto";
import { Promocion } from "./Promocion";
import { Presentacionproducto } from "./Presentacionproducto";
import { Pedido } from "./Pedido";
import { Distribucion } from "./Distribucion";

@Entity()
//@Check(`"Estado" IN (0, 1)`)
export class Detalledistribucion extends BaseEntity {
    @PrimaryColumn({ name: 'iddetalledistribucion', type: "varchar", length: 100 })
    IdDetalleDistribucion: string;

    @Column({ name: "cantidad", type: "integer" })
    Cantidad: number;

    @Column({ name: "precio", type: "numeric", precision: 10, scale: 2 })
    Precio: number;

    @Column({ name: "cantidaddevueltas", type: "integer", nullable:true })
    Cantidaddevuelta: number;

     @Column({ name: "modo", type: "integer", nullable:true })
     Modo: number;
    
    @ManyToOne(() => Distribucion, (venta) => venta.Detalledistribucion)
    @JoinColumn({ name: "iddistribucion" })
    Distribucion: Distribucion;

    @ManyToOne(() => Producto, (producto) => producto.Detalledistribucion, { nullable: true })
    @JoinColumn({ name: "idproducto" })
    Producto: Producto;

    @ManyToOne(() => Presentacionproducto, (paquete) => paquete.Detalledistribucion, { nullable: true })
    @JoinColumn({ name: "idpaquete" })
    Paquete: Presentacionproducto;

}

