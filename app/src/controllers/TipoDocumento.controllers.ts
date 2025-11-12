import { HttpError } from "../utils/error.handler";
import { Tipodocumento } from "../entities/TipoDocumento";


export const verifyTipoDocumento = async ({ TipoId }: { TipoId: string }) => {

    const existTipoDocumento = await Tipodocumento.findOne({ where: { IdTipoDocumento: TipoId } });

    if (!existTipoDocumento) {
        throw new HttpError(404, `El Documento con ID ${TipoId} no existe.`);
    }

    return existTipoDocumento;
};