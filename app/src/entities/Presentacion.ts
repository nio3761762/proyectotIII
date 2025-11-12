import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import bcrypt from "bcryptjs";
import { Producto } from "./Producto";
import { Metodopago } from "./MetodoPago";
import { Venta } from "./Venta";
import { Presentacionproducto } from "./Presentacionproducto";
import { Estado } from "./Estado";

@Entity()
//@Check(`"Estado" IN (0, 1)`)
export class Presentacion extends BaseEntity {
    @PrimaryColumn({ name: 'idpresentacion', type: "varchar", length: 50 })
    IdPresentacion: string;

    @Column({ name: 'nombre', type: "varchar", length: 50 })
    Nombre: string;

    @Column({ name: "fecharegistro", type: "date" })
    FechaRegistro: Date;

    @Column({ name: "fechaactualizacion", type: "date", nullable:true })
    FechaActualizacion: Date;


      @OneToMany(() => Presentacionproducto, (paquete) => paquete.Presentacion)
      Presentacionproducto: Presentacionproducto[];

       @ManyToOne(() => Estado, (estado) => estado.Presentacion)
          @JoinColumn({ name: "idestado" })
          Estado: Estado;

    }
