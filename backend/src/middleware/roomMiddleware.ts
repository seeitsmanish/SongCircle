import { NextFunction, Request, Response } from 'express';
import * as z from 'zod';
import { ROOM_NAME_REGEX } from '../constants';
export const roomSchema = z.object({
    name: z.string()
        .regex(ROOM_NAME_REGEX, "Only letters, numbers, and hyphens are allowed")
        .min(3, "Room name must be at least 3 characters")
        .max(30, "Room name must be at most 30 characters")
        .transform((val) => val.toLowerCase())
}).strip();

export const createRoomMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const result = roomSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ errors: result.error.message });
        return;
    }
    req.body = result.data;
    next();
}
