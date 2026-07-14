
import { BaseEntity, OneToMany, Column, Entity, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { Subcategoria } from "./SubCategoria";
import { Marca } from "./Marca";
import { Ingrediente } from "./Ingrediente";
import { Insumomedida } from "./InsumoMedida";
import { DetalleTransferencia } from "./DetalleTransferencia";
import { Inventario } from "./Inventario";
import { MovimientoInventario } from "./MovimientoInventario";
import { Detallecompra } from "./DetalleCompra";
import { ConfiguracionEnergia } from "./ConfiguracionEnergia";

@Entity()
export class Insumo extends BaseEntity {
  @PrimaryColumn({ name: 'idinsumo', type: "varchar", length: 100 })
  IdInsumo: string;

  @Column({ name: 'nombre', type: "varchar", length: 100 })
  Nombre: string;
  
  @Column({ name: 'descripcion', type: "text",  nullable: true })
  Descripcion: string;

  @Column({ name: "fecharegistro", type: "date", nullable: true })
  FechaRegistro: Date;

  @Column({ name: "horaregistro", type: "time", nullable: true })
  HoraRegistro: string;

  @Column({ name: "fechaactualizacion", type: "date", nullable: true })
  Fechaactualizacion: Date;

  @Column({ name: "stockminimo", type: "integer", nullable: true })
  StockMinimo: number;

  @ManyToOne(() => Subcategoria, (sc) => sc.Insumo, { nullable: true })
  @JoinColumn({ name: "idsubcategoria" })
  Subcategoria: Subcategoria;

  @Column({ name: "estado", type: "integer",default: 1}) 
  Estado: number; 
  
  @ManyToOne(() => Marca, (m) => m.Insumo, { nullable: true })
  @JoinColumn({ name: "idmarca" })
  Marca: Marca;
  
  @Column({ name: "imagen", type: "varchar", length: 255, nullable: true })
  Imagen: string;  
   @OneToMany(() => ConfiguracionEnergia, (i) => i.Insumo)
    Configuracionenergia: ConfiguracionEnergia[];
    
  @OneToMany(() => DetalleTransferencia, (i) => i.Insumo)
    Detalletransferencia: DetalleTransferencia[];
   
   @OneToMany(() => Inventario, (i) => i.Insumo)
     Inventario: Inventario[]; 

     @OneToMany(() => MovimientoInventario, (i) => i.Insumo)
     Movimiento: Inventario[]; 

  @OneToMany(() => Insumomedida, (i) => i.Insumo)
  Insumomedida: Insumomedida[];
   
  @OneToMany(() => Detallecompra, (i) => i.Insumo)
  Detallecompra: Detallecompra[]; 
  
  @OneToMany(() => Ingrediente, (i) => i.Insumo)
  Ingrediente: Ingrediente[];
}

