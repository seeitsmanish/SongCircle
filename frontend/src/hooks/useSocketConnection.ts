import { useEffect, useRef, useState } from "react"
import { WebSocketEventType } from '../types';
import { useAuth } from "@clerk/clerk-react";


export const useSocketConnection = (
    url: string,
) => {

    const [loading, setLoading] = useState(true);
    const socketRef = useRef<WebSocket | null>(null);
    const { isSignedIn, userId, } = useAuth();

    useEffect(() => {
        if (isSignedIn && !socketRef.current) {
            socketRef.current = new WebSocket(url);

            socketRef.current.onopen = () => {
                console.log('Socket connection created');
                setLoading(false);
            }

            socketRef.current.onmessage = (event) => {
                console.log('Message recieved', JSON.parse(event.data));
            }

            socketRef.current.onerror = (error) => {
                console.log('Error while registering socket', error);
            }
        }

        return () => {
            if (socketRef?.current) {
                socketRef.current.close();
            }
        }
    }, [isSignedIn])

    const isReadyState = (): Boolean => {
        return (
            socketRef?.current?.readyState === WebSocket.OPEN
        )
    }

    const joinRoom = () => {
        try {
            if (isReadyState()) {
                const joinRoomPayload = {
                    event: WebSocketEventType.JOIN_ROOM,
                    data: {
                        userId: userId,
                    }
                }
                socketRef.current?.send(JSON.stringify(joinRoomPayload));
            } else {

            }
        } catch (error) {
            console.log('Error Joining room');
            console.log(error);
        }
    }


    return {
        socketRef,
        loading,
        joinRoom,
    }

}