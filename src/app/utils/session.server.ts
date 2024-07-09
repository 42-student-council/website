import { type Session, createSessionStorage, redirect } from '@remix-run/node';
import { db } from './db.server';
import { nanoid } from 'nanoid';
import { UserRole } from '@prisma/client';

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
    throw new Error('SESSION_SECRET must be set');
}

const storage = createSessionStorage<SessionData, SessionData>({
    cookie: {
        name: 'session',
        secure: process.env.NODE_ENV === 'production',
        secrets: [sessionSecret],
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
    },
    createData: async (data: Partial<SessionData>, expires?: Date | undefined): Promise<string> => {
        if (!data.login) throw new Error('Session data is invalid');

        await db.user.upsert({
            where: { id: data.login },
            create: {
                id: data.login,
            },
            update: {},
        });

        const id = nanoid(30);

        await db.session.create({
            data: {
                id,
                userId: data.login,
            },
        });

        return id;
    },
    readData: async (id: string): Promise<SessionData | null> => {
        const data = await db.session.findFirst({
            where: { id },
            select: {
                createdAt: true,
                user: true,
            },
        });

        if (!data) return null;

        return {
            role: data.user.role,
            login: data.user.id,
            sessionId: id,
            createdAt: data.createdAt,
        } satisfies SessionData;
    },
    updateData: async (id: string, data: {}, expires?: Date | undefined): Promise<void> => {
        if (expires && expires < new Date()) {
            await db.session.delete({ where: { id } });
            return;
        }

        await db.session.update({
            where: { id },
            data: data,
        });
    },
    deleteData: async (id: string): Promise<void> => {
        await db.session.delete({ where: { id } });
    },
});

export async function createSession(data: Omit<SessionData, 'sessionId' | 'role'>, redirectTo: string) {
    const session = await storage.getSession();

    session.set('login', data.login);
    session.set('createdAt', data.createdAt);

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

// Don't use session.role since that one can be unreliable, until we change how we handle sessions.
export async function requireAdmin(request: Request): Promise<SessionData> {
    const session = await requireSessionData(request);

    if (session.login === process.env.SUPER_ADMIN) return session;

    if (session.role !== UserRole.ADMIN) {
        throw new Response(null, { status: 401, statusText: 'Unauthorized' });
    }

    return session;
}

// biome-ignore lint/suspicious/noExplicitAny: -
function isSessionData(data: any): data is SessionData {
    return (
        // biome-ignore lint/complexity/useOptionalChain: -
        data && data.login && data.createdAt && data.role && data.sessionId
    );
}

export interface SessionData {
    login: string;
    sessionId: string;
    createdAt: Date;
    role: UserRole;
}
