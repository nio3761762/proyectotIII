import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, OneToOne, OneToMany, BaseEntity } from "typeorm";
import { Producto } from "./Producto";
import { Presentacion } from "./Presentacion";
import { Comision } from "./Comision";
import { Detalleventa } from "./DetalleVenta";
import { Promocionproducto } from "./PromocionProducto";
import { DetalleTransferencia } from "./DetalleTransferencia";
import { Productomedidaprecio } from "./Productomedidaprecio";
import { Detallepedido } from "./DetallePedido";
import { Revendedorcontroldetalle } from "./RevendedorControlDetalle ";


@Entity()
export class Productomedida extends BaseEntity {
    @PrimaryColumn({ name: "idproductomedida", type: "varchar", length: 50 })
    IdProductoMedida: string;

    @Column({ name: "fecharegistro", type: "date" })
    FechaRegistro: Date;

    @Column({ name: "cantidad", type: "integer", default:0})
    Cantidad: number;

    @Column({ name: "precioventa", type: "numeric", precision: 10, scale: 2 })
    PrecioVenta: number;

    @Column({ name: "preciomayor", type: "numeric", precision: 10, scale: 2, nullable: true })
    PrecioMayor: number;
    
    @Column({ name: "comision", type: "numeric", precision: 10, scale: 2, default:0 })
    Comision: number;
    
    @Column({ name: "imagen", type: "varchar", length: 255, nullable: true })
    Imagen: string;  
     
     @Column({ name: "estado", type: "integer",default: 1}) 
     Estado: number; 

    @OneToMany(() => DetalleTransferencia, (comision) => comision.ProductoMedida)
    DetalleTransferencia: DetalleTransferencia[];

    // @OneToMany(() => Comision, (comision) => comision.Productomedida)
    // Comision: Comision[];

    @ManyToOne(() => Producto, (Producto) => Producto.Productomedida)
    @JoinColumn({ name: "idproducto" })
    Producto: Producto;

    @ManyToOne(() => Presentacion, (unidadmedida) => unidadmedida.Productomedida)
    @JoinColumn({ name: "idpresentacion" })
    Presentacion: Presentacion;

    @OneToMany(() => Revendedorcontroldetalle, (pp) => pp.ProductoMedida)
    Control: Revendedorcontroldetalle[];

    @OneToMany(() => Promocionproducto, (promocionproducto) => promocionproducto.Productomedida)
    Promocionproducto: Promocionproducto[];
    
     @OneToMany(() => Productomedidaprecio, (detalleventa) => detalleventa.ProductoMedida)
      Productomedidaprecio: Productomedidaprecio[];
   
@OneToMany(() => Detallepedido, (detalle) => detalle.Productomedida)
    Detallepedido: Detallepedido[];

    @OneToMany(() => Detalleventa, (detalleventa) => detalleventa.Productomedida)
    Detalleventa: Detalleventa[];
     
}
