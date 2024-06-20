import { LoaderFunctionArgs } from '@remix-run/node';
import NavBar from '~/components/NavBar';
import React, { useState, useEffect, useRef } from 'react';
import { json } from '@remix-run/node';
import { requireSessionData } from '~/utils/session.server';
import { useLoaderData, Link, useFetcher } from '@remix-run/react';

export async function loader({ params }: LoaderFunctionArgs) {
    try {
        const { id } = params;
        console.log('Fetching data for announcement ID:', id);
        const API_BASE_URL = process.env.API_BASE_URL;

        if (!id) {
            throw new Error('announcement ID is required');
        }

        const [announcementResponse, commentsResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/announcements/${id}/`),
            fetch(`${API_BASE_URL}/comments/announcement/${id}/`),
        ]);
        if (!announcementResponse.ok) {
            throw new Error('Failed to fetch announcement');
        }
        if (!commentsResponse.ok) {
            throw new Error('Failed to fetch comments');
        }

        const announcement = await announcementResponse.json();
        const commentsData = await commentsResponse.json();

        const comments = commentsData.map((comment) => ({
            id: comment.pk,
            ...comment.fields,
        }));

        return json({ announcement, comments });
    } catch (error) {
        console.error(error);
        throw new Error('Error loading data');
    }
}

export const action = async ({ request, params }: LoaderFunctionArgs) => {
    try {
        const session = await requireSessionData(request);

        const user = session.login;
        const form = await request.formData();
        const text = form.get('comment_text');
        const { id } = params;
        const API_BASE_URL = process.env.API_BASE_URL;

        if (text) {
            const requestBody = {
                text: text,
                user: {
                    user: user,
                },
            };
            const response = await fetch(`${API_BASE_URL}/comments/announcement/${id}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error('Failed to post comment');
            }

            const result = await response.json();
            return json(result);
        }
    } catch (error) {
        console.error(error);
        return json({ message: error.message || 'An unexpected error occurred' }, { status: 500 });
    }
};

export default function AnnouncementDetail() {
    const { announcement, comments } = useLoaderData();
    const fetcher = useFetcher();
    const [popupMessage, setPopupMessage] = useState(null);
    const formRef = useRef(null);

    useEffect(() => {
        if (fetcher.state === 'idle' && fetcher.data && !fetcher.data.message) {
            formRef.current?.reset();
        }
        if (fetcher.state === 'idle' && fetcher.data && fetcher.data.message) {
            setPopupMessage(fetcher.data.message);
        }
    }, [fetcher.state, fetcher.data]);

    useEffect(() => {
        console.log('Announcement:', announcement);
        console.log('Comments:', comments);
    }, [announcement, comments]);

    if (!announcement) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <NavBar />
            <div className='md:flex md:justify-center'>
                <div className='md:w-4/5 p-4'>
                    <Link
                        to='/announcements'
                        className='inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 mb-4'
                    >
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-6 w-6'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                        >
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 19l-7-7 7-7' />
                        </svg>
                    </Link>
                    <div className='flex justify-between items-center'>
                        <h1 className='mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white pt-4 pb-4'>
                            Announcement #{announcement.id}:{' '}
                            <mark
                                className='px-2 text-white bg-violet-600 rounded dark:bg-gray-500'
                                style={{ lineHeight: '1.5em' }}
                            >
                                {announcement.title}
                            </mark>
                        </h1>
                    </div>
                    <p className='text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400 pb-4'>
                        {announcement.description}
                    </p>
                    <div className='mt-8'>
                        <h2 className='text-2xl font-bold'>Comments</h2>
                        {comments.length > 0 ? (
                            <ul>
                                {comments.map((comment) => (
                                    <li key={comment.id} className='mt-4'>
                                        <p className='text-sm text-gray-600'>{comment.text}</p>
                                        <p className='text-xs text-gray-400'>
                                            On {new Date(comment.created_at).toLocaleDateString()}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No comments yet.</p>
                        )}
                        <fetcher.Form
                            method='post'
                            action={`/announcements/${announcement.id}/`}
                            className='mt-4'
                            ref={formRef}
                        >
                            <textarea
                                name='comment_text'
                                rows='3'
                                className='w-full px-3 py-2 text-sm text-gray-700 border rounded-lg focus:outline-none'
                                placeholder='Add a comment...'
                            ></textarea>
                            <button
                                type='submit'
                                className='mt-2 px-4 py-2 text-sm font-medium text-white bg-violet-500 rounded hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500'
                            >
                                Submit
                            </button>
                        </fetcher.Form>
                    </div>
                </div>
            </div>
            {popupMessage && (
                <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
                    <div className='bg-white p-6 rounded shadow-lg'>
                        <p>{popupMessage}</p>
                        <button
                            onClick={() => setPopupMessage(null)}
                            className='mt-4 px-4 py-2 text-sm font-medium text-white bg-violet-500 rounded hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500'
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
