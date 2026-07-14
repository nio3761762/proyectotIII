import { BaseEntity, Column, Entity, PrimaryColumn, OneToMany, OneToOne, JoinColumn, ManyToOne } from "typeorm";
import { Venta } from "./Venta";
import { Tipopedido } from "./TipoPedido";
import { Detallepedido } from "./DetallePedido";
import { Usuario } from "./Usuario";
import { Persona } from "./Persona";
import { Sucursal } from "./Sucursal";
import { Pago } from "./Pago";

@Entity()
export class Pedido extends BaseEntity {
    @PrimaryColumn({ name: "idpedido", type: "varchar", length: 50 })
    IdPedido: string;

    @Column({ name: "fecharegistro", type: "date" })
    FechaRegistro: Date;

    @Column({ name: "hora", type: "time" })
    Hora: string;

    @Column({ name: "detalle", type: "varchar", length: 255, nullable: true })
    Detalle: string;

    @Column({ name: "devolucion", type: "text", nullable: true })
    devolucion: string;

    @Column({ name: 'total', type: "numeric", precision: 10, scale: 2 })
    Total: number;

     @Column({ name: 'adelanto', type: "numeric", precision: 10, scale: 2, default:0 })
    Adelanto: number;
 
   @Column({ name: "direccionentrega", type: "text", nullable: true })
    DireccionEntrega: string;

   @Column({ name: "referenciaentrega", type: "text", nullable: true })
    ReferenciaEntrega: string;

   @Column({ name: "linkubicacion", type: "varchar", nullable: true })
    LinkUbicacion: string;

    @OneToOne(() => Venta, (venta) => venta.Pedido)
    Venta: Venta;

    @ManyToOne(() => Tipopedido, (tipopedido) => tipopedido.Pedido)
    @JoinColumn({ name: "idtipopedido" })
    Tipopedido: Tipopedido;

     @Column({ name: 'estado', type: "integer", default:1 })
    Estado: number;
 
     @ManyToOne(() => Usuario, (usuario) => usuario.Pedido, {nullable:true})
      @JoinColumn({ name: "idusuario" })
      Usuario: Usuario;
    
      @ManyToOne(() => Persona, (persona) => persona.Pedido,{nullable:true})
      @JoinColumn({ name: "idpersona" })
      Persona: Persona;
    
      @ManyToOne(() => Sucursal, (sucursal) => sucursal.Pedido,{nullable:true})
      @JoinColumn({ name: "idsucursal" })
      Sucursal: Sucursal;

     @OneToMany(() => Detallepedido, (distribucion) => distribucion.Pedido)
    Detallepedido: Detallepedido[];

    @OneToMany(() => Pago, (pago) => pago.Pedido)
    Pago: Pago[];
}