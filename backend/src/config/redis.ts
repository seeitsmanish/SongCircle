import Redis from "ioredis";
import { REDIS_URL } from "./serverConfig";
import { logger } from "../utils/logger";

const redis = new Redis(REDIS_URL as string);

redis.on('error', () => {
    logger.error('Connection to redis failed')
})

redis.on('connect', () => {
    logger.info('Connected to redis successfully')
    redis.flushdb();
})

export { redis };