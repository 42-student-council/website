import { type Session, createCookieSessionStorage, redirect, createSessionStorage } from '@remix-run/node';
import { nanoid } from 'nanoid';

// const sessionSecret = process.env.SESSION_SECRET;
// if (!sessionSecret) {
//     throw new Error('SESSION_SECRET must be set');
// }

const storage = createCookieSessionStorage({
    cookie: {
        name: 'session',
        // normally you want this to be `secure: true`
        // but that doesn't work on localhost for Safari
        // https://web.dev/when-to-use-local-https/
        secure: process.env.NODE_ENV === 'production',
        // secrets: [sessionSecret],
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
    },
});

export async function createSession(data: Omit<SessionData, 'id'>, redirectTo: string) {
    const session = await storage.getSession();

    session.set('accessToken', data.accessToken);
    session.set('refreshToken', data.refreshToken);
    session.set('accessTokenExpiresAt', data.accessTokenExpiresAt);
    session.set('login', data.login);
    session.set('createdAt', data.createdAt);
    session.set('imageUrl', data.imageUrl);

    return redirect(redirectTo, {
        headers: {
            'Set-Cookie': await storage.commitSession(session),
        },
    });
}

export async function destroySession(request: Request, redirectTo = '/sign-in'): Promise<Response> {
    const session = await getSession(request);
    if (!session) return redirect(redirectTo);

    return redirect(redirectTo, {
        headers: {
            'Set-Cookie': await storage.destroySession(session),
        },
    });
}

export async function getSession(request: Request): Promise<Session<SessionData> | null> {
    const session = await storage.getSession(request.headers.get('Cookie'));
    if (!isSessionData(session?.data)) return null;

    return session;
}

export async function getUserLogin(request: Request): Promise<string | null> {
    const session = await getSession(request);
    const login = session?.get('login');
    if (typeof login !== 'string') {
        return null;
    }

    return login;
}

export async function requireUserLogin(
    request: Request,
    redirectTo: string = new URL(request.url).pathname,
): Promise<string> {
    const session = await getSession(request);
    const login = session?.get('login');
    if (typeof login !== 'string') {
        const searchParams = new URLSearchParams([['redirectTo', redirectTo]]);

        throw redirect(`/sign-in?${searchParams}`);
    }

    return login;
}

export async function getSessionData(request: Request): Promise<SessionData | null> {
    const session = await getSession(request);
    const data = session?.data;
    if (!isSessionData(data)) {
        return null;
    }

    return data;
}

export async function requireSessionData(
    request: Request,
    redirectTo: string = new URL(request.url).pathname,
): Promise<SessionData> {
    const session = await getSession(request);
    const data = session?.data;
    if (!isSessionData(data)) {
        const searchParams = new URLSearchParams([['redirectTo', redirectTo]]);

        throw redirect(`/sign-in?${searchParams}`);
    }

    return data;
}

export async function requireAdmin(request: Request): Promise<SessionData> {
    const session = await requireSessionData(request);

    if (session.login === process.env.SUPER_ADMIN) return session;

    const member = await fetch(`${process.env.API_BASE_URL}/council-members/${session.login}`);
    if (!member.ok) {
        throw new Response(null, { status: 401, statusText: 'Unauthorized' });
    }

    return session;
}

// biome-ignore lint/suspicious/noExplicitAny: -
function isSessionData(data: any): data is SessionData {
    return (
        // biome-ignore lint/complexity/useOptionalChain: -
        data && data.imageUrl && data.login && data.createdAt
    );
}

export interface SessionData {
    imageUrl: string;
    login: string;
    id: string;
    accessToken: string | null;
    refreshToken: string | null;
    accessTokenExpiresAt: Date | null;
    createdAt: Date;
}
