import type { ActionFunction, LoaderFunction, MetaFunction } from '@remix-run/node';
import { destroySession } from '~/utils/session.server';

export const meta: MetaFunction = () => {
    return [
        { title: 'Student Council | Sign Out' },
        { name: 'description', content: '42 Vienna Student Council Sign Out!' },
    ];
};

export const action: ActionFunction = async ({ request }) => {
    const form = await request.formData();
    const redirectTo = form.get('redirectTo');

    return await destroySession(request, typeof redirectTo === 'string' ? redirectTo : '/');
};

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);

    return await destroySession(request, url.searchParams.get('redirectTo') ?? '/');
};
