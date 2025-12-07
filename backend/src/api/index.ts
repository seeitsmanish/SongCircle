import { Router } from "express";
import { createRoomMiddleware } from "../middleware/roomMiddleware";
import { getAuth, requireAuth } from "@clerk/express";
import roomService from "../services/roomService";
import { logger } from "../utils/logger";
import { MediaService } from "../services/MediaService";
const router = Router();

// TODO:  Add Zod Validation here
router.post("/create-room",
    requireAuth(),
    createRoomMiddleware,
    (req, res) => {
        try {
            const { userId } = getAuth(req)
            if (!userId) {
                res.status(401).json({
                    message: 'Unauthorized'
                })
                return;
            }
            const { name } = req.body;
            roomService.createRoom(name, userId);
            res.status(201).json({ message: 'Room created successfully' });
        } catch (error) {
            logger.error(`Error in /create-room route: ${error}`);
            res.status(500).json({
                message: 'Internal Server Error'
            });
        }
    }

);

// TODO:  Add Zod Validation here
router.get("/rooms", requireAuth(), async (req, res) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            res.status(401).json({
                message: 'Unauthorized'
            });
            return;
        }
        const perPage = req.query.per_page ? Number(req.query.per_page) : 10;
        const page = req.query.page ? Number(req.query.page) : 1;
        const search = req.query.search ? String(req.query.search) : null;
        const forUser = req.query.for_user ? Boolean(req.query.for_user) : null;
        const roomsObject = await roomService.getRooms(userId, page, perPage, search, forUser);
        logger.info(`Fetched rooms for user ${userId} with search: ${search}`);
        res.status(200).json(roomsObject);
    } catch (error) {
        logger.error(`Error in /rooms route: ${error}`);
        res.status(500).json({
            message: 'Our servers are having issues. Please try again later.'
        });
    }
})

// TODO:  Add Zod Validation here
router.get("/metadata", requireAuth(), async (req, res) => {
    try {
        const url = req.query.url as string;
        if (!url) throw new Error('URL is required!');
        const data = await MediaService.fetchMetaData(url);
        res.status(200).json({
            success: true,
            message: 'Found your Music!',
            data,
        })
    } catch (error) {
        logger.error(`Something went wrong in route /metadata, ${error}`);
        res.status(500).json({
            success: false,
            message: 'Something went wrong, Please try again later!',
            data: null,
        })
    }
})

export default router;