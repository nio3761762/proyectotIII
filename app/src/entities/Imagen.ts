import { BaseEntity, Column, Entity, PrimaryColumn, OneToMany, OneToOne } from "typeorm";
import { Persona } from "./Persona";
import { Administrardatos } from "./AdmDatos";
import { Producto } from "./Producto";
import { Categoria } from "./Categoria";
import { Presentacionproducto } from "./Presentacionproducto";
import { Promocion } from "./Promocion";

@Entity()
export class Imagen extends BaseEntity {
    @PrimaryColumn({ name: "idimagen", type: "varchar", length: 255 })
    IdImagen: string;

    @Column({ name: "url", type: "varchar", length: 255 })
    Url: string;

    @OneToOne(() => Persona, (persona) => persona.Imagen)
    Persona: Persona;

    @OneToOne(() => Categoria, (categoria) => categoria.Imagen)
    Categoria: Categoria;

    @OneToOne(() => Producto, (producto) => producto.Imagen)
    Producto: Producto;

     @OneToOne(() => Administrardatos, (dato) => dato.Imagen)
    Administrardatos: Administrardatos;

    @OneToOne(() => Presentacionproducto, (dato) => dato.Imagen)
    Paquete: Presentacionproducto;

      @OneToOne(() => Promocion, (rango) => rango.Imagen)
      Promocion: Promocion;
}