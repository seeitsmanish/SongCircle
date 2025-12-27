export const roomNameRegex = /^(?=.{3,30}$)[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/;
export interface Room {
  id: string;
  name: string;
  createdBy: string;
  currentTrack?: Track;
  queue: Track[];
}

export enum WebSocketEventType {
  JOIN_ROOM = 'JOIN_ROOM',
  ADD_TO_QUEUE = 'ADD_TO_QUEUE',
  PLAY_NEXT_IN_QUEUE = 'PLAY_NEXT_IN_QUEUE',
  ADMIN_LEAVE = 'ADMIN_LEAVE',
  ADMIN_JOIN = 'ADMIN_JOIN',
}

export type WebSocketMessageType = {
  success: boolean;
  message: string;
  data: Record<string, any>;
  event: WebSocketEventType;
}

export type Track = {
  id: string;
  title: string;
  thumbnail: string;
  artist: string;
  duration: string;
  platform: string;
  url: string;
}

export type RoomState = {
  name: string;
  currentTrack: Track | null;
  isAdmin: boolean;
  isAdminPresent: boolean;
  queue: Track[]
}