import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, OneToOne, OneToMany, BaseEntity } from "typeorm";
import { Unidadmedida } from "./UnidadMedida";
import { Detallecompra } from "./DetalleCompra";
import { Insumo } from "./Insumo";
import { DetalleTransferencia } from "./DetalleTransferencia";


@Entity()
export class Insumomedida extends BaseEntity {
    @PrimaryColumn({ name: "idinsumomedida", type: "varchar", length: 50 })
    IdinsumoMedida: string;

    @Column({ name: "fecharegistro", type: "date" })
    FechaRegistro: Date;
    
    @Column({ name: "fechaactualizacion", type: "date" , nullable:true })
    FechaActualizacion: Date;

    @Column({ name: "cantidad", type: "integer", default:1})
    Cantidad: number;
    
    @Column({ name: "estado", type: "integer", default:1 })
    Estado: number;
     
    @ManyToOne(() => Insumo, (Producto) => Producto.Insumomedida)
    @JoinColumn({ name: "idinsumo" })
    Insumo: Insumo;

    @ManyToOne(() => Unidadmedida, (unidadmedida) => unidadmedida.Insumomedida)
    @JoinColumn({ name: "idunidadmedida" })
    Unidadmedida: Unidadmedida;

    @OneToMany(() => Detallecompra, (compra) => compra.Insumomedida)
    Detallecompra: Detallecompra[];

    @OneToMany(() => DetalleTransferencia, (comision) => comision.Insumomedida)
    DetalleTransferencia: DetalleTransferencia[];
}
