import { LoaderFunctionArgs } from '@remix-run/node';
import NavBar from '~/components/NavBar';
import { requireSessionData, SessionData } from '~/utils/session.server';
import React, { useState, useEffect, useRef } from 'react';
import { json } from '@remix-run/node';
import { useLoaderData, Link, useFetcher } from '@remix-run/react';
import { Button } from '~/components/ui/button';
import { db } from '~/utils/db.server';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
    points: 5,
    duration: 60,
});

type LoaderData = {
    issue: {
        comments: {
            createdAt: Date;
            id: number;
            text: string;
        }[];
        createdAt: Date;
        description: string;
        id: number;
        title: string;
        _count: { votes: number };
    };
    session: SessionData;
    hasVoted: boolean;
};

type FetcherData = {
    message?: string;
};

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
    const session = await requireSessionData(request);

    try {
        const { id } = params;

        if (!id) {
            throw new Error('Issue ID is required');
        }

        const issue = await db.issue.findUnique({
            where: { id: Number(id) },
            select: {
                createdAt: true,
                description: true,
                id: true,
                title: true,
                _count: {
                    select: { votes: true },
                },

                comments: {
                    select: {
                        id: true,
                        text: true,
                        createdAt: true,
                    },
                },
            },
        });

        if (!issue) {
            throw new Error('Issue not found');
        }

        const hasVoted = await db.issueVote.findFirst({
            where: {
                issueId: Number(id),
                userId: session.login,
            },
        });

        return { issue, session, hasVoted: !!hasVoted } satisfies LoaderData;
    } catch (error) {
        console.error(error);
        throw new Error('Error loading data');
    }
};

export const action = async ({ request, params }: LoaderFunctionArgs) => {
    try {
        const session = await requireSessionData(request);

        const user = session.login;
        const form = await request.formData();
        const text = form.get('comment_text');
        const { id } = params;

        if (text) {
            return rateLimiter
                .consume(`${user}-${id}`, 1)
                .then(async () => {
                    const comment = await db.comment.create({
                        data: {
                            text: text.toString(),
                            userId: user,
                            issueId: Number(id),
                        },
                    });

                    return json(comment);
                })
                .catch(() => {
                    return json(
                        { message: 'You tried to post too many comments. Please try again later.' },
                        { status: 429 },
                    );
                });
        }

        const upvoteId = form.get('id');

        if (upvoteId) {
            const existingVote = await db.issueVote.findFirst({
                where: {
                    issueId: Number(id),
                    userId: user,
                },
            });

            if (existingVote) {
                await db.issueVote.delete({
                    where: {
                        id: existingVote.id,
                    },
                });

                return json({ message: 'Removed your vote from the issue.' });
            }

            await db.issueVote.create({
                data: {
                    issueId: Number(id),
                    userId: user,
                },
            });

            return json({ message: 'Upvoted the issue.' });
        }

        throw new Error('Invalid action');
    } catch (error) {
        if (error instanceof Error) {
            console.error(error);
            return json({ message: error.message }, { status: 500 });
        } else {
            console.error('An unexpected error occurred', error);
            return json({ message: 'An unexpected error occurred' }, { status: 500 });
        }
    }
};

export default function IssueDetail() {
    const { issue, session, hasVoted } = useLoaderData<LoaderData>();
    const fetcher = useFetcher();
    const [popupMessage, setPopupMessage] = useState(null);
    const formRef = useRef(null);
    const [commentText, setCommentText] = useState('');

    useEffect(() => {
        if (fetcher.state === 'idle' && fetcher.data && !fetcher.data.message) {
            formRef.current?.reset();
            setCommentText('');
        }
    }, [fetcher.state, fetcher.data]);

    if (!issue) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <NavBar login={session.login} role={session.role} />
            <div className='md:flex md:justify-center'>
                <div className='md:w-4/5 p-4'>
                    <Link
                        to='/issues'
                        className='inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 mb-4'
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
                            Issue #{issue.id}: {issue.title}
                        </h1>
                    </div>
                    <p className='text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400 pb-4'>
                        {issue.description}
                    </p>
                    <div className='flex justify-between items-center mb-4'>
                        <fetcher.Form method='post' className='ml-4 flex'>
                            <input type='hidden' name='id' value={issue.id} />
                            <Button
                                type='submit'
                                className={`px-4 py-2 text-sm font-medium text-white rounded focus:outline-none focus:ring-2 focus:ring-offset-2 ${hasVoted ? 'bg-red-500 hover:bg-darkred-500' : 'bg-gray-500 hover:bg-black'}`}
                                title={hasVoted ? 'You have upvoted this issue' : 'Upvote this issue'}
                            >
                                {hasVoted ? (
                                    <>
                                        <svg
                                            xmlns='http://www.w3.org/2000/svg'
                                            className='h-5 w-5 inline mr-2'
                                            viewBox='0 0 20 20'
                                            fill='currentColor'
                                        >
                                            <path
                                                fillRule='evenodd'
                                                d='M3.172 5.172a4 4 0 015.656 0L10 6.344l1.172-1.172a4 4 0 115.656 5.656L10 17.344 3.172 10.828a4 4 0 010-5.656z'
                                                clipRule='evenodd'
                                            />
                                        </svg>
                                        Upvoted{' '}
                                    </>
                                ) : (
                                    'Upvote '
                                )}
                                ({issue._count.votes})
                            </Button>
                        </fetcher.Form>
                    </div>
                    <div className='mt-8'>
                        <h2 className='text-2xl font-bold'>Comments</h2>
                        {issue.comments.length > 0 ? (
                            <ul>
                                {issue.comments.map((comment) => (
                                    <li key={comment.id} className='mt-4'>
                                        <p className='text-sm text-gray-600'>{comment.text}</p>
                                        <p className='text-xs text-gray-400'>
                                            On {new Date(comment.createdAt).toLocaleDateString()}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No comments yet.</p>
                        )}
                        <fetcher.Form method='post' action={`/issues/${issue.id}/`} className='mt-4' ref={formRef}>
                            <textarea
                                name='comment_text'
                                rows={3}
                                className='w-full px-3 py-2 text-sm text-gray-700 border rounded-lg focus:outline-none'
                                placeholder='Add a comment...'
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)} // Step 2
                            ></textarea>
                            <Button
                                type='submit'
                                className='mt-2 px-4 py-2 text-sm font-medium text-white rounded focus:outline-none focus:ring-2 focus:ring-offset-2'
                                disabled={!commentText.trim()}
                            >
                                Submit
                            </Button>
                        </fetcher.Form>
                    </div>
                </div>
            </div>
            {popupMessage && (
                <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
                    <div className='bg-white p-6 rounded shadow-lg'>
                        <p>{popupMessage}</p>
                        <Button
                            onClick={() => setPopupMessage(null)}
                            className='mt-4 px-4 py-2 text-sm font-medium text-white rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500'
                        >
                            Close
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}