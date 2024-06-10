import { LoaderFunctionArgs } from '@remix-run/node';
import NavBar from '~/components/NavBar';
import { requireSessionData } from '~/utils/session.server';

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
