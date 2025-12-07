import dotenv from 'dotenv';

dotenv.config();

// Youtube related keys
export const YOUTUBE_URL_REGEX = process.env.YOUTUBE_URL_REGEX as string;
export const GOOGLE_YT_ENDPOINT = process.env.GOOGLE_YT_ENDPOINT as string;
export const SONGCIRCLE_YT_API_KEY = process.env.SONGCIRCLE_YT_API_KEY as string;