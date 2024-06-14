import { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import NavBar from '~/components/NavBar';
import { H1 } from '~/components/ui/H1';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { requireSessionData } from '~/utils/session.server';
import { json } from '@remix-run/node';

export const meta: MetaFunction = () => {
    return [{ title: 'Latest Annoucements' }, { name: 'description', content: 'What are we working on?' }];
};

export async function loader({ request }: LoaderFunctionArgs) {
    await requireSessionData(request);

    const API_BASE_URL = process.env.API_BASE_URL;
    try {
        const response = await fetch(`${API_BASE_URL}/announcements/`);
        if (!response.ok) {
            throw new Error('Failed to fetch annoucements');
        }
        const announcements = await response.json();
    } catch (error) {
        console.error('Error fetching announcements:', error);
        return json({ announcements: [], error: 'Failed to load announcements' });
    }
}

type LoaderData = {
    announcements: {
        id: number;
        text: string;
        created_at: string;
    }[];
    error?: string;
};

export default function Announcements() {
    const { announcements, error } = useLoaderData<LoaderData>();

    return (
        <div>
            <NavBar />
            <H1>Announcements</H1>
            {error && <p>Error loading announcements: {error}</p>}
            <ul>
                {announcements.map((announcement) => (
                    <li key={announcement.id}>
                        <article>
                            <p>{announcement.text}</p>
                            <time dateTime={announcement.created_at}>{announcement.created_at}</time>
                        </article>
                    </li>
                ))}
            </ul>
        </div>
    );
}
