"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyMenu = exports.getMenus = void 0;
const Menu_1 = require("../entities/Menu");
const getMenus = async (req, res) => {
    try {
        const Menus = await Menu_1.Menu.find({ relations: ["Icono", "Enlace"] });
        return res.json(Menus);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getMenus = getMenus;
const verifyMenu = async ({ MenuId }) => {
    const existMenu = await Menu_1.Menu.findOne({ where: { IdMenu: MenuId } });
    if (!existMenu) {
        throw new Error(`El menu con ID ${existMenu} no existe.`);
    }
    return existMenu;
};
exports.verifyMenu = verifyMenu;
