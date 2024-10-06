import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import NavBar from '~/components/NavBar';
import { Button } from '~/components/ui/button';
import { requireSessionData, SessionData } from '~/utils/session.server';

export const meta: MetaFunction = () => {
    return [
        { title: 'Student Council' },
        { name: 'description', content: 'Welcome to the website of the 42 Vienna Student Council.' },
    ];
};

export async function loader({ request }: LoaderFunctionArgs) {
    const session = await requireSessionData(request);
    return { session };
}

type LoaderData = {
    session: SessionData;
};

export default function Index() {
    const data = useLoaderData<LoaderData>();

    return (
        <div className='flex flex-col h-[calc(100vh-115px)]'>
            <NavBar login={data.session.login} role={data.session.role} />

            <div className='flex flex-col items-center justify-center flex-1'>
                <div className='flex flex-col items-center mb-4 text-7xl md:text-8xl font-bold text-center'>
                    <p>STUDENT</p>
                    <p>COUNCIL</p>
                </div>
                <p className='text-2xl text-center mb-4'>Official Website of the 42 Vienna Student Council</p>
                <Link to='/issues'>
                    <Button size='lg'>What's up?</Button>
                </Link>
            </div>
        </div>
    );
}
