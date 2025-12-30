import { redis } from "../config/redis";
import { getProvider } from "../core/MediaProvider/ProviderFactory";
import { logger } from '../utils/logger';

export class MediaService {

    static async fetchMetaData(url: string) {
        try {
            const provider = getProvider(url);
            const id = provider.extractId(url);
            // Check for cache
            const cacheKey = `${provider.constructor.name}:${id}`;
            const cached = await redis.get(cacheKey);
            if (cached) {
                logger.info(`Cache Hit`);
                const cachedJson = JSON.parse(cached);
                return cachedJson;
            }
            const data = await provider.fetchMetaData(id);
            data.url = url;
            redis.set(cacheKey, JSON.stringify(data));
            return data;
        } catch (error) {
            logger.error(`Something went wrong in MediaService.fetchMetaData: ${error}`);
            throw error;
        }
    }
}