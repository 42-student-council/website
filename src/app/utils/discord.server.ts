import { API, RESTPostAPIWebhookWithTokenJSONBody, RESTPostAPIWebhookWithTokenQuery } from '@discordjs/core';
import { REST, RawFile } from '@discordjs/rest';

const rest = new REST({ version: '10' });
const api = new API(rest);

export type ExecuteWebhookData = RESTPostAPIWebhookWithTokenJSONBody &
    RESTPostAPIWebhookWithTokenQuery & {
        files?: RawFile[];
        wait: true;
    };

export async function sendDiscordWebhookWithUrl(url: string, data: ExecuteWebhookData) {
    if (!url.length) return;
    const [id, token] = url.split('/').slice(-2);
    return await api.webhooks.execute(id, token, data);
}
