import { z } from "zod";
import { ROOM_NAME_REGEX } from "./constants";

export enum WebSocketEventType {
    JOIN_ROOM = 'JOIN_ROOM',
    ADD_TO_QUEUE = 'ADD_TO_QUEUE',
    PLAY_NEXT_IN_QUEUE = 'PLAY_NEXT_IN_QUEUE',
    ADMIN_LEAVE = 'ADMIN_LEAVE',
    ADMIN_JOIN = 'ADMIN_JOIN',
}

export type RoomQueue = {
    id: string;
    trackId: string;
    title: string;
    thumbnail: string;
    artist: string;
    duration: number;
    platform: string;
    url?: string;
    addedBy: string;
}

export type RoomState = {
    name: string;
    currentTrack: {
        url: string;
    },
    queue: RoomQueue[]
}

export const roomSchema = z
    .object({
        name: z
            .string()
            .regex(ROOM_NAME_REGEX, "Only letters, numbers, and hyphens are allowed")
            .min(3, "Room name must be at least 3 characters")
            .max(30, "Room name must be at most 30 characters")
            .transform((val) => val.toLowerCase()),
    })
    .strip();


export const roomQuerySchema = z.object({
    per_page: z
        .coerce
        .number("per_page should be number only")
        .lte(10, { error: "per_page should be less than or equal to 10" })
        .optional(),
    page: z
        .coerce
        .number("page should be number only")
        .min(1, { error: "page should be greater than or equal to 1" })
        .optional(),
    search: z.string()
        .max(30, { error: "search should be at most 30 characters" })
        .optional(),
    for_user: z.coerce.boolean().optional(),
});

export const urlQuerySchema = z.object({
    url: z.url()
});

export const roomQueueSchema = z.object({
    id: z.uuid({
        version: 'v4',
    }),
    trackId: z.string({ message: "trackId is required" }),
    title: z.string({ message: "title is required" }),
    thumbnail: z.string({ message: "thumbnail is required" }),
    artist: z.string({ message: "artist is required" }),
    duration: z.number({ message: "duration is required" }),
    platform: z.string({ message: "platform is required" }),
    url: z.string().optional(),
}).strict();



export const joinRoomSchema = z.object({
    event: z.literal(WebSocketEventType.JOIN_ROOM),
});

export const addToQueueSchema = z.object({
    event: z.literal(WebSocketEventType.ADD_TO_QUEUE),
    data: z.object({
        track: roomQueueSchema,
    }),
});

export const playNextInQueueSchema = z.object({
    event: z.literal(WebSocketEventType.PLAY_NEXT_IN_QUEUE),
});