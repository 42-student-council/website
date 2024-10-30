import { SessionData } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import classNames from 'classnames';
import { LoaderFunctionArgs } from 'react-router';
import { Fragment } from 'react/jsx-runtime';
import NavBar from '~/components/NavBar';
import { wrapper } from '~/lib/layout';
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
            <main className={classNames(wrapper, 'lg:py-6 xl:p-8 grow flex flex-col')}>
                <Outlet />
            </main>
        </Fragment>
    );
}
