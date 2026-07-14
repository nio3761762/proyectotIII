import { Entity, PrimaryColumn, ManyToOne, Column, JoinColumn, BaseEntity } from "typeorm";
import { Horno } from "./Horno";

@Entity()
export class HornoEnergia extends BaseEntity{

  @PrimaryColumn({name:'idhornoenergia',type:'varchar' ,length:150})
  IdHornoEnergia: string;

  @ManyToOne(() => Horno, (h) => h.Energias)
  @JoinColumn({name:'idhorno'})
  Horno: Horno;

  @Column({name:'tipoenergia', type:'varchar', length:150})
  TipoEnergia: string;
  // ELECTRICO | GAS_DOMICILIO | GAS_GARRAFA

  @Column({name:'consumoporhora', type: "numeric" })
  ConsumoPorHora: number;
}