import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import { Productomedida } from "./ProductoMedida";

@Entity()
//@Check(`"Estado" IN (0, 1)`)
export class Comision extends BaseEntity {
    @PrimaryColumn({ name: 'idcomision', type: "varchar", length: 100 })
    IdComision: string;
    
    @Column({ name: 'nombre', type: "varchar", length:255, nullable:true })
    Nombre: string;

    @Column({ name: 'cantidad', type: "integer" })
    Cantidad: number;

    @Column({ name: 'porcentaje', type: "numeric", precision: 10, scale: 2 })
    Porcentaje: number; 

    @Column({ name: 'preciocomision', type: "numeric", precision: 10, scale: 2 })
    Preciocomision: number;

    // @ManyToOne(() => Productomedida, (producto) => producto.Comision)
    // @JoinColumn({ name: "idproductomedida" })
    // Productomedida: Productomedida;

    @Column({ name: "estado", type: "integer",default: 1}) 
    Estado: number; 

}

