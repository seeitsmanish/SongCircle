import { Server } from "http";
import WebSocket, { WebSocketServer } from "ws";
import { WebSocketEventType } from "./types";
import roomService from "./services/roomService";
import { socketStore } from "./store/socketStore";
import { logger } from "./utils/logger";
import { userService } from "./services/UserService";
import { User } from "@clerk/express";
export interface RoomWebSocket extends WebSocket {
    room: string;
    token: string;
    userId: string;
    isAdmin: boolean;
}

export const setUpWebSocketServer = (httpServer: Server) => {

    const wss = new WebSocketServer({ noServer: true });

    httpServer.on('upgrade', async (request, socket, head) => {
        const { url } = request;

        const match = url?.match(/^\/ws\/room\/([^/?]+)(?:\?.*)?$/);
        if (!match) {
            socket.destroy();
            return;
        }

        let roomName = match[1];

        try {
            roomName = decodeURIComponent(roomName);
        } catch {
            socket.destroy();
            return;
        }

        const queryMatch = url?.match(/[?&]token=([^&]+)/);
        const token = queryMatch?.[1] ? decodeURIComponent(queryMatch[1]) : null;

        if (!token) {
            logger.warn({ roomName }, 'WebSocket connection attempt without token');
            socket.destroy();
            return;
        }

        const userId = await userService.verifyUserByClerkToken(token);

        wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
            (ws as RoomWebSocket).room = roomName;
            (ws as RoomWebSocket).token = token;
            (ws as RoomWebSocket).userId = userId;
            logger.info({ roomName, hasToken: !!token }, 'WebSocket upgrade successful');
            wss.emit('connection', ws, request);
        })
    })

    wss.on('connection', (socketInstance: RoomWebSocket, request) => {
        const roomName = socketInstance.room as string;
        socketInstance.on('message', async (data: any) => {
            try {
                const parsedData = Buffer.isBuffer(data) ? data.toString('utf8') : String(data);
                const jsonData = JSON.parse(parsedData);
                if (!jsonData?.event) {
                    socketInstance.send(JSON.stringify({
                        success: false,
                        message: 'Event type is required',
                        data: null,
                    }))
                    return;
                }
                switch (jsonData.event) {

                    case WebSocketEventType.JOIN_ROOM: {
                        // TODO: Validation
                        const userId = socketInstance.userId;
                        const response = await roomService.joinRoom(roomName, userId, socketInstance);
                        socketInstance.send(JSON.stringify({
                            ...response,
                            event: WebSocketEventType.JOIN_ROOM,
                        }))
                        break;
                    }

                    case WebSocketEventType.ADD_TO_QUEUE: {
                        // TODO: Validation
                        const userId = socketInstance.userId;
                        const track = jsonData?.data.track;
                        const response = await roomService.addSongToQueue(roomName, userId, track);
                        socketStore.broadcast(roomName, {
                            ...response,
                            event: WebSocketEventType.ADD_TO_QUEUE,
                        })
                        break;
                    }

                    case WebSocketEventType.PLAY_NEXT_IN_QUEUE: {
                        const userId = socketInstance.userId;
                        const response = await roomService.playNextInQueue(roomName, userId);
                        socketStore.broadcast(roomName, {
                            ...response,
                            event: WebSocketEventType.PLAY_NEXT_IN_QUEUE,
                        })
                        break;
                    }
                }
            } catch (error) {
                console.log(error);
            }
        })

        socketInstance.on('close', async () => {
            try {
                // await roomService.leaveRoom(roomName, socketInstance);
            } catch (error) {

            }
        })

        socketInstance.on('close', () => {
            socketStore.leaveRoom(roomName, socketInstance);

        })
    })

}