import { YoutubeProvider } from "../../providers/YoutubeProvider";
import { MediaProvider } from "./MediaProvider";

const providers: MediaProvider[] = [new YoutubeProvider()];

export function getProvider(url: string): MediaProvider {
    const provider = providers.find((p) => p.validate(url));
    if (!provider) throw new Error('Unsupported URL!');
    return provider;
}