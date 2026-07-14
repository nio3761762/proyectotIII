import { Documento } from "../entities/Documento";
import { HttpError } from "../utils/error.handler";
import { generarIdSecuencial } from "../utils/idGenerator";
import { verifyComplemento } from "./Complemento.controllers";
import { verifyPersona } from "./Persona.controllers";


export const verifyDocumento = async ({ Documentoid }: { Documentoid: string }) => {

    const existDocumento = await Documento.findOne({ where: { IdDocumento: Documentoid } });


    if (!existDocumento) {
        throw new HttpError(404, `El Documento con ID ${Documentoid} no existe.`);
    }

    return existDocumento;
};

export const createDocumento = async ({  IdComplemento, Documentos, PersonaId }: {  IdComplemento: string, Documentos: string,PersonaId:string }) => {
  if(Documentos){
const nuevoId = await generarIdSecuencial('DC');
   
    const nuevoDocumento = new Documento()
    nuevoDocumento.IdDocumento = nuevoId;
    if(PersonaId) nuevoDocumento.Persona = await verifyPersona({PersonaId:PersonaId})
    if (Documentos) nuevoDocumento.Documento = Documentos;
     if (IdComplemento) nuevoDocumento.Complemento = await verifyComplemento({ TipoId: IdComplemento })

    await nuevoDocumento.save();


    return nuevoDocumento;
  }else
    return null;
   
};



export const updateDocumento = async ({ DocumentoId,  IdComplemento, Documentos,PersonaId }: { DocumentoId: string,  IdComplemento: string, Documentos: string,PersonaId:string }) => {


    if(DocumentoId){
       const existDocumento = await verifyDocumento( { Documentoid: DocumentoId});

    
    if (Documentos) existDocumento.Documento = Documentos;
    if (IdComplemento) existDocumento.Complemento = await verifyComplemento({ TipoId: IdComplemento })

    await existDocumento.save();


    return existDocumento;  
    }else
        return createDocumento({IdComplemento:IdComplemento,Documentos:Documentos,PersonaId:PersonaId})
   
};


