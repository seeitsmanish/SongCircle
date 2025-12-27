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
            console.log(this.rooms);
        } catch (error) {
            logger.error(`Something went wrong in SocketStore.joinRoom, ${error}`);
            throw error;
        }
    }

    leaveRoom(roomName: string, ws: RoomWebSocket) {
        try {
            const roomSet = this.rooms.get(roomName)
            roomSet?.delete(ws);
            if (roomSet?.size === 0) {
                this.rooms.delete(roomName);
            }
        } catch (error) {
            logger.error(`Something went wrong in SocketStore.joinRoom, ${error}`);
            throw error;
        }
    }

    broadcast(roomName: string, payload: any) {
        try {
            const roomSet = this.rooms.get(roomName)
            roomSet?.forEach(ws => {
                payload.data.isAdmin = ws.isAdmin;
                ws.send(JSON.stringify(payload));
            })
        } catch (error) {
            logger.error(`Something went wrong in SocketStore.broadcast, ${error}`);
            throw error;
        }
    }

}

export const socketStore = new SocketStore();