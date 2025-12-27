export enum WebSocketEventType {
    JOIN_ROOM = 'JOIN_ROOM',
    ADD_TO_QUEUE = 'ADD_TO_QUEUE',
    PLAY_NEXT_IN_QUEUE = 'PLAY_NEXT_IN_QUEUE',
    ADMIN_LEAVE = 'ADMIN_LEAVE',
    ADMIN_JOIN = 'ADMIN_JOIN',
}

export type RoomQueue = {
    id: string;
    title: string;
    thumbnail: string;
    artist: string;
    duration: string;
    platform: string;
    url?: string;
}

export type RoomState = {
    name: string;
    currentTrack: {
        url: string;
    },
    queue: RoomQueue[]
}