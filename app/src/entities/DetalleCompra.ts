
import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import { Compra } from "./Compra";
import { Insumomedida } from "./InsumoMedida";
import { Insumo } from "./Insumo";

@Entity()
export class Detallecompra extends BaseEntity {
    @PrimaryColumn({ name: 'iddetallecompra', type: "varchar", length: 50 })
    IdDetalleCompra: string;

    @Column({ name: "cantidad", type: "integer" })
    Cantidad: number;

    @Column({ name: "precio", type: "numeric", precision: 10, scale: 2 ,  default:0})
    Precio: number;

    @Column({ name: "preciototal", type: "numeric", precision: 10, scale: 2, default:0 })
    PrecioTotal: number;

    @Column({ name: "fechavencimiento", type: "date" })
    FechaVencimineto: Date;
    
    @ManyToOne(() => Insumo, (comprobante) => comprobante.Detallecompra, { nullable: true })
    @JoinColumn({ name: "idinsumo" })
    Insumo: Insumo;

    @ManyToOne(() => Insumomedida, (comprobante) => comprobante.Detallecompra, { nullable: true })
    @JoinColumn({ name: "idinsumomedida" })
    Insumomedida: Insumomedida;

    @ManyToOne(() => Compra, (compra) => compra.Detallecompra)
    @JoinColumn({ name: "idcompra" })
    Compra: Compra;

}

