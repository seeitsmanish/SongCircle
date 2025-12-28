import { MediaProviderTypes } from "./MediaProvider";

export type MediaMetadata = {
    trackId: string;
    title: string;
    artist: string;
    thumbnail: string;
    duration: number | null;
    platform: MediaProviderTypes;
    url?: string;
}