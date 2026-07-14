import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import { Productomedida } from "./ProductoMedida";

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
   
     
   @Column({ name: 'abreviatura', type: 'varchar', length: 100, nullable:true })
   Abreviatura: string;

     @OneToMany(() => Productomedida, (productomedida) => productomedida.Presentacion)
       Productomedida: Productomedida[];
    

    @Column({ name: "estado", type: "integer",default: 1}) 
    Estado: number; 

    }
