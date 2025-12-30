import { useEffect, useRef, useState } from "react"
import { RoomState, Track, WebSocketEventType, WebSocketMessageType } from '../types';
import { useAuth } from "@clerk/clerk-react";
import useSnackbar from "./useSnackbar";
import { v4 as uuidv4 } from 'uuid';



export const useSocketConnection = (
    url: string,
    name: string
) => {

    const [loading, setLoading] = useState(true);
    const socketRef = useRef<WebSocket | null>(null);
    const { isSignedIn, userId, getToken } = useAuth();
    const [videoUrl, setVideoUrl] = useState('');
    const [currentRoom, setCurrentRoom] = useState<RoomState>({
        name: name,
        currentTrack: null,
        isAdmin: false,
        isAdminPresent: false,
        queue: [],
    })
    const { showSuccess, showError } = useSnackbar();
    const [retryModalState, setRetryModalState] = useState<{
        show: boolean,
        loading: boolean,
    }>({
        show: false,
        loading: false,
    });

    useEffect(() => {
        setUpWebSocket();
        return () => {
            if (socketRef?.current) {
                socketRef.current.close();
            }
        }
    }, [isSignedIn])

    async function setUpWebSocket() {
        const token = await getToken();
        if (isSignedIn && !socketRef.current) {
            socketRef.current = new WebSocket(`${url}?token=${token}`);
            socketRef.current.onopen = () => {
                console.log('Socket connection created');
                setLoading(false);
            }

            socketRef.current.onmessage = (event) => {
                console.log('Message recieved', JSON.parse(event.data));
                const eventData = JSON.parse(event.data);
                handleMessageEvents(eventData);
            }

            socketRef.current.onerror = (error) => {
                console.log('Error while registering socket', error);
                setRetryModalState({
                    show: true,
                    loading: false,
                })
            }

            socketRef.current.onclose = () => {
                console.log('Socket connection closed');
                setRetryModalState({
                    show: true,
                    loading: false,
                })
            }

        }

    }

    const handleRetryConnection = async () => {
        window.location.reload();
    }

    const closeRetryModal = () => {
        setRetryModalState({
            loading: false,
            show: false,
        })
    }

    const handleMessageEvents = (event: WebSocketMessageType) => {
        if (!event.success) {
            showError(event.message);
            return;
        }
        setCurrentRoom((prev) => ({
            ...prev,
            ...event.data,
        }))

        switch (event.event) {
            case WebSocketEventType.JOIN_ROOM: {
                showSuccess(event.message);
                break;
            }

            case WebSocketEventType.ADD_TO_QUEUE: {
                showSuccess(event.message);
                break;
            }

            case WebSocketEventType.PLAY_NEXT_IN_QUEUE: {
                showSuccess(event.message);
                break;
            }

            case WebSocketEventType.ADMIN_LEAVE: {
                showSuccess(event.message);
                break;
            }

            default:
                showSuccess(event.message);
        }
    }

    const isReadyState = (): Boolean => {
        return (
            socketRef?.current?.readyState === WebSocket.OPEN
        )
    }

    function joinRoom() {
        try {
            if (isReadyState()) {
                const joinRoomPayload = {
                    event: WebSocketEventType.JOIN_ROOM,
                    data: {},
                }
                socketRef.current?.send(JSON.stringify(joinRoomPayload));
            }
        } catch (error) {
            showError('Error Joining room');
        }
    }

    const addToQueue = (track: Track) => {
        try {
            if (isReadyState()) {
                const payload = {
                    event: WebSocketEventType.ADD_TO_QUEUE,
                    data: {
                        track: {
                            ...track,
                            id: uuidv4(),
                        },
                    }
                }
                socketRef?.current?.send(JSON.stringify(payload));
            }
        } catch (error) {
            showError('Error Adding Song to Queue!')
        }
    }

    const playNextInQueue = () => {
        try {
            if (isReadyState()) {
                const payload = {
                    event: WebSocketEventType.PLAY_NEXT_IN_QUEUE,
                    data: {}
                }
                socketRef?.current?.send(JSON.stringify(payload));
            }
        } catch (error) {
            showError('Error Playing Next Song in Queue!')
        }
    }

    return {
        videoUrl,
        setVideoUrl,
        loading,
        currentRoom,
        setCurrentRoom,
        socketRef,
        joinRoom,
        addToQueue,
        playNextInQueue,
        retryModalState,
        closeRetryModal,
        handleRetryConnection,
    }

}