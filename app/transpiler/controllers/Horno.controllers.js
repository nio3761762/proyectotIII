"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEHorno = exports.createHorno = exports.verifyHornoEnergia = exports.verifyHorno = exports.UpdateORPostHorno = exports.getHornos = void 0;
const db_1 = require("../db");
const idGenerator_1 = require("../utils/idGenerator");
const Horno_1 = require("../entities/Horno");
const HornoEnergia_1 = require("../entities/HornoEnergia");
const Sucursal_controllers_1 = require("./Sucursal.controllers");
const error_handler_1 = require("../utils/error.handler");
const getHornos = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.AppDataSource.query(`
      SELECT  
        h.idhorno,
        h.nombre,
        h.imagen,
        h.estado,
        h.cantidadlata,
        COALESCE(
          json_agg(
            json_build_object(
              'idHornoEnergia', e.idhornoenergia,
              'tipoEnergia', e.tipoenergia,
              'consumoPorHora', e.consumoporhora
            )
          ) FILTER (WHERE e.idhornoenergia IS NOT NULL),
          '[]'
        ) AS energias
      FROM horno h
      LEFT JOIN horno_energia e 
        ON e.idhorno = h.idhorno
      WHERE h.idsucursal = $1 
      GROUP BY h.idhorno, h.nombre, h.imagen
    `, [id]);
        return res.json({ result });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getHornos = getHornos;
const UpdateORPostHorno = async (req, res) => {
    try {
        const { Personas } = req.body;
        if (!Personas || Personas.length === 0) {
            return res.status(400).json({ message: "Debe enviar al menos un horno" });
        }
        for (const persona of Personas) {
            const horno = await (0, exports.createHorno)(persona.IdHorno, persona.IdSucursal, persona.Url, persona.Nombre, persona.Idestado, persona.Cantidad);
            // 🔹 Crear energías asociadas
            if (persona.Energia && persona.Energia.length > 0) {
                for (const energia of persona.Energia) {
                    await (0, exports.createEHorno)(horno, energia.IdHornEnergia, energia.Tipo, energia.Consumo);
                }
            }
        }
        return res.json({ message: "Se registraron los hornos correctamente" });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error al crear horno:", error);
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.UpdateORPostHorno = UpdateORPostHorno;
const verifyHorno = async (idhorno) => {
    const horno = await Horno_1.Horno.findOne({
        where: { IdHorno: idhorno }
    });
    if (!horno) {
        throw new error_handler_1.HttpError(404, `El horno con ID ${idhorno} no existe.`);
    }
    return horno;
};
exports.verifyHorno = verifyHorno;
const verifyHornoEnergia = async (idhorno) => {
    const horno = await HornoEnergia_1.HornoEnergia.findOne({
        where: { IdHornoEnergia: idhorno }
    });
    if (!horno) {
        throw new error_handler_1.HttpError(404, `La energia del horno con ID ${idhorno} no existe.`);
    }
    return horno;
};
exports.verifyHornoEnergia = verifyHornoEnergia;
const createHorno = async (IdHorno, IdSucursal, Url, Nombre, Estado, catindad) => {
    let horno;
    if (IdHorno) {
        horno = await (0, exports.verifyHorno)(IdHorno);
        if (Nombre)
            horno.Nombre = Nombre;
        if (Url)
            horno.Imagen = Url;
        if (IdSucursal)
            horno.Sucursal = await (0, Sucursal_controllers_1.verifySucursal)({ SucursalId: IdSucursal });
        horno.Cantidadlata = catindad;
        horno.Estado = Estado;
        await horno.save();
    }
    else {
        if (Estado === 1) {
            horno = new Horno_1.Horno();
            const hornoId = await (0, idGenerator_1.generarIdSecuencial)('HORNO');
            horno.IdHorno = hornoId;
            horno.Nombre = Nombre;
            horno.Sucursal = await (0, Sucursal_controllers_1.verifySucursal)({ SucursalId: IdSucursal });
            horno.Cantidadlata = catindad;
            if (Url) {
                horno.Imagen = Url;
            }
            await horno.save();
        }
    }
    return horno;
};
exports.createHorno = createHorno;
const createEHorno = async (Horno, IdEHorno, Tipo, Consumo) => {
    let henergia;
    if (IdEHorno) {
        henergia = await (0, exports.verifyHornoEnergia)(IdEHorno);
        if (Horno)
            henergia.Horno = Horno;
        henergia.TipoEnergia = Tipo;
        if (Consumo > 0) {
            henergia.ConsumoPorHora = Consumo;
        }
        await henergia.save();
    }
    else {
        const energiaId = await (0, idGenerator_1.generarIdSecuencial)('EHOOR');
        henergia = new HornoEnergia_1.HornoEnergia();
        henergia.IdHornoEnergia = energiaId;
        if (Horno)
            henergia.Horno = Horno;
        henergia.TipoEnergia = Tipo;
        if (Consumo > 0) {
            henergia.ConsumoPorHora = Consumo;
        }
        await henergia.save();
    }
};
exports.createEHorno = createEHorno;
