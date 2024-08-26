export const config = {
    baseUrl: requireEnv('BASE_URL'),
    discord: {
        webhookId: requireEnv('DISCORD_WEBHOOK_ID'),
        webhookToken: requireEnv('DISCORD_WEBHOOK_TOKEN'),
        councilServerIssueWebhookUrl: requireEnv('COUNCIL_SERVER_ISSUE_WEBHOOK_URL'),
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
