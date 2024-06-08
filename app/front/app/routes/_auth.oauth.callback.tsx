import { type LoaderFunction, redirect } from '@remix-run/node';
import { checkState, createState, generateOauthUrl, getTokens } from '~/utils/oauth.server';
import { createSession } from '~/utils/session.server';

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const redirectTo = url.searchParams.get('redirectTo');

    if (url.searchParams.get('error') === 'access_denied') throw redirect('/sign-in?oauthDenied');

    if (code) {
        const state = url.searchParams.get('state');
        if (!state) throw redirect('/sign-in?oauthFailed');

        const redirectTo = checkState(state);
        if (!redirectTo) throw redirect('/sign-in?oauthFailed');

        const res = await getTokens(code);
        // curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" https://api.intra.42.fr/v2/me
        // TODO: rate limits and all of htat
        const apiUser = await fetch('https://api.intra.42.fr/v2/me', {
            headers: { authorization: `Bearer ${res.access_token}` },
        }).then((res) => res.json());

        return createSession(
            {
                imageUrl: apiUser.image.versions.large,
                login: apiUser.login,
                accessToken: res.access_token,
                refreshToken: res.refresh_token,
                accessTokenExpiresAt: new Date((res.created_at + res.expires_in) * 1000),
                createdAt: new Date(),
            },
            redirectTo,
        );
    }

    const state = createState(redirectTo ?? '/');
    return redirect(generateOauthUrl(state));
};
