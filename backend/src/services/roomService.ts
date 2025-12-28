import { redis } from "../config/redis";
import prisma from "../lib/prisma";
import { logger } from '../utils/logger';
import { RoomQueue, WebSocketEventType } from '../types';
import { socketStore } from "../store/socketStore";
import { RoomWebSocket } from "../webSocketServer";

class RoomService {

    async createRoom(roomName: string, clerkUserId: string) {
        try {
            await prisma.room.create({
                data: {
                    name: roomName,
                    clerkUserId: clerkUserId
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
                    ...(forUser ? { clerkUserId: userId } : {})
                }
            });
            const rooms = await prisma.room.findMany({
                where: {
                    ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
                    ...(forUser ? { clerkUserId: userId } : {})
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
        const metaKey = `${key}:meta`;
        const queueKey = `${key}:queue`;
        const currentTrackKey = `${key}:currentTrack`;

        return {
            key,
            roomKey,
            metaKey,
            queueKey,
            currentTrackKey
        }
    }

    async fetchAdminId(roomName: string) {
        try {
            const room = await prisma.room.findFirst({
                where: {
                    name: {
                        contains: roomName,
                        mode: 'insensitive'
                    },
                }
            })
            if (!room) {
                throw new Error('No room found!');
            }
            return room.clerkUserId;
        }
        catch (error) {
            logger.error(`Something went wrong in RoomService.isAdmin, ${error}`);
            throw error;
        }
    }

    async createMetaData(roomName: string) {
        try {
            const adminId = await this.fetchAdminId(roomName);
            const { metaKey, currentTrackKey } = this.getKeys(roomName);
            await redis.hset(metaKey, {
                adminId: adminId,
                isAdminPresent: 'false',
            })
            // set null to current track
            await redis.set(currentTrackKey, JSON.stringify(null));
        } catch (error) {
            logger.error(`Something went wrong in RoomService.createMetaData, ${error}`);
            throw error;
        }
    }

    async joinRoom(roomName: string, userId: string, ws: RoomWebSocket) {
        try {
            // create meta data if not exist -> first user joined the room
            const { roomKey, metaKey } = this.getKeys(roomName);

            // check if user exists and Add user to room in redis and socket store
            const isUserPresent = await redis.sismember(roomKey, userId);
            logger.info(`isUserPresent value: ${isUserPresent} for userId: ${userId} in room: ${roomName}`);
            if (isUserPresent === 0) {
                await redis.sadd(roomKey, userId);
                socketStore.joinRoom(roomName, ws);
            }

            const isMetaExist = await redis.exists(metaKey);
            if (!isMetaExist) {
                logger.info(`Meta data not found for room ${roomName}, creating new one`);
                await this.createMetaData(roomName);
            }

            // check if this user is admin and update the room meta
            const roomMeta = await redis.hgetall(metaKey);
            if (roomMeta?.adminId === userId) {
                logger.info(`Admin joined the room ${roomName}`);
                ws.isAdmin = true;
                await redis.hset(metaKey, {
                    isAdminPresent: 'true'
                });
            } else {
                ws.isAdmin = false;
            }

            const roomObject = await this.getRoomState(roomName);

            if (ws.isAdmin) {
                socketStore.broadcast(roomName, {
                    success: true,
                    message: 'Admin has joined the room',
                    data: {
                        name: roomObject?.roomName,
                        currentTrack: roomObject?.currentTrack,
                        queue: roomObject?.queue,
                        isAdminPresent: roomObject?.meta?.isAdminPresent === 'true',
                    },
                    event: WebSocketEventType.ADMIN_JOIN
                },
                    [userId]
                )
            }

            return {
                success: true,
                message: 'Room Joined!',
                data: {
                    name: roomObject?.roomName,
                    currentTrack: roomObject?.currentTrack,
                    queue: roomObject?.queue,
                    isAdmin: roomObject?.meta?.adminId === userId,
                    isAdminPresent: roomObject?.meta?.isAdminPresent === 'true',
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

    async cleanupRoom(roomName: string) {
        try {
            const { metaKey, queueKey, roomKey, currentTrackKey } = this.getKeys(roomName);
            await redis.del(metaKey);
            await redis.del(queueKey);
            await redis.del(roomKey);
            await redis.del(currentTrackKey);
            socketStore.clearRoom(roomName);
            logger.info(`Cleaned up room data for room: ${roomName}`);
        } catch (error) {
            logger.error(`Something went wrong in RoomService.cleanupRoom, ${error}`);
            throw error;
        }
    }

    async leaveRoom(roomName: string, userId: string, ws: RoomWebSocket) {
        try {
            logger.info(`User ${userId} is leaving room ${roomName}`);
            const { metaKey, queueKey, roomKey, currentTrackKey } = this.getKeys(roomName);

            // Remove user from socket store and redis room set
            socketStore.leaveRoom(roomName, ws);
            await redis.srem(roomKey, userId);

            logger.info(`ws.isAdmin value: ${ws.isAdmin}`);

            const isRoomEmpty = await redis.scard(roomKey);
            if (isRoomEmpty === 0) {
                await this.cleanupRoom(roomName);
            } else if (ws.isAdmin) {
                // update isAdminPresent to false
                logger.info(`Admin left the room ${roomName}`);
                await redis.hset(metaKey, {
                    isAdminPresent: 'false',
                });
                await redis.del(currentTrackKey);
                await redis.del(queueKey);
                // if admin left, broadcast to all users to inform admin has left
                const roomState = await this.getRoomState(roomName);
                socketStore.broadcast(roomName, {
                    success: true,
                    message: 'Admin has left the room',
                    data: {
                        name: roomState?.roomName,
                        currentTrack: roomState?.currentTrack,
                        queue: roomState?.queue,
                        isAdminPresent: roomState?.meta?.isAdminPresent === 'true',
                    },
                    event: WebSocketEventType.ADMIN_LEAVE
                })
            }

        } catch (error) {
            logger.error(`Something went wrong in RoomService.leaveRoom, ${error}`);
            throw error;
        }
    }

    async getRoomState(roomName: string) {
        try {
            const { queueKey, metaKey, roomKey, currentTrackKey } = this.getKeys(roomName);
            let queue = await redis.lrange(queueKey, 0, -1);
            queue = queue.map(q => JSON.parse(q));
            const meta = await redis.hgetall(metaKey);
            const users = await redis.smembers(roomKey);
            const currentTrack = await redis.get(currentTrackKey) as string;
            const roomState = {
                roomName,
                queue,
                meta,
                users,
                currentTrack: JSON.parse(currentTrack),
            }
            return roomState;
        } catch (error) {
            logger.info(`Something went wrong while getRoomState: ${error}`);
        }
    }

    async addSongToQueue(roomName: string, userId: string, track: RoomQueue) {
        try {
            /**
             * First Check if this room exist ???
             * Then Check, is this user in this room,
             * Then put in the queue
             */
            const { roomKey, queueKey, currentTrackKey } = this.getKeys(roomName);
            const isRoomExist = await redis.exists(roomKey);
            if (!isRoomExist) {
                // TODO: close connection
            }
            const isUserPresent = await redis.sismember(roomKey, userId);
            if (!isUserPresent) {
                // TODO: close connection
            }

            // Check if currentTrack is null
            const currentTrack = await redis.get(currentTrackKey);
            const isCurrentTrackEmpty = currentTrack === null || JSON.parse(currentTrack) === null;

            if (isCurrentTrackEmpty) {
                // Set as current track if queue is empty
                await redis.set(currentTrackKey, JSON.stringify(track));
            } else {
                // Add to queue if something is already playing
                await redis.rpush(queueKey, JSON.stringify(track));
            }

            // add song to queue
            const roomObject = await this.getRoomState(roomName);
            return {
                success: true,
                message: 'Song added to queue!',
                data: {
                    name: roomObject?.roomName,
                    currentTrack: roomObject?.currentTrack,
                    queue: roomObject?.queue,
                    isAdminPresent: roomObject?.meta?.isAdminPresent === 'true',
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

    async playNextInQueue(roomName: string, userId: string) {
        try {
            const { queueKey, currentTrackKey, roomKey } = this.getKeys(roomName);
            const isRoomExist = await redis.exists(roomKey);
            if (!isRoomExist) {
                // TODO: close connection
            }
            const isUserPresent = await redis.sismember(roomKey, userId);
            if (!isUserPresent) {
                // TODO: close connection
            }

            // pop song from queue
            const nextTrack = await redis.lpop(queueKey);
            if (nextTrack) {
                await redis.set(currentTrackKey, nextTrack);
            } else {
                await redis.set(currentTrackKey, JSON.stringify(null));
            }

            const roomObject = await this.getRoomState(roomName);
            return {
                success: true,
                message: 'Playing next track!',
                data: {
                    name: roomObject?.roomName,
                    currentTrack: roomObject?.currentTrack,
                    queue: roomObject?.queue,
                    isAdminPresent: roomObject?.meta?.isAdminPresent === 'true',
                }
            }
        } catch (error) {
            logger.error(`Error while playNextInQueue: ${error}`)
            return {
                success: false,
                message: 'Something went wrong while playing next track, Please try again!',
                data: null,
            }
        }
    }

}
const roomService = new RoomService();
export default roomService;


// RoomState {
//     roomName: string;
//     currentTrack: RoomQueue | null;
//     queue: RoomQueue[];
//     meta: {
//         adminId: string;
//         isAdminPresent: string;
//     }
//     users: string[];
// }