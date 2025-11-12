import { Entity, PrimaryColumn, Column, BaseEntity } from "typeorm";

@Entity("contadorsecuencias")
export class ContadorSecuencias extends BaseEntity {

    @PrimaryColumn({name: 'prefijo', type: "varchar", length: 5 })
    prefijo: string;

    @PrimaryColumn({ name: 'fecha',type: "date" })
    fecha: Date;

     @Column({ name: 'ultima_secuencia', type: "integer"})
     ultimaSecuencia: number
   
}

