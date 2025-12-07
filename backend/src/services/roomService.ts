import { User } from "@prisma/client";
import { redis } from "../config/redis";
import prisma from "../lib/prisma";
import { logger } from '../utils/logger';
import { RoomQueue } from "../types";

class RoomService {

    async createRoom(roomName: string, createdBy: string) {
        try {
            await prisma.room.create({
                data: {
                    name: roomName,
                    createdBy: createdBy
                }
            })
        } catch (error) {
            logger.error(`Error creating room: ${error}`);
        }
    }

    async getRooms(userId: string, page: number, perPage: number, search: string | null, forUser: boolean | null) {
        try {
            if (!forUser && !search) {
                return [];
            }
            const totalRooms = await prisma.room.count({
                where: {
                    ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
                    ...(forUser ? { createdBy: userId } : {})
                }
            });
            const rooms = await prisma.room.findMany({
                where: {
                    ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
                    ...(forUser ? { createdBy: userId } : {})
                },
                skip: (page > 0 && perPage > 0) ? ((page - 1) * perPage) : 0,
                take: perPage,
                orderBy: {
                    createdAt: 'desc'
                }
            });
            const totalPages = Math.ceil(totalRooms / perPage);
            let roomsArr = Array.from(rooms);
            const formattedRoomsArr = roomsArr.map(room => ({
                name: room.name,
            }));
            return {
                rooms: formattedRoomsArr,
                pagination: {
                    ...(forUser ? { totalRooms } : {}),
                    total: totalRooms,
                    page: page,
                    nextPage: page < totalPages,
                    prevPage: page > 1,
                }
            };
        } catch (error) {
            logger.error(`Error fetching rooms for user ${userId}: ${error}`);
            return [];
        }
    }

    getKeys(roomName: string) {
        const key = `room:${roomName}`;
        const roomKey = `${key}:room`;
        const metaKey = `${key}:meta"`;
        const queueKey = `${key}:queue`;

        return {
            key,
            roomKey,
            metaKey,
            queueKey
        }
    }

    async createRoomInRedis(roomName: string) {
        try {
            const { key, metaKey } = this.getKeys(roomName);
            await redis.hset(metaKey, 'url', 'null');
        } catch (error) {
            logger.error(`Something went wrong while creatingRoomInRedis: ${error}`);
        }
    }

    async joinRoom(roomName: string, user: User) {
        try {
            const { roomKey, metaKey } = this.getKeys(roomName);
            const roomMembers = await redis.scard(roomKey);
            if (roomMembers === 0) {
                redis.hset(metaKey, 'master', JSON.stringify(user));
            } else {
                await redis.sadd(roomKey, JSON.stringify(user));
            }
            const roomObject = await this.getRoomState(roomName);

            return {
                success: true,
                message: 'Room Joined!',
                data: {
                    name: roomObject?.roomName,
                    currentTrack: roomObject?.meta,
                    queue: roomObject?.queue,
                }
            }
        } catch (error) {
            logger.error('Something went wrong while adding user to room');
            return {
                success: false,
                message: 'There is some problem joining Room, Please try again later!',
                data: null,
            }
        }
    }

    async getRoomState(roomName: string) {
        try {
            const { queueKey, metaKey, roomKey } = this.getKeys(roomName);
            let queue = await redis.lrange(queueKey, 0, -1);
            queue = queue.map(q => JSON.parse(q));
            const meta = await redis.hgetall(metaKey);
            const users = await redis.smembers(roomKey);
            return {
                roomName,
                queue,
                meta,
                users,
            }
        } catch (error) {
            console.log(`Something went wrong while getRoomState: ${error}`);
        }
    }

    async addSongToQueue(roomName: string, userId: string, track: RoomQueue) {
        try {
            /**
             * First Check if this room exist ???
             * Then Check, is this user in this room,
             * Then put in the queue
             */
            const { roomKey, queueKey, metaKey } = this.getKeys(roomName);
            const isRoomExist = await redis.exists(roomKey);
            if (!isRoomExist) {
                // TODO: close connection
            }
            const isUserPresent = await redis.sismember(roomKey, userId);
            if (!isUserPresent) {
                // TODO: close connection
            }
            const roomState = await this.getRoomState(roomName);

            // const queueLength = roomState?.queue.length;
            // const isSongPlaying = roomState?.meta?.url;
            // if (queueLength === 0 && !isSongPlaying) {
            //     await redis.hset(metaKey, 'url', track?.url as string);
            // } else {
            await redis.lpush(queueKey, JSON.stringify(track));
            // }
            const roomObject = await this.getRoomState(roomName);
            return {
                success: true,
                message: 'Song added to queue!',
                data: {
                    name: roomObject?.roomName,
                    currentTrack: roomObject?.meta,
                    queue: roomObject?.queue,
                }
            }
        } catch (error) {
            logger.error(`Error while addSongToQueu: ${error}`)
            return {
                success: false,
                message: 'Something went wrong while adding song, Please try again!',
                data: null,
            }
        }
    }
}
const roomService = new RoomService();
export default roomService;