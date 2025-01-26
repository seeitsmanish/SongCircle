export interface Room {
  id: string;
  name: string;
  createdBy: string;
  currentTrack?: Track;
  queue: Track[];
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  thumbnail: string;
  url: string;
}