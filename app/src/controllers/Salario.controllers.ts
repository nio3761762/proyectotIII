import { Request, Response } from "express";
import { Salario } from "../entities/Salario";

export const getSalario = async (req: Request, res: Response) => {
  try {
    const salarios = await Salario.find();
    return res.json(salarios);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const verifySalario = async ({ SalarioId }: { SalarioId: string }) => {

    const existSalario = await Salario.findOne({ where: { Salario: Number(SalarioId) } });
   if (!existSalario) {
  return await createSalario({ salario:Number(SalarioId)});
  }else
   return existSalario;
};
export const verifySalarioId = async ({ SalarioId }: { SalarioId: string }) => {

    const existSalario = await Salario.findOne({ where: { IdSalario: SalarioId } });
   if (!existSalario) {
    throw new Error(`El salario con ID ${existSalario} no existe.`);
   }
   return existSalario;
};

export const createSalario = async ({  salario }: {  salario: number }) => {
  
 const result = await Salario.createQueryBuilder("salario")
    .select("MAX(CAST(SUBSTRING(Salario.IdSalario FROM '[0-9]+') AS INTEGER))", "ultimoNumero")
    .getRawOne();

  const nuevoNumero = (result?.ultimoNumero || 0) + 1;
  const nuevoId = `SAL-${nuevoNumero}`;
       

    const nuevo= new Salario();
    nuevo.IdSalario=nuevoId;
    nuevo.Salario=salario;
    await nuevo.save();

    return nuevo;
};
export const updateSalario = async ({ SalarioId, salario }: { SalarioId: string, salario: number}) => {

    const existSalario = await verifySalarioId({ SalarioId });
    
   if (!existSalario) {
    throw new Error(`El salario con ID ${existSalario} no existe.`);
  }
    
    existSalario.IdSalario=SalarioId;
    existSalario.Salario= salario ?? existSalario.Salario;
    
    await existSalario.save();

    return existSalario;
};