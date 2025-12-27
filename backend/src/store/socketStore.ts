import { logger } from "../utils/logger";
import { RoomWebSocket } from "../webSocketServer";

class SocketStore {

    private rooms = new Map<string, Set<RoomWebSocket>>();

    joinRoom(roomName: string, ws: RoomWebSocket) {
        try {
            if (!this.rooms.has(roomName)) {
                this.rooms.set(roomName, new Set<RoomWebSocket>());
            }
            this.rooms.get(roomName)?.add(ws);
            logger.info({ roomName, userId: ws.userId, isAdmin: ws.isAdmin }, 'WebSocket connected and added to socketStore');
        } catch (error) {
            logger.error(`Something went wrong in SocketStore.joinRoom, ${error}`);
            throw error;
        }
    }

    leaveRoom(roomName: string, ws: RoomWebSocket) {
        try {
            const roomSet = this.rooms.get(roomName)
            roomSet?.delete(ws);
            logger.info({ roomName, userId: ws.userId, isAdmin: ws.isAdmin }, 'WebSocket disconnected and removed from socketStore');
            if (roomSet?.size === 0) {
                this.rooms.delete(roomName);
                logger.info({ roomName }, 'Room deleted from socketStore as no active connections present');
            }
        } catch (error) {
            logger.error(`Something went wrong in SocketStore.joinRoom, ${error}`);
            throw error;
        }
    }

    clearRoom(roomName: string) {
        try {
            this.rooms.delete(roomName);
            logger.info({ roomName }, 'Room cleared from socketStore');
        }
        catch (error) {
            logger.error(`Something went wrong in SocketStore.clearRoom, ${error}`);
            throw error;
        }
    }

    broadcast(roomName: string, payload: any, excludeIds: string[] = []) {
        try {
            const roomSet = this.rooms.get(roomName)
            logger.info({ roomName, payload }, 'Broadcasting message to room');
            for (const ws of roomSet || []) {
                if (excludeIds.includes(ws.userId)) {
                    logger.info({ roomName, userId: ws.userId }, 'Excluding user from broadcast');
                    continue;
                }
                payload.data.isAdmin = ws.isAdmin;
                ws.send(JSON.stringify(payload));
            }
        } catch (error) {
            logger.error(`Something went wrong in SocketStore.broadcast, ${error}`);
            throw error;
        }
    }

    getRoom(roomName: string): Set<RoomWebSocket> | undefined {
        const roomSet = this.rooms.get(roomName)
        return roomSet;
    }

}

export const socketStore = new SocketStore();

setInterval(() => {
    console.log("\n\n\n\Current Rooms in SocketStore:");
    const room = socketStore.getRoom('manish-car')
    if (room) {
        room?.forEach((ws) => {
            console.log(`UserId: ${ws.userId}, isAdmin: ${ws.isAdmin}`);
        })
    }
}, 3000)