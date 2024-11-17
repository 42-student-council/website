import { SessionData } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import classNames from 'classnames';
import { LoaderFunctionArgs } from 'react-router';
import { Fragment } from 'react/jsx-runtime';
import { Footer } from '~/components/Footer';
import NavBar from '~/components/NavBar';
import { wrapper } from '~/lib/layout';
import { requireSessionData } from '~/utils/session.server';

export async function loader({ request }: LoaderFunctionArgs) {
    const session = await requireSessionData(request);
    const commit = process.env.GIT_COMMIT || '';
    return { session, commit } satisfies LoaderData;
}

export type LoaderData = {
    session: SessionData;
    commit: string;
};

export default function Admin() {
    const data = useLoaderData<LoaderData>();

    return (
        <Fragment>
            <NavBar login={data.session.login} role={data.session.role} />
            <main className={classNames(wrapper, 'grow flex flex-col')}>
                <Outlet />
            </main>
            <Footer />
        </Fragment>
    );
}
