import { nanoid } from "nanoid";

const SCOPE = "public";

// TODO: check those env vars
const oauthUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${
	process.env.CLIENT_ID
}&redirect_uri=${encodeURIComponent(
	`${process.env.BASE_URL}/oauth/callback`,
)}&response_type=code&scope=${SCOPE}`;

export function generateOauthUrl(state: string) {
	return `${oauthUrl}&state=${state}`;
}

// TODO: plz better state handling
const stateStorage = new Map<
	string,
	{ redirectTo: string; timeout?: NodeJS.Timeout }
>();

export function createState(redirectTo: string): string {
	const state = nanoid();
	const data = {
		redirectTo,
		timeoutId: undefined as undefined | NodeJS.Timeout,
	};
	stateStorage.set(state, data);

	data.timeoutId = setTimeout(() => {
		stateStorage.delete(state);
	}, 600000); // 10 minutes

	return state;
}

export function checkState(state: string): string | null {
	const data = stateStorage.get(state);
	if (!data) return null;

	if (data.timeout) clearTimeout(data.timeout);

	stateStorage.delete(state);

	return data.redirectTo;
}

function encodeFormData(data: object) {
	return Object.keys(data)
		.map(
			(key) =>
				`${encodeURIComponent(key)}=${encodeURIComponent(
					data[key as keyof typeof data],
				)}`,
		)
		.join("&");
}

export async function getTokens(code: string): Promise<Tokens> {
	const formData = encodeFormData({
		grant_type: "authorization_code",
		client_id: process.env.CLIENT_ID,
		client_secret: process.env.CLIENT_SECRET,
		code,
		redirect_uri: `${process.env.BASE_URL}/oauth/callback`,
	});

	const response = await fetch("https://api.intra.42.fr/oauth/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: formData,
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return await response.json();
}

// TODO: Do we even need to refresh tokens?
// export async function refreshTokens(refreshToken: string): Promise<Tokens> {
// 	return await oauth
// 		.tokenRequest({
// 			refreshToken,
// 			grantType: "refresh_token",
// 			scope: SCOPE,
// 		})
// 		.then((res) => ({
// 			accessToken: res.access_token,
// 			refreshToken: res.refresh_token,
// 		}));
// }

// export async function getUser(accessToken: string) {
// 	return await oauth.getUser(accessToken);
// }

interface Tokens {
	access_token: string;
	refresh_token: string;
	token_type: "bearer";
	expires_in: number;
	scope: string;
	created_at: number;
	secret_valid_until: number;
}