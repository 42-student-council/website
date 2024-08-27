export const config = {
    discord: {
        webhookId: requireEnv('DISCORD_WEBHOOK_ID'),
        webhookToken: requireEnv('DISCORD_WEBHOOK_TOKEN'),
    },
    api: {
        clientId: requireEnv('CLIENT_ID'),
        clientSecret: requireEnv('CLIENT_SECRET'),
        rateLimit: parseInt(requireEnv('RATE_LIMIT')),
    },
    // superAdmin: requireEnv('SUPER_ADMIN'),
};

function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing environment variable ${name}`);
    }

    return value;
}
