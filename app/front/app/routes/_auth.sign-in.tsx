import type { LoaderFunction, MetaFunction } from '@remix-run/node';
import { Link, useLoaderData, useSearchParams } from '@remix-run/react';
import { AlertCircle, Info } from 'lucide-react';
import { FTIcon } from '~/components/icon/42';
import { H1 } from '~/components/ui/H1';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';

export const meta: MetaFunction = () => {
    return [
        { title: 'Student Council | Sign In' },
        { name: 'description', content: '42 Vienna Student Council Sign In!' },
    ];
};

type LoaderData = {
    oauthFailed: boolean;
    oauthDenied: boolean;
    wrongCampus: boolean;
};

export const loader: LoaderFunction = ({ request }) => {
    const url = new URL(request.url);

    return {
        oauthFailed: typeof url.searchParams.get('oauthFailed') === 'string',
        oauthDenied: typeof url.searchParams.get('oauthDenied') === 'string',
        wrongCampus: typeof url.searchParams.get('wrongCampus') === 'string',
    } satisfies LoaderData;
};

export default function Index() {
    const data = useLoaderData<LoaderData>();
    const [searchParams] = useSearchParams();

    return (
        <div className='self-center flex flex-col justify-center items-center h-screen mx-8'>
            <H1 className='inline-block'>Student Council</H1>
            <p className='mt-4 text-center'>
                In order to provide a secure and private platform, we only allow students of 42 Vienna to access our
                portal.
            </p>
            <Alert variant='info' className='mt-4 w-auto'>
                <Info className='h-4 w-4 text-red-600' />
                <AlertTitle>Info</AlertTitle>
                <AlertDescription>
                    Your data is only used for logging in. <br />
                    Posting, Commenting and Voting is <span className='font-bold'>completely anonymous</span>!
                </AlertDescription>
            </Alert>
            <div className='w-80 mt-4 flex flex-col justify-center items-center space-y-4'>
                {data.oauthFailed && (
                    <Alert variant='destructive'>
                        <AlertCircle className='h-4 w-4' />
                        <AlertTitle>OAuth Sign-In Failed</AlertTitle>
                        <AlertDescription>
                            We were unable to complete your sign-in request. Please try again in a few minutes. If the
                            issue persists please contact us on Discord.
                        </AlertDescription>
                    </Alert>
                )}
                {data.oauthDenied && (
                    <Alert variant='destructive'>
                        <AlertCircle className='h-4 w-4' />
                        <AlertTitle>OAuth Sign-In Denied</AlertTitle>
                        <AlertDescription>
                            You denied us the access to the public data of your 42 account.
                        </AlertDescription>
                    </Alert>
                )}
                {data.wrongCampus && (
                    <Alert variant='destructive'>
                        <AlertCircle className='h-4 w-4' />
                        <AlertTitle>Wrong Campus</AlertTitle>
                        <AlertDescription>
                            The <span className='font-bold'>42 Vienna Student Council Website</span> is only accessible
                            to <span className='font-bold'>42 Vienna Students</span>. We don't allow anyone else to
                            access our platform.
                        </AlertDescription>
                    </Alert>
                )}

                <Link to={`/oauth/callback?${searchParams}`} className='w-full'>
                    <Button className='w-full'>
                        Sign In With <FTIcon className='ml-2 size-6' />
                    </Button>
                </Link>
            </div>
        </div>
    );
}
