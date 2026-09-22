import { Entity, BaseEntity, PrimaryColumn, Column } from "typeorm";

@Entity("stock_diario")
export class StockDiario extends BaseEntity {
  @PrimaryColumn({ name: "idstockdiario", type: "varchar", length: 150 })
  IdStockDiario: string;

  @Column({ name: "fecha", type: "date" })
  Fecha: Date;

  @Column({ name: "turno", type: "varchar", length: 20, nullable: true })
  Turno: string;

  @Column({ name: "idsucursal", type: "varchar", length: 100 })
  IdSucursal: string;

  @Column({ name: "idproducto", type: "varchar", length: 100 })
  IdProducto: string;

  @Column({ name: "idproductomedida", type: "varchar", length: 50, nullable: true })
  IdProductoMedida: string;

  @Column({ name: "producto", type: "varchar", length: 150, nullable: true })
  ProductoNombre: string;

  @Column({ name: "presentacion", type: "varchar", length: 100, nullable: true })
  Presentacion: string;

  @Column({ name: "abreviatura", type: "varchar", length: 100, nullable: true })
  Abreviatura: string;

  @Column({ name: "presentacionfactor", type: "numeric", precision: 10, scale: 2, default: 1 })
  PresentacionFactor: number;

  @Column({ name: "esunidad", type: "integer", default: 1 })
  EsUnidad: number;

  @Column({ name: "cantidadproducida", type: "numeric", precision: 12, scale: 2, default: 0 })
  CantidadProducida: number;

  @Column({ name: "cantidaddescartada", type: "numeric", precision: 12, scale: 2, default: 0 })
  CantidadDescartada: number;

  @Column({ name: "cantidadvendidatienda", type: "numeric", precision: 12, scale: 2, default: 0 })
  CantidadVendidaTienda: number;

  @Column({ name: "totalventatienda", type: "numeric", precision: 14, scale: 2, default: 0 })
  TotalVentaTienda: number;

  @Column({ name: "cantidadvendidarevendedor", type: "numeric", precision: 12, scale: 2, default: 0 })
  CantidadVendidaRevendedor: number;

  @Column({ name: "totalventarevendedor", type: "numeric", precision: 14, scale: 2, default: 0 })
  TotalVentaRevendedor: number;

  @Column({ name: "cantidadvendidatotal", type: "numeric", precision: 12, scale: 2, default: 0 })
  CantidadVendidaTotal: number;

  @Column({ name: "stockinicio", type: "numeric", precision: 12, scale: 2, default: 0 })
  StockInicio: number;

  @Column({ name: "stockrestante", type: "numeric", precision: 12, scale: 2, default: 0 })
  StockRestante: number;

  @Column({ name: "fechageneracion", type: "timestamp", nullable: true })
  FechaGeneracion: Date;
}