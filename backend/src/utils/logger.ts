import pino from 'pino';
import { NODE_ENV, LOG_LEVEL } from '../config/serverConfig';

const isProd = NODE_ENV === 'production';

export const logger = pino({
    level: LOG_LEVEL || (isProd ? 'info' : 'debug'),
    transport: !isProd ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname'
        }
    } : undefined
});