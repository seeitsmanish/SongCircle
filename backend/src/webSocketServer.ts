import { IncomingMessage, Server } from "http";
import WebSocket, { WebSocketServer } from "ws";
import { WebSocketEventType } from "./types";
import roomService from "./services/roomService";
interface RoomWebSocket extends WebSocket {
    room?: string;
}
export const setUpWebSocketServer = (httpServer: Server) => {

    const wss = new WebSocketServer({ noServer: true });

    httpServer.on('upgrade', (request, socket, head) => {

        const { url } = request;
        const match = url?.match(/^\/ws\/room\/(.+)$/);
        if (match) {
            const roomName = match[1];
            wss.handleUpgrade(request, socket, head, (ws: RoomWebSocket) => {
                ws.room = roomName;
                wss.emit('connection', ws, request);
            })
        } else {
            socket.destroy();
        }
    })

    wss.on('connection', (socketInstance: RoomWebSocket, request) => {

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
                const roomName = socketInstance.room as string;
                switch (jsonData.event) {

                    case WebSocketEventType.JOIN_ROOM: {
                        // TODO: Validation
                        const userId = jsonData?.data?.userId;
                        const response = await roomService.joinRoom(roomName, userId);
                        socketInstance.send(JSON.stringify({
                            ...response,
                            event: WebSocketEventType.JOIN_ROOM,
                        }))
                        break;
                    }

                    case WebSocketEventType.ADD_TO_QUEUE: {
                        // TODO: Validation
                        const userId = jsonData?.data?.userId;
                        const url = jsonData?.data.url;
                        const response = await roomService.addSongToQueue(roomName, userId, url);
                        socketInstance.send(JSON.stringify({
                            ...response,
                            event: WebSocketEventType.ADD_TO_QUEUE,
                        }))
                    }
                }
            } catch (error) {
                console.log(error);
            }
        })
    })

}