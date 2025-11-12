import { Request, Response } from "express";
import { Menu } from "../entities/Menu";
export const getMenus = async (req: Request, res: Response) => {
    try {
        const Menus = await Menu.find({  relations: ["Icono","Enlace"]});
        return res.json(Menus);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const verifyMenu = async ({ MenuId }: { MenuId: string }) => {

    const existMenu = await Menu.findOne({ where: { IdMenu: MenuId } });
    
    
   if (!existMenu) {
    throw new Error(`El menu con ID ${existMenu} no existe.`);
  }
  
    return existMenu;
};