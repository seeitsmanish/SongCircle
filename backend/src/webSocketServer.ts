import { IncomingMessage, Server } from "http";
import WebSocket, { WebSocketServer } from "ws";
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
        socketInstance.on('open', () => {
            const { room } = socketInstance;
            console.log(room);
        })
    })

}