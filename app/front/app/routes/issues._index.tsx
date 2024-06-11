import { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import NavBar from '~/components/NavBar';
import { requireSessionData } from '~/utils/session.server';

export const meta: MetaFunction = () => {
    return [
        { title: 'Student Council | Issues' },
        { name: 'description', content: 'All the open issues and discussions. 100% anonym!' },
    ];
};

export async function loader({ request }: LoaderFunctionArgs) {
    return await requireSessionData(request);
}

export default function Issues() {
    return (
        <div>
            <NavBar />
            ISSUES
        </div>
    );
}
