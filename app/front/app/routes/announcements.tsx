import { LoaderFunctionArgs, MetaFunction, ActionFunctionArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import NavBar from '~/components/NavBar';
import { H1 } from '~/components/ui/H1';
import { Button } from '~/components/ui/button';
import { requireSessionData } from '~/utils/session.server';
import { json } from '@remix-run/node';
import { useFetcher, useNavigate } from '@remix-run/react';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { FormErrorMessage } from '~/components/FormErrorMessage';
import { Textarea } from '~/components/ui/textarea';
import { validateForm } from '~/utils/validation';

export const meta: MetaFunction = () => {
    return [{ title: 'Latest Announcements' }, { name: 'description', content: 'What are we working on?' }];
};

const createAnnouncementSchema = z.object({
    title: z
        .string()
        .trim()
        .min(5, 'Title must be at least 5 characters long.')
        .max(50, 'Title must be at most 50 characters long.'),
    text: z
        .string()
        .min(10, 'Text must be at least 10 characters long.')
        .max(5000, 'Text must be at most 5000 characters long.'),
});

export async function loader({ request }: LoaderFunctionArgs) {
    await requireSessionData(request);

    const API_BASE_URL = process.env.API_BASE_URL;
    try {
        const response = await fetch(`${API_BASE_URL}/announcements/`);
        if (!response.ok) {
            throw new Error('Failed to fetch announcements');
        }
        const announcements = await response.json();
        return json({ announcements });
    } catch (error) {
        console.error('Error fetching announcements:', error);
        return json({ announcements: [], error: 'Failed to load announcements' });
    }
}

export async function action({ request }: ActionFunctionArgs) {
    await requireSessionData(request);

    const form = await request.formData();

    return validateForm(
        form,
        createAnnouncementSchema,
        (errors) => json({ errors }, 400),
        async (data) => {
            const res = await fetch(`${process.env.API_BASE_URL}/admin/announcements/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...data, created_at: new Date().toISOString() }),
            });
            if (!res.ok)
                return json(
                    {
                        errors: {
                            message: 'An internal server error occurred while creating the issue. Please try again.',
                        },
                    },
                    500,
                );

            const createdIssue: { id: number } = await res.json();
            return json({ id: createdIssue.id });
        },
    );
}

type LoaderData = {
    announcements: {
        id: number;
        title: string;
        text: string;
        created_at: string;
    }[];
    error?: string;
};

export default function Announcements() {
    const { announcements, error } = useLoaderData<LoaderData>();
    const createAnnouncementFetcher = useFetcher<{
        error?: { title?: string; text?: string };
    }>();
    const navigate = useNavigate();
    const [expandedStates, setExpandedStates] = useState<{ [key: number]: boolean }>({});
    const MAX_LENGTH = 100;

    const toggleReadMore = (id: number) => {
        setExpandedStates((prevState) => ({
            ...prevState,
            [id]: !prevState[id],
        }));
    };

    useEffect(() => {
        if (createAnnouncementFetcher.data?.id !== undefined) {
            localStorage.removeItem('create-announcement-title');
            localStorage.removeItem('create-announcement-text');
            navigate(`/announcements/`);
        }
    }, [createAnnouncementFetcher.data, navigate]);

    const [title, setTitle] = useState('');
    const [text, setText] = useState('');

    useEffect(() => {
        const savedTitle = localStorage.getItem('create-announcement-title');
        const savedText = localStorage.getItem('create-announcement-text');
        if (savedTitle) setTitle(savedTitle);
        if (savedText) setText(savedText);
    }, []);

    useEffect(() => {
        localStorage.setItem('create-announcement-title', title);
    }, [title]);

    useEffect(() => {
        localStorage.setItem('create-announcement-text', text);
    }, [text]);

    return (
        <div>
            <NavBar />
            <div className='mb-8 md:mb-16 md:mt-16'>
                <H1 className='text-center'>
                    <mark className='px-2 text-white bg-violet-600 rounded dark:bg-gray-500'>Announcements</mark>
                </H1>
            </div>
            {error && <p>Error loading announcements: {error}</p>}
            {announcements && announcements.length > 0 ? (
                <ul>
                    {announcements
                        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                        .map((announcement) => (
                            <div className='mx-auto w-2/3' key={announcement.id}>
                                <article className='pb-32 text-center'>
                                    <time dateTime={announcement.created_at}>
                                        {new Date(announcement.created_at).toLocaleDateString()}
                                    </time>
                                    <h2 className='pl-4 pb-4 text-3xl font-bold'>
                                        <strong>{announcement.title}</strong>
                                    </h2>
                                    <p>
                                        {expandedStates[announcement.id]
                                            ? announcement.text
                                            : `${announcement.text.substring(0, MAX_LENGTH)}...`}
                                    </p>
                                    {announcement.text.length > MAX_LENGTH && (
                                        <button
                                            onClick={() => toggleReadMore(announcement.id)}
                                            className='text-violet-500 hover:text-violet-500'
                                        >
                                            {expandedStates[announcement.id] ? 'Less' : 'More'}
                                        </button>
                                    )}
                                </article>
                            </div>
                        ))}
                </ul>
            ) : (
                <p>No announcements available.</p>
            )}
            <createAnnouncementFetcher.Form className='md:w-3/5' method='post'>
                <Label htmlFor='title'>Title</Label>
                <Input id='title' name='title' value={title} onChange={(e) => setTitle(e.target.value)} />
                {createAnnouncementFetcher.data?.error?.title && (
                    <FormErrorMessage>{createAnnouncementFetcher.data.error.title}</FormErrorMessage>
                )}
                <Label htmlFor='text'>Text</Label>
                <Textarea id='text' name='text' value={text} onChange={(e) => setText(e.target.value)} />
                {createAnnouncementFetcher.data?.error?.text && (
                    <FormErrorMessage>{createAnnouncementFetcher.data.error.text}</FormErrorMessage>
                )}
                <Button type='submit'>Create Announcement</Button>
            </createAnnouncementFetcher.Form>
        </div>
    );
}
