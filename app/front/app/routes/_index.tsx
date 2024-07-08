import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import NavBar from '~/components/NavBar';
import { H2 } from '~/components/ui/H2';
import { H3 } from '~/components/ui/H3';
import { Button } from '~/components/ui/button';
import { Link, useLoaderData } from '@remix-run/react';
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
        <div>
            <NavBar login={data.session.login} role={data.session.role} />

            <div className='flex flex-col items-center mt-32'>
                <div className='flex flex-col items-center mb-4 text-7xl md:text-8xl font-bold'>
                    <p>STUDENT</p>
                    <p>COUNCIL</p>
                </div>
                <p className='text-2xl text-center text-slate-600 mb-4'>
                    Official Website of the 42 Vienna Student Council
                </p>
                <Link to='/issues/new'>
                    <Button>Have a problem?</Button>
                </Link>
            </div>
        </div>
    );
}
