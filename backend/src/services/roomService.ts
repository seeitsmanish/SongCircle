import prisma from "../lib/prisma";
import { logger } from '../utils/logger';

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
}
const roomService = new RoomService();
export default roomService;