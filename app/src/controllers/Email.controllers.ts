import { Request, Response } from "express";

import { Email } from "../entities/Email";
import { HttpError } from "../utils/error.handler";
import { generarIdSecuencial } from "../utils/idGenerator";
import { verifyPersona } from "./Persona.controllers";

export const verifyEmail = async ({ email }: { email: string }) => {

    const existEmail = await Email.findOne({ where: { Email: email } });
    
   if (!existEmail) {
    throw new HttpError(404,`El email  ${email} no existe.`);
  }
     const RelationEmail = await Email.findOne({
        where: { Email: email },
        relations: ["Persona","Persona.Usuario"],
      });
  
    return RelationEmail;
};

export const verifyEmailId = async ({ EmailId }: { EmailId: string }) => {

    const existEmail = await Email.findOne({ where: { IdEmail: EmailId } });
    
    
   if (!existEmail) {
    throw new HttpError(404,`El email con ID ${existEmail} no existe.`);
  }
    
  
    return existEmail;
};

export const createEmail = async ({email, idpersona }: {  email:string, idpersona:string  }) => {
  
// const existEmail = await Email.findOne({ where: { Email: email } });
    
//    if (existEmail) {
//      throw new HttpError(404,`El email ${email} ya está registrado.`);
//   }

    
   const nuevoId = await generarIdSecuencial('EM');

    const nuevo = new Email();
    nuevo.IdEmail=nuevoId;
    nuevo.Email=email;
    nuevo.Persona =await verifyPersona({PersonaId:idpersona})
    await nuevo.save();

    return nuevo;
};

export const updateEmail = async ({ EmailId, email }: { EmailId: string, email: string}) => {

    const existEmail = await verifyEmailId({ EmailId:EmailId });
   
      if (!existEmail) {
     throw new HttpError(404,`Email no registrado.`);
  }


    existEmail.IdEmail=EmailId;
    if(email) existEmail.Email= email;
    
    await existEmail.save();

    return existEmail;
};

export const getEmail = async (req: Request, res: Response) => {
    try {

        const complemento = await Email.find({});
        
        return res.json(complemento)
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message })
        }
    }
}