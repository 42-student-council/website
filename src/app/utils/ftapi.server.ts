import Bottleneck from 'bottleneck';
import { config } from './config.server';

const limiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: 1000 / config.api.rateLimit,
});

export async function fetch42(url: string, options: RequestInit) {
    return limiter.schedule(() => fetch(url, options));
}
