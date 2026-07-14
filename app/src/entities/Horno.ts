import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { Sucursal } from "./Sucursal";
import { HornoEnergia } from "./HornoEnergia";
import { Produccion } from "./Produccion";
import { ProduccionHornoDetalle } from "./Produccionhornodetalle";

@Entity()
export class Horno extends BaseEntity{
   
  @PrimaryColumn({name:'idhorno', type:'varchar',length:150})
  IdHorno: string;

  @Column({name:'nombre', type:'varchar',length:150})
  Nombre: string; 

  @Column({ name: "imagen", type: "varchar", length: 255, nullable: true })
  Imagen: string;  
  
  @Column({ name: "estado", type: "integer", default:1})
  Estado: number;  

  @Column({ name: "cantidadlata", type: "integer", default:1})
  Cantidadlata: number;  

  @ManyToOne(() => Sucursal, (s) => s.Hornos)
  @JoinColumn({name:'idsucursal'})
  Sucursal: Sucursal;

  @OneToMany(() => HornoEnergia, he => he.Horno)
  Energias: HornoEnergia[];

   @OneToMany(() => ProduccionHornoDetalle, he => he.Horno)
  Detalle: ProduccionHornoDetalle[];
}