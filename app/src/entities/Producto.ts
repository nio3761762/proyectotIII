
import { BaseEntity, Check, OneToMany, Column, Entity, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { Subcategoria } from "./SubCategoria";
import { Productomedida } from "./ProductoMedida";
import { Detallepedido } from "./DetallePedido";
import { DetalleTransferencia } from "./DetalleTransferencia";
import { Inventario } from "./Inventario";
import { MovimientoInventario } from "./MovimientoInventario";
import { DetalleProduccion } from "./Detalleproduccuin";
import { Receta } from "./Receta";
import { Hornoproducto } from "./HornoProduccto";
import { Detalleventa } from "./DetalleVenta";
import { Promocionproducto } from "./PromocionProducto";

@Entity()
export class Producto extends BaseEntity {
  @PrimaryColumn({ name: 'idproducto', type: "varchar", length: 100 })
  IdProducto: string;

  @Column({ name: 'nombre', type: "varchar", length: 100 })
  Nombre: string;
  
  @Column({ name: 'descripcion', type: "varchar", length: 255,  nullable: true })
  Descripcion: string;

  @Column({ name: 'descripcionlarga', type: "text",  nullable: true })
  Descripcionlarga: string;
  
  @Column({ name: "cantidad", type: "integer",default: 0}) 
   Cantidad: number; 

  @Column({ name: "fecharegistro", type: "date", nullable: true })
  FechaRegistro: Date;

  @Column({ name: "horaregistro", type: "time", nullable: true })
  HoraRegistro: string;

  @Column({ name: "fechaactualizacion", type: "date", nullable: true })
  Fechaactualizacion: Date;

  @Column({ name: "stockminimo", type: "integer", nullable: true })
  StockMinimo: number;

  @ManyToOne(() => Subcategoria, (subcategoria) => subcategoria.Producto, { nullable: true })
  @JoinColumn({ name: "idsubcategoria" })
  Subcategoria: Subcategoria;

   @Column({ name: "estado", type: "integer",default: 1}) 
   Estado: number; 

   @Column({ name: "imagen", type: "varchar", length: 255, nullable: true })
  Imagen: string;  
  
   @OneToMany(() => DetalleTransferencia, (ingrediente) => ingrediente.Producto)
  Detalletransferencia: DetalleTransferencia[];
  
  @OneToMany(() => Detalleventa, (ingrediente) => ingrediente.Producto)
  Detalleventa: Detalleventa[];

  @OneToMany(() => Inventario, (ingrediente) => ingrediente.Producto)
  Inventario: Inventario[];

    @OneToMany(() => Promocionproducto, (ingrediente) => ingrediente.Producto)
  Promocionproducto: Promocionproducto[];
   
   @OneToMany(() => MovimientoInventario, (ingrediente) => ingrediente.Producto)
        Movimiento: Inventario[]; 
   
  @OneToMany(() => Receta, (ingrediente) => ingrediente.Producto)
  Receta: Receta[];

  @OneToMany(() => Productomedida, (productomedida) => productomedida.Producto)
  Productomedida: Productomedida[];

  @OneToMany(() => Detallepedido, (detalleventa) => detalleventa.Producto)
  Detallepedido: Detallepedido[];

  @OneToMany(() => DetalleProduccion, (consumo) => consumo.Producto)
    Produccion: DetalleProduccion[];

     @OneToMany(() => Hornoproducto, he => he.Producto)
    Hornoproducto: Hornoproducto[];   
}

