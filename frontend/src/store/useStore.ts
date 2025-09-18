import { create } from 'zustand';
import { Room, Track } from '../types';

interface Store {
  rooms: Room[];
  currentRoom: Room | null;
  createRoom: (name: string, userId: string) => void;
  joinRoom: (roomId: string) => void;
  addToQueue: (roomId: string, track: Track) => void;
}

export const useStore = create<Store>((set) => ({
  rooms: [],
  currentRoom: null,
  createRoom: (name, userId) => {
    const newRoom: Room = {
      id: Math.random().toString(36).substring(7),
      name,
      createdBy: userId,
      queue: [],
    };
    set((state) => ({
      rooms: [...state.rooms, newRoom],
    }));
    return newRoom;
  },
  joinRoom: (roomId) => {
    set((state) => ({
      currentRoom: state.rooms.find((room) => room.id === roomId) || null,
    }));
  },
  addToQueue: (roomId, track) => {
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === roomId
          ? { ...room, queue: [...room.queue, track] }
          : room
      ),
    }));
  },
}));