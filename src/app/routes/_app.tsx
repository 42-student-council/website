import { SessionData } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import { LoaderFunctionArgs } from 'react-router';
import { Fragment } from 'react/jsx-runtime';
import NavBar from '~/components/NavBar';
import { requireSessionData } from '~/utils/session.server';

export async function loader({ request }: LoaderFunctionArgs) {
    const session = await requireSessionData(request);
    return { session };
}

type LoaderData = {
    session: SessionData;
};

export default function Admin() {
    const data = useLoaderData<LoaderData>();

    return (
        <Fragment>
            <NavBar login={data.session.login} role={data.session.role} />
            <main className='p-4 mx-auto w-full max-w-screen-xl md:px-8'>
                <Outlet />
            </main>
        </Fragment>
    );
}
