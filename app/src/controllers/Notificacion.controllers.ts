import { Request, Response } from "express";

export const sendNotifications = async (req: Request, res: Response) => {
    res.status(501).json({ message: "Not implemented" });
};