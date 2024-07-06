import { LinksFunction } from '@remix-run/node';
import {
    Link,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    isRouteErrorResponse,
    useRouteError,
} from '@remix-run/react';
import stylesheet from '~/tailwind.css?url';
import { Footer } from './components/Footer';
import NavBar from './components/NavBar';
import { H1 } from './components/ui/H1';

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

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang='en'>
            <head>
                <meta charSet='utf-8' />
                <meta name='viewport' content='width=device-width, initial-scale=1' />
                <Meta />
                <Links />
            </head>
            <body className='min-h-screen'>
           
                {children}

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
                <NavBar />
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
