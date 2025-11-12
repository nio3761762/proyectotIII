import { Precio } from "../entities/Precio";
import { HttpError } from "../utils/error.handler";
import { verifyEstado } from "./Estado.controllers";
import { verifyProducto } from "./Producto.controllers";

export const verifyPrecio = async ({ Precioid }: { Precioid: string }) => {
  const existPrecio = await Precio.findOne({ where: { IdPrecio: Precioid } });

  if (!existPrecio) {
    throw new HttpError(404, `El Precio con ID ${Precioid} no existe.`);
  }

  return existPrecio;
};

export const createPrecio = async ({ IdProducto, Precios }: { IdProducto: string; Precios: number }) => {

  const existingPrecio = await Precio.findOne({
    where: {
      Estado: { IdEstado: 1 }, // Asumiendo que 1 es el estado "Activo"
    },
    relations: ["Proucto", "Estado"],
  });

  if (existingPrecio) {
    throw new HttpError(409, `Ya existe un precio activo para el producto con ID ${IdProducto}.`);
  }

  const result = await Precio.createQueryBuilder("Precio")
    .select("MAX(CAST(SUBSTRING(Precio.IdPrecio, 5) AS INTEGER))", "ultimoNumero")
    .where("Precio.IdPrecio LIKE 'PPV-%'")
    .getRawOne();

  const nuevoNumero = (result?.ultimoNumero || 0) + 1;
  const nuevoId = `PPV-${nuevoNumero}`;

  const nuevoPrecio = new Precio();
  nuevoPrecio.IdPrecio = nuevoId;
  nuevoPrecio.Precio = Precios;
  nuevoPrecio.FechaRegistro = new Date();
  nuevoPrecio.Estado = await verifyEstado({ EstadoId: 1 });

  await nuevoPrecio.save();

  return nuevoPrecio;
};

export const updatePrecio = async ({
  PrecioId,
  IdProducto,
  Precios,
}: {
  PrecioId?: string; // El ID es opcional
  IdProducto: string; // Requerido para crear
  Precios: number; // Requerido para crear
}) => {
 
  if (PrecioId) {
    const existPrecio = await Precio.findOne({ where: { IdPrecio: PrecioId } });

    if (existPrecio) {
      existPrecio.Precio = Precios;
      await existPrecio.save();
      return existPrecio;
    }
  }

 
  return await createPrecio({ IdProducto, Precios });
};


