import { LinksFunction, LoaderFunction } from '@remix-run/node';
import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    isRouteErrorResponse,
    useRouteError,
    useRouteLoaderData,
} from '@remix-run/react';
import { PreventFlashOnWrongTheme, Theme, ThemeProvider, useTheme } from 'remix-themes';
import stylesheet from '~/tailwind.css?url';
import { Footer } from './components/Footer';
import NavBar from './components/NavBar';
import { H1 } from './components/ui/H1';
import { themeSessionResolver } from './utils/theme.server';

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

type LoaderData = {
    theme: Theme | null;
};

export const loader: LoaderFunction = async ({ request }) => {
    const { getTheme } = await themeSessionResolver(request);
    return {
        theme: getTheme(),
    } satisfies LoaderData;
};

export function useRootLoaderData() {
    return useRouteLoaderData<LoaderData>('root');
}

export function Layout({ children }: { children: React.ReactNode }) {
    const data = useRootLoaderData();

    return (
        <ThemeProvider specifiedTheme={data?.theme ?? null} themeAction='/theme/set'>
            <InnerLayout ssrTheme={Boolean(data?.theme)}>{children}</InnerLayout>
        </ThemeProvider>
    );
}

export default function App() {
    return <Outlet />;
}

function InnerLayout({ ssrTheme, children }: { ssrTheme: boolean; children: React.ReactNode }) {
    const [theme] = useTheme();

    return (
        <html lang='en' data-theme={theme} className={theme ?? ''}>
            <head>
                <meta charSet='utf-8' />
                <meta name='viewport' content='width=device-width, initial-scale=1' />
                <Meta />
                <Links />
            </head>
            <body className='min-h-screen flex flex-col subpixel-antialiased'>
                {children}
                <ScrollRestoration />
                <PreventFlashOnWrongTheme ssrTheme={ssrTheme} />
                <Footer />
                <Scripts />
            </body>
        </html>
    );
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
            <body className='min-h-screen flex flex-col subpixel-antialiased'>
                <NavBar login='zekao?' role='USER' />
                <div className='flex items-center justify-center grow'>
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
