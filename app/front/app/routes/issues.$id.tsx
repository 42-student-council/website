import { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import NavBar from '~/components/NavBar';

export const loader = async ({ params }: LoaderFunctionArgs) => {
    const { id } = params;
    const API_BASE_URL = process.env.API_BASE_URL;

    if (!id) {
        throw new Error('Issue ID is required');
    }

    const response = await fetch(`${API_BASE_URL}/issues/view/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch issue');
    }

    const issue = await response.json();
    return json({ issue });
};

// Define the component
export default function IssueDetail() {
    const { issue } = useLoaderData();
    return (
        <div>
            <NavBar />
            <h1>{issue.title}</h1>
            <p>{issue.description}</p>
            <span>Upvotes: {issue.upvotes}</span>
            <br />
            <Link to='/issues'>Back to issues</Link>
        </div>
    );
}
