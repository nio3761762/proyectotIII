"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubirPhotoInsumo = exports.ListInsumo = exports.verifyInsumo = exports.deleteInsumo = exports.updateInsumo = exports.createInsumo = exports.getInsumo = void 0;
const db_1 = require("../db");
const idGenerator_1 = require("../utils/idGenerator");
const Categoria_controllers_1 = require("./Categoria.controllers");
const Insumo_1 = require("../entities/Insumo");
const Insumomedida_controllers_1 = require("./Insumomedida.controllers");
const error_handler_1 = require("../utils/error.handler");
const getInsumo = async (req, res) => {
    try {
        const { search, estado, categoria, subcategoria, page = 1, limit = 8 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const searchParam = typeof search === "string" && search.trim() !== ""
            ? search.trim()
            : null;
        const estadoParam = estado !== undefined && estado !== ""
            ? Number(estado)
            : null;
        const categoriaParam = typeof categoria === "string" && categoria.trim() !== ""
            ? categoria
            : null;
        const subcategoriaParam = typeof subcategoria === "string" && subcategoria.trim() !== ""
            ? subcategoria
            : null;
        const result = await db_1.AppDataSource.query(`
      SELECT 
        i.idinsumo,
        i.nombre,
        i.descripcion,
        i.fecharegistro,
        i.horaregistro,
        i.fechaactualizacion,
        i.stockminimo,
        i.estado,
        i.imagen,
        COUNT(*) OVER() AS total,

        json_build_object(
          'IdSubCategoria', sc.idsubcategoria,
          'Nombre', sc.nombre,
          'Estado', sc.estado,
          'Categoria', json_build_object(
            'IdCategoria', c.idcategoria,
            'Nombre', c.nombre,
            'FechaRegistro', c.fecharegistro,
            'FechaActualizacion', c.fechaactualizacion,
            'Imagen', c.imagen,
            'Estado', c.estado
          )
        ) AS "Subcategoria",

        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'IdinsumoMedida', im.idinsumomedida,
              'FechaRegistro', im.fecharegistro,
              'Cantidad', im.cantidad,
              'Estado', im.estado,
              'Unidadmedida', json_build_object(
                'IdUnidadMedida', um.idunidadmedida,
                'Nombre', um.nombre,
                'Abreviatura', um.abreviatura,
                'Cantidad', um.cantidad,
                'FechaRegistro', um.fecharegistro,
                'Estado', um.estado,
                'Categoria', json_build_object(
                  'IdCategoriaMedida', cm.idcategoriamedida,
                  'Nombre', cm.nombre,
                  'FechaRegistro', cm.fecharegistro,
                  'FechaActualizacion', cm.fechaactualizacion,
                  'Estado', cm.estado
                )
              )
            )
          ) FILTER (WHERE im.idinsumomedida IS NOT NULL),
          '[]'
        ) AS "Insumomedida"

      FROM insumo i

      LEFT JOIN subcategoria sc 
        ON sc.idsubcategoria = i.idsubcategoria

      LEFT JOIN categoria c 
        ON c.idcategoria = sc.idcategoria

      LEFT JOIN insumomedida im 
        ON im.idinsumo = i.idinsumo

      LEFT JOIN unidadmedida um 
        ON um.idunidadmedida = im.idunidadmedida

      LEFT JOIN categoriamedida cm 
        ON cm.idcategoriamedida = um.idcategoriamedida

      WHERE 
        ($1::text IS NULL OR i.nombre ILIKE '%' || $1::text || '%')
      AND ($2::int IS NULL OR i.estado = $2)
      AND ($3::text IS NULL OR c.idcategoria = $3)
      AND ($4::text IS NULL OR sc.idsubcategoria = $4)

      GROUP BY 
        i.idinsumo,
        sc.idsubcategoria,
        c.idcategoria

      ORDER BY i.idinsumo
      LIMIT $5 OFFSET $6;
      `, [
            searchParam,
            estadoParam,
            categoriaParam,
            subcategoriaParam,
            Number(limit),
            offset
        ]);
        if (result.length === 0) {
            return res.json({
                total: 0,
                page: Number(page),
                limit: Number(limit),
                data: []
            });
        }
        return res.json({
            total: result[0].total,
            page: Number(page),
            limit: Number(limit),
            data: result
        });
    }
    catch (error) {
        console.error("Error real:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};
exports.getInsumo = getInsumo;
const createInsumo = async (req, res) => {
    try {
        const { RegistroProducto } = req.body;
        const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('INS');
        const producto = new Insumo_1.Insumo();
        producto.IdInsumo = nuevoId;
        if (RegistroProducto.Nombre)
            producto.Nombre = RegistroProducto.Nombre;
        producto.FechaRegistro = new Date();
        const ahora = new Date();
        const hora = ahora.getHours().toString().padStart(2, '0');
        const min = ahora.getMinutes().toString().padStart(2, '0');
        const seg = ahora.getSeconds().toString().padStart(2, '0');
        producto.HoraRegistro = `${hora}:${min}:${seg}`;
        if (RegistroProducto.Descripcion)
            producto.Descripcion = RegistroProducto.Descripcion;
        if (RegistroProducto.Url)
            producto.Imagen = RegistroProducto.Url;
        if (RegistroProducto.IdSubCategoria)
            producto.Subcategoria = await (0, Categoria_controllers_1.verifySubCategoria)({ CategoriaId: RegistroProducto.IdSubCategoria });
        if (RegistroProducto.stockminimo)
            producto.StockMinimo = RegistroProducto.stockminimo;
        if (RegistroProducto.Descripcion)
            producto.Descripcion = RegistroProducto.Descripcion;
        await producto.save();
        if (RegistroProducto.Insumomedida && RegistroProducto.Insumomedida.length > 0)
            for (const medida of RegistroProducto.Insumomedida)
                await (0, Insumomedida_controllers_1.createInsumoMedida)(nuevoId, medida.IdUnidadMedida, medida.Cantidad);
        return res.json({ message: "El Producto se registró correctamente" });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.createInsumo = createInsumo;
const updateInsumo = async (req, res) => {
    try {
        const { id } = req.params;
        const { RegistroProducto } = req.body;
        const producto = await Insumo_1.Insumo.findOne({ where: { IdInsumo: id },
            relations: ["Insumomedida"] });
        if (!producto)
            return res.status(404).json({ message: "Insumo no encontrado" });
        if (RegistroProducto.Nombre)
            producto.Nombre = RegistroProducto.Nombre;
        if (RegistroProducto.Url)
            producto.Imagen = RegistroProducto.Url;
        if (RegistroProducto.IdSubCategoria)
            producto.Subcategoria = await (0, Categoria_controllers_1.verifySubCategoria)({ CategoriaId: RegistroProducto.IdSubCategoria });
        if (RegistroProducto.stockminimo)
            producto.StockMinimo = RegistroProducto.stockminimo;
        if (RegistroProducto.Descripcion)
            producto.Descripcion = RegistroProducto.Descripcion;
        await producto.save();
        //     // IDs enviados desde el front (o vacío si no mandaron nada)
        // const idsEnviadosMedida = RegistroProducto.Insumomedida?.map((pm: any) => pm.IdInsumomedida)
        //   .filter((id: any) => id !== undefined) || [];
        // // Todas las medidas actuales en BD
        // const medidasActuales = producto.Insumomedida || [];
        // if (!RegistroProducto.Insumomedida || RegistroProducto.Insumomedida.length === 0) {
        //   // Caso: no se envió nada → eliminar todas
        // //   for (const medida of medidasActuales) {
        // //     await Insumomedida.delete({ IdinsumoMedida: medida.IdinsumoMedida });
        // //   }
        // // } else {
        // //   // Caso: sí se enviaron medidas → eliminar las que no estén en idsEnviados
        // //   const medidasAEliminar = medidasActuales.filter(
        // //     (pm: any) => !idsEnviadosMedida.includes(pm.IdinsumoMedida)
        // //   );
        // //   for (const medida of medidasAEliminar) {
        // //     await Insumomedida.delete({ IdinsumoMedida: medida.IdinsumoMedida });
        // //   }
        if (RegistroProducto.Insumomedida && RegistroProducto.Insumomedida.length > 0) {
            // Crear o actualizar las medidas que vinieron
            for (const medida of RegistroProducto.Insumomedida) {
                await (0, Insumomedida_controllers_1.updateInsumoMedida)(medida.IdInsumomedida, id, medida.IdUnidadMedida, medida.Cantidad, medida.IdEstado);
            }
        }
        return res.json({
            message: "El Insumo se actualizó correctamente"
        });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.updateInsumo = updateInsumo;
const deleteInsumo = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.AppDataSource.query(`UPDATE insumo 
      SET estado = CASE WHEN estado = 1 THEN 0 ELSE 1 END
      WHERE IdInsumo = $1
      RETURNING estado AS estado`, [id]);
        // ✅ aquí está el cambio
        if (result.length === 0) {
            return res.status(404).json({ message: "Insumo no encontrado" });
        }
        const nuevoEstado = Number(result[0][0].estado);
        const mensajeAccion = nuevoEstado === 1 ? "habilitaron" : "eliminaron";
        return res.json({
            message: `Se ${mensajeAccion} los datos del insumo correctamente`,
        });
    }
    catch (error) {
        console.error("Error al cambiar el estado del Producto:", error);
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.deleteInsumo = deleteInsumo;
const verifyInsumo = async ({ ProductoId }) => {
    const existProducto = await Insumo_1.Insumo.findOne({ where: { IdInsumo: ProductoId } });
    if (!existProducto) {
        throw new error_handler_1.HttpError(404, `El insumo con ID ${ProductoId} no existe.`);
    }
    return existProducto;
};
exports.verifyInsumo = verifyInsumo;
const ListInsumo = async (req, res) => {
    try {
        ``;
        const result = await db_1.AppDataSource.query(`SELECT i.idinsumo, i.nombre , i.imagen
      FROM insumo i 
      WHERE i.estado = 1`);
        return res.json({ result });
    }
    catch (error) {
        console.error("Error al cambiar el estado del Producto:", error);
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.ListInsumo = ListInsumo;
const SubirPhotoInsumo = async (req, res) => {
    try {
        const { id } = req.params;
        const { Foto } = req.body;
        const insumo = await Insumo_1.Insumo.findOneBy({ IdInsumo: id });
        if (!insumo)
            return res.status(404).json({ message: "El isnumo no fue encontrado" });
        insumo.Imagen = Foto;
        await insumo.save();
        return res.status(200).json({ message: "Se actualizo la imagen del Persona exitosamente" });
    }
    catch (error) {
        console.error("Error al obtener los menús del rol:", error);
        return res.status(500).json({ mensaje: "Error del servidor" });
    }
};
exports.SubirPhotoInsumo = SubirPhotoInsumo;
