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
    useLocation,
} from '@remix-run/react';
import { useEffect, useState } from 'react';
import stylesheet from '~/tailwind.css?url';
import { Footer } from './components/Footer';
import NavBar from './components/NavBar';
import { H1 } from './components/ui/H1';
import { requireSessionData, SessionData } from '~/utils/session.server';

const hideNavBarPaths = ['/sign-in', '/admin'];

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

export function Layout({ children, currentPath }: { children: React.ReactNode, currentPath: string }) {
    const data = useLoaderData<LoaderData>();
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const darkModePreference = localStorage.getItem('darkMode') === 'true';
        setIsDarkMode(darkModePreference);
        if (darkModePreference) {
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleDarkMode = () => {
        const newDarkModeState = !isDarkMode;
        setIsDarkMode(newDarkModeState);
        localStorage.setItem('darkMode', newDarkModeState.toString());
        if (newDarkModeState) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    return (
        <html lang='en'>
            <head>
                <meta charSet='utf-8' />
                <meta name='viewport' content='width=device-width, initial-scale=1' />
                <Meta />
                <Links />
            </head>
            <body className={isDarkMode ? 'dark' : ''}>
                {!hideNavBarPaths.includes(currentPath) && (
                    <NavBar login={data.session.login} role={data.session.role} toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
                )}
                <div className='min-h-screen'>{children}</div>
                <Footer />
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export default function App() {
    const location = useLocation();
    return <Layout currentPath={location.pathname}><Outlet /></Layout>;
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
