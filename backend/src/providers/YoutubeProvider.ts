import { GOOGLE_YT_ENDPOINT, SONGCIRCLE_YT_API_KEY, YOUTUBE_URL_REGEX } from '../config/mediaProviderConfig';
import { MediaProvider } from '../core/MediaProvider/MediaProvider';
import { MediaMetadata } from "../core/MediaProvider/types";
import { logger } from '../utils/logger';

export class YoutubeProvider implements MediaProvider {

    validate(url: string): boolean {
        const ytRegex = new RegExp(YOUTUBE_URL_REGEX);
        return ytRegex.test(url);
    }

    extractId(url: string): string {

        const match = url.match(new RegExp(YOUTUBE_URL_REGEX));
        const id = match?.[1] || match?.[2];
        if (!id) throw new Error('No Video Found for this url!');
        return id;
    }

    async fetchMetaData(id: string): Promise<MediaMetadata> {
        try {
            const params = {
                id,
                part: ['snippet', 'contentDetails'].join(','),
                key: SONGCIRCLE_YT_API_KEY
            }
            const url = new URL(GOOGLE_YT_ENDPOINT);
            url.search = new URLSearchParams(params).toString();
            const res = await fetch(url);
            const response = await res.json();

            if (!response.items || response.items.length === 0) {
                throw new Error(`No video found!`);
            }
            const snippet = response.items[0].snippet;
            const details = response.items[0].contentDetails;

            return {
                trackId: id,
                title: snippet?.title,
                artist: snippet?.channelTitle,
                thumbnail: snippet?.thumbnails?.medium?.url,
                duration: this.parseDuration(details.duration),
                platform: 'youtube',
            }

        } catch (error) {
            logger.error(`Something went wrong in YoutubeProvider.fetchMetaData: ${error}`);
            throw new Error('Something is off! Please retry in sometime');
        }
    }

    private parseDuration(ISO: string): number {
        const match = ISO.match(/PT(\d+M)?(\d+S)?/);
        const minutes = match?.[1] ? parseInt(match[1]) : 0;
        const seconds = match?.[2] ? parseInt(match[2]) : 0;
        return minutes * 60 + seconds;
    }

}