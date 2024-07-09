import type { LoaderFunction, MetaFunction } from '@remix-run/node';
import { Link, useLoaderData, useSearchParams } from '@remix-run/react';
import { Warning } from '~/components/alert/Warning';
import { FTIcon } from '~/components/icon/42';
import { H1 } from '~/components/ui/H1';
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
    notStudent: boolean;
};

export const loader: LoaderFunction = ({ request }) => {
    const url = new URL(request.url);

    return {
        oauthFailed: typeof url.searchParams.get('oauthFailed') === 'string',
        oauthDenied: typeof url.searchParams.get('oauthDenied') === 'string',
        wrongCampus: typeof url.searchParams.get('wrongCampus') === 'string',
        notStudent: typeof url.searchParams.get('notStudent') === 'string',
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
            <div className='w-80 mt-4 flex flex-col justify-center items-center space-y-4'>
                {data.oauthFailed && (
                    <Warning title='OAuth Sign-In Failed'>
                        We were unable to complete your sign-in request. Please try again in a few minutes. If the issue
                        persists please open an issue in our{' '}
                        <Link
                            to='https://github.com/42-student-council/website/issues'
                            target='_blank'
                            className='underline'
                        >
                            GitHub Repository
                        </Link>
                        .
                    </Warning>
                )}
                {data.oauthDenied && (
                    <Warning title='OAuth Sign-In Denied'>
                        You denied us the access to the public data of your 42 account.
                    </Warning>
                )}
                {data.wrongCampus && (
                    <Warning title='Wrong Campus'>
                        The <span className='font-bold'>42 Vienna Student Council Website</span> is only accessible to{' '}
                        <span className='font-bold'>42 Vienna Students</span>. We don't allow anyone else to access our
                        platform.
                    </Warning>
                )}
                {data.notStudent && (
                    <Warning title='Not a Student'>
                        The <span className='font-bold'>42 Vienna Student Council Website</span> is only accessible to{' '}
                        <span className='font-bold'>42 Vienna Students</span>. We don't allow anyone else to access our
                        platform.
                    </Warning>
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
