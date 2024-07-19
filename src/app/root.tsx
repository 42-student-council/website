import { LinksFunction, LoaderFunctionArgs } from '@remix-run/node';
import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    isRouteErrorResponse,
    useRouteError,
    useLoaderData,
} from '@remix-run/react';
import stylesheet from '~/tailwind.css?url';
import { Footer } from './components/Footer';
import NavBar from './components/NavBar';
import { H1 } from './components/ui/H1';
import { requireSessionData, SessionData } from '~/utils/session.server';

export const links: LinksFunction = () => {
    return [
        {
            rel: 'stylesheet',
            href: stylesheet,
        },
        {
            rel: 'icon',
            type: 'image/x-icon',
            href: '/favicon.ico',
        },
    ];
};

export async function loader({ request }: LoaderFunctionArgs) {
    const session = await requireSessionData(request);
    return { session };
}

type LoaderData = {
    session: SessionData;
};

export function Layout({ children }: { children: React.ReactNode }) {
    const data = useLoaderData<LoaderData>();

    return (
        <html lang='en'>
            <head>
                <meta charSet='utf-8' />
                <meta name='viewport' content='width=device-width, initial-scale=1' />
                <Meta />
                <Links />
            </head>
            <body>
                <NavBar login={data.session.login} role={data.session.role} />
                <div className='min-h-screen'>{children}</div>
                <Footer />
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export default function App() {
    return <Outlet />;
}

export function ErrorBoundary() {
    const error = useRouteError();

    return (
        <html>
            <head>
                <title>Oops!</title>
                <Meta />
                <Links />
            </head>
            <body>
                <div className='flex items-center justify-center h-screen'>
                    {isRouteErrorResponse(error) ? (
                        <div className='flex flex-col items-center'>
                            <H1>{error.status}</H1>
                            <p className='text-xl'>{error.statusText}</p>
                        </div>
                    ) : (
                        'Unknown Error'
                    )}
                </div>
                <Scripts />
            </body>
        </html>
    );
}
