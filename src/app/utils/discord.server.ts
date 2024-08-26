import { REST, RawFile } from '@discordjs/rest';
import { API, RESTPostAPIWebhookWithTokenJSONBody, RESTPostAPIWebhookWithTokenQuery } from '@discordjs/core';
import { config } from './config.server';

const rest = new REST({ version: '10' });
const api = new API(rest);

export type ExecuteWebhookData = RESTPostAPIWebhookWithTokenJSONBody &
    RESTPostAPIWebhookWithTokenQuery & {
        files?: RawFile[];
        wait: true;
    };

export async function sendDiscordWebhook(data: ExecuteWebhookData) {
    await api.webhooks.execute(config.discord.webhookId, config.discord.webhookToken, data);
}

export async function sendDiscordWebhookWithUrl(url: string, data: ExecuteWebhookData) {
    const [id, token] = url.split('/').slice(-2);
    return await api.webhooks.execute(id, token, data);
}
