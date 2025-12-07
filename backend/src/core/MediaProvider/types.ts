import { MediaProviderTypes } from "./MediaProvider";

export type MediaMetadata = {
    id: string;
    title: string;
    artist: string;
    thumbnail: string;
    duration: number | null;
    platform: MediaProviderTypes;
    url?: string;
}