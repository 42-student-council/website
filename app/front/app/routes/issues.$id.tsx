import { LoaderFunctionArgs } from '@remix-run/node';
import NavBar from '~/components/NavBar';
import { requireSessionData } from '~/utils/session.server';
import React from 'react';
import { json } from '@remix-run/node';
import { useLoaderData, Link, useFetcher, Form } from '@remix-run/react';
import { Button } from '~/components/ui/button';

export const loader = async ({ params }: LoaderFunctionArgs) => {
    const { id } = params;
    const API_BASE_URL = process.env.API_BASE_URL;

    if (!id) {
        throw new Error('Issue ID is required');
    }

    const [issueResponse, commentsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/issues/${id}`),
        fetch(`${API_BASE_URL}/issues/${id}/comments`),
    ]);

    if (!issueResponse.ok) {
        throw new Error('Failed to fetch issue');
    }
    if (!commentsResponse.ok) {
        throw new Error('Failed to fetch comments');
    }

    const issue = await issueResponse.json();
    const commentsData = await commentsResponse.json();

    const comments = commentsData.map((comment) => ({
        id: comment.pk,
        ...comment.fields,
    }));

    return json({ issue, comments });
};

export const action = async ({ request, params }: LoaderFunctionArgs) => {
    await requireSessionData(request);

    const form = await request.formData();
    const text = form.get('comment_text');
    const { id } = params;
    const API_BASE_URL = process.env.API_BASE_URL;

    const response = await fetch(`${API_BASE_URL}/issues/${id}/comments/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
    });

    if (!response.ok) {
        throw new Error('Failed to post comment');
    }

    const result = await response.json();
    return json(result);
};

export default function IssueDetail() {
    const { issue, comments } = useLoaderData();
    const fetcher = useFetcher();

    return (
        <div>
            <NavBar />
            <div className='md:flex md:justify-center'>
                <div className='md:w-4/5 p-4'>
                    <Link
                        to='/issues'
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
                            Issue #{issue.id}:{' '}
                            <mark
                                className='px-2 text-white bg-violet-600 rounded dark:bg-gray-500'
                                style={{ lineHeight: '1.5em' }}
                            >
                                {issue.title}
                            </mark>
                        </h1>
                    </div>
                    <p className='text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400 pb-4'>
                        {issue.description}
                    </p>
                    <div className='flex justify-between items-center mb-4'>
                        <fetcher.Form method='post' action={`/issues/${issue.id}/upvote/`} className='ml-4 flex'>
                            <input type='hidden' name='id' value={issue.id} />
                            <button
                                type='submit'
                                className='px-4 py-2 text-sm font-medium text-white bg-violet-500 rounded hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500'
                            >
                                Upvote ({issue.upvotes || 0})
                            </button>
                        </fetcher.Form>
                    </div>
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
                        <fetcher.Form method='post' className='mt-4'>
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
        </div>
    );
}
