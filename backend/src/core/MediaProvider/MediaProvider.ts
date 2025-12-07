import { MediaMetadata } from './types';

export type MediaProviderTypes = 'youtube';

export interface MediaProvider {
    validate(url: string): boolean;
    extractId(url: string): string;
    fetchMetaData(id: string): Promise<MediaMetadata>;
}