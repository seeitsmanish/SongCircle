import { Router } from "express";
import { getAuth, requireAuth } from "@clerk/express";
import roomService from "../services/roomService";
import { logger } from "../utils/logger";
import { MediaService } from "../services/MediaService";
import rateLimit from "express-rate-limit";
import { roomQuerySchema, roomSchema, urlQuerySchema, } from "../types";

const router = Router();

const roomCreationLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
});

router.post(
    "/create-room",
    roomCreationLimiter,
    requireAuth(),
    async (req, res) => {
        try {
            const { userId } = getAuth(req);
            if (!userId) {
                logger.warn("Unauthorized room creation attempt");
                res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                    data: null,
                });
                return;
            }
            // Validate request body
            const { success, data, error } = roomSchema.safeParse(req.body);
            if (!success) {
                logger.warn({ roomName: data }, "Room creation validation failed");
                const errorMessages = error.issues.map(issue => issue.message).join(", ");
                res.status(400).json({
                    success: false,
                    message: errorMessages,
                    data: null,
                });
                return;
            }

            await roomService.createRoom(data.name.toLowerCase(), userId);
            res.status(201).json({ message: "Room created successfully" });
        } catch (error) {
            logger.error(`Error in /create-room route: ${error}`);
            res.status(500).json({
                message: error instanceof Error ? error.message : "Internal Server Error",
            });
        }
    }
);

router.get(
    "/rooms",
    requireAuth(),
    async (req, res) => {
        try {
            const { userId } = getAuth(req);
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                    data: null,
                });
                return;
            }

            // Validate query parameters
            const result = roomQuerySchema.safeParse(req.query);

            if (!result.success) {
                const errorMessages = result.error.issues.map((issue) => issue.message).join(", ");
                res.status(400).json({
                    success: false,
                    messaeg: errorMessages,
                    data: null,
                });
                return;
            }

            const perPage = result.data.per_page || 10;
            const page = result.data.page || 1;
            const search = result.data.search?.toLowerCase() || null;
            const forUser = result.data.for_user || null;

            const roomsObject = await roomService.getRooms(
                userId,
                page,
                perPage,
                search,
                forUser
            );
            logger.info(`Fetched rooms for user ${userId} with search: ${search}`);
            res.status(200).json(roomsObject);
        } catch (error) {
            logger.error(`Error in /rooms route: ${error}`);
            res.status(500).json({
                message: error instanceof Error ? error.message : "Internal Server Error",
            });
        }
    }
);

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: "Too many requests, please try again later.",
            data: null,
        });
    },
});

router.get("/metadata", limiter, requireAuth(), async (req, res) => {
    try {
        // Validate query parameters
        const validatedQuery = urlQuerySchema.safeParse(req.query);

        if (!validatedQuery.success) {
            const errorMessages = validatedQuery.error.issues.map((issue) => issue.message).join(", ");
            res.status(400).json({
                success: false,
                message: errorMessages,
                data: null,
            });
            return;
        }

        const data = await MediaService.fetchMetaData(validatedQuery.data.url);
        res.status(200).json({
            success: true,
            message: "Found your Music!",
            data,
        });
    } catch (error) {
        logger.error(`Something went wrong in route /metadata, ${error}`);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Something went wrong, Please try again later!",
            data: null,
        });
    }
});

export default router;
