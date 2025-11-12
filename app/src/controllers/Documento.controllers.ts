import { Documento } from "../entities/Documento";
import { HttpError } from "../utils/error.handler";
import { generarIdSecuencial } from "../utils/idGenerator";
import { verifyComplemento } from "./Complemento.controllers";
import { verifyPersona } from "./Persona.controllers";
import { verifyTipoDocumento } from "./TipoDocumento.controllers";


export const verifyDocumento = async ({ Documentoid }: { Documentoid: string }) => {

    const existDocumento = await Documento.findOne({ where: { IdDocumento: Documentoid } });


    if (!existDocumento) {
        throw new HttpError(404, `El Documento con ID ${Documentoid} no existe.`);
    }

    return existDocumento;
};

export const createDocumento = async ({ IdTipoDocumento, IdComplemento, Documentos, PersonaId }: { IdTipoDocumento: string, IdComplemento: string, Documentos: string,PersonaId:string }) => {
  if(Documentos){
const nuevoId = await generarIdSecuencial('DC');
   
    const nuevoDocumento = new Documento()
    nuevoDocumento.IdDocumento = nuevoId;
    if(PersonaId) nuevoDocumento.Persona = await verifyPersona({PersonaId:PersonaId})
    if (Documentos) nuevoDocumento.Documento = Documentos;
    if(IdTipoDocumento) nuevoDocumento.Tipodocumento = await verifyTipoDocumento({ TipoId: IdTipoDocumento });
    if (IdComplemento) nuevoDocumento.Complemento = await verifyComplemento({ TipoId: IdComplemento })

    await nuevoDocumento.save();


    return nuevoDocumento;
  }else
    return null;
   
};



export const updateDocumento = async ({ DocumentoId, IdTipoDocumento, IdComplemento, Documentos,PersonaId }: { DocumentoId: string, IdTipoDocumento: string, IdComplemento: string, Documentos: string,PersonaId:string }) => {


    if(DocumentoId){
       const existDocumento = await verifyDocumento( { Documentoid: DocumentoId});

    
    if (Documentos) existDocumento.Documento = Documentos;
    if(IdTipoDocumento) existDocumento.Tipodocumento = await verifyTipoDocumento({ TipoId: IdTipoDocumento });
    if (IdComplemento) existDocumento.Complemento = await verifyComplemento({ TipoId: IdComplemento })

    await existDocumento.save();


    return existDocumento;  
    }else
        return createDocumento({IdTipoDocumento:IdTipoDocumento,IdComplemento:IdComplemento,Documentos:Documentos,PersonaId:PersonaId})
   
};


