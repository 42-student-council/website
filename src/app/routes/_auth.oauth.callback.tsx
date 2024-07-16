import { type LoaderFunction, redirect, MetaFunction } from '@remix-run/node';
import { checkState, createState, generateOauthUrl, getTokens } from '~/utils/oauth.server';
import { createSession } from '~/utils/session.server';

export const meta: MetaFunction = () => {
    return [{ title: 'OAuth2 Callback' }, { name: 'description', content: 'You should not be reading this.' }];
};

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
        const response = await fetch('https://api.intra.42.fr/v2/me', {
            headers: { authorization: `Bearer ${res.access_token}` },
        });

        if (!response.ok) {
            console.error(response.status, response.statusText);

            throw redirect('/sign-in?apiError');
        }
        const apiUser = await response.json();

        // TODO: no magic number
        const viennaCampus = apiUser?.campus_users?.find((campus: any) => campus.campus_id === 53);
        if (!viennaCampus?.is_primary) throw redirect('/sign-in?wrongCampus');

        if (!apiUser.cursus_users.some((cursus: any) => cursus.cursus_id === 21)) throw redirect('/sign-in?notStudent');

        return createSession(
            {
                login: apiUser.login,
                createdAt: new Date(),
                profilePicture: apiUser.image.versions.large,
            },
            redirectTo,
        );
    }

    const state = createState(redirectTo ?? '/');
    return redirect(generateOauthUrl(state));
};
