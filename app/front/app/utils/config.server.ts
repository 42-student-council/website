export const config = {
	discord: {
		webhookId: requireEnv('DISCORD_WEBHOOK_ID'),
		webhookToken: requireEnv('DISCORD_WEBHOOK_TOKEN'),
	}
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
	throw new Error(`Missing environment variable ${name}`);
  }

  return value;
}
