import { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import NavBar from '~/components/NavBar';
import { requireAdminSession, requireSessionData, SessionData } from '~/utils/session.server';
import { useState, useEffect, useRef } from 'react';
import { json } from '@remix-run/node';
import { useLoaderData, Link, useFetcher, Form } from '@remix-run/react';
import { Button } from '~/components/ui/button';
import { db } from '~/utils/db.server';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { ChevronLeft } from 'lucide-react';
import { FormErrorMessage } from '~/components/FormErrorMessage';
import { Info } from '~/components/alert/Info';
import { UserRole } from '@prisma/client';
import { Checkbox } from '~/components/ui/checkbox';
import { z } from 'zod';
import { validateForm } from '~/utils/validation';
import classNames from 'classnames';

const COMMENT_MIN_LENGTH = 3;
const COMMENT_MAX_LENGTH = 5000;

const createCommentSchema = z.object({
    comment_text: z
        .string()
        .min(COMMENT_MIN_LENGTH, 'Comment is too short')
        .max(COMMENT_MAX_LENGTH, 'Comment is too long'),
    official_statement: z.optional(z.enum(['on'])),
});

export const meta: MetaFunction<typeof loader> = ({ data, params }) => {
    return [
        { title: `Issue | ${data?.issue.title ?? `#${params.id ?? 'Unknown'}`}` },
        {
            name: 'description',
            content: `${(data?.issue.description ?? 'Unknown').substring(0, 100)}${data?.issue.description.length || 0 > 100 ? '...' : ''}`,
        },
    ];
};

const rateLimiter = new RateLimiterMemory({
    points: 5,
    duration: 60,
});

type LoaderData = {
    issue: {
        archived: boolean;
        comments: {
            createdAt: Date;
            id: number;
            official: boolean;
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
            where: { id: Number(id), archived: session.role === UserRole.ADMIN ? undefined : false },
            select: {
                archived: true,
                createdAt: true,
                description: true,
                id: true,
                title: true,
                _count: {
                    select: { votes: true },
                },

                comments: {
                    select: {
                        createdAt: true,
                        id: true,
                        text: true,
                        official: true,
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

        const action = form.get('_action');

        switch (action) {
            case 'archive': {
                requireAdminSession(session);

                await db.issue.update({
                    where: { id: Number(id) },
                    data: {
                        archived: true,
                    },
                });

                break;
            }
            case 'post-comment': {
                return validateForm(
                    form,
                    createCommentSchema,
                    (errors) => json({ errors }, 400),
                    async (data) => {
                        if (data.official_statement === 'on') requireAdminSession(session);

                        return rateLimiter
                            .consume(`${user}-${id}`, 1)
                            .then(async () => {
                                const comment = await db.comment.create({
                                    data: {
                                        official: data.official_statement === 'on',
                                        text: data.comment_text,
                                        issueId: Number(id),
                                    },
                                });

                                return json(comment);
                            })
                            .catch(() => {
                                return json(
                                    {
                                        errors: {
                                            message: 'You tried to post too many comments. Please try again later.',
                                        },
                                    },
                                    { status: 429 },
                                );
                            });
                    },
                );
            }
            case 'unarchive': {
                requireAdminSession(session);

                await db.issue.update({
                    where: { id: Number(id) },
                    data: {
                        archived: false,
                    },
                });

                break;
            }
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
    const fetcher = useFetcher<{ errors?: { message?: string } }>();
    const [popupMessage, setPopupMessage] = useState(null);
    const formRef = useRef(null);
    const [commentText, setCommentText] = useState('');
    const [isFormValid, setIsFormValid] = useState(false);

    const commentRef = useRef(null);

    useEffect(() => {
        if (fetcher.state === 'idle' && fetcher.data && !fetcher.data?.errors?.message) {
            formRef.current?.reset();
            setCommentText('');
        }
    }, [fetcher.state, fetcher.data]);

    useEffect(() => {
        const savedCommentText = localStorage.getItem(`issue-${issue.id}-comment-text`);
        if (savedCommentText) setCommentText(savedCommentText);
    }, []);

    useEffect(() => {
        if (commentRef.current) {
            commentRef.current.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }, [commentText]);

    useEffect(() => {
        localStorage.setItem(`issue-${issue.id}-comment-text`, commentText);
    }, [commentText]);

    useEffect(() => {
        let isCommentTextValid = true;
        if (commentText.length < COMMENT_MIN_LENGTH || commentText.length > COMMENT_MAX_LENGTH) {
            isCommentTextValid = false;
        }
        setIsFormValid(isCommentTextValid);
    }, [commentText]);

    const handleSubmit = (e) => {
        if (!isFormValid || fetcher.formData) {
            e.preventDefault();
        }
    };

    if (!issue) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <NavBar login={session.login} role={session.role} />
            <div className='md:flex md:justify-center'>
                <div className='md:w-4/5 p-4'>
                    <Link to='/issues'>
                        <Button>
                            <ChevronLeft />
                            Go Back
                        </Button>
                    </Link>
                    {session.role === UserRole.ADMIN && (
                        <div className='w-full mt-4 bg-rose-200 rounded flex flex-col'>
                            <p className='text-center text-rose-800 font-bold text-lg mt-4'>Admin Menu</p>
                            <div className='flex flex-col justify-between items-center m-4'>
                                <Form method='POST'>
                                    <input
                                        type='hidden'
                                        name='_action'
                                        value={issue.archived ? 'unarchive' : 'archive'}
                                    />
                                    <div className='flex flex-row items-center'>
                                        <Button type='submit' className=' bg-rose-500 hover:bg-rose-600'>
                                            {issue.archived ? 'Unarchive' : 'Archive'}
                                        </Button>
                                        <p className='text-center text-rose-800 font-bold ml-4'>
                                            {issue.archived
                                                ? 'Only admins can see this issue.'
                                                : 'This issue is visible to students.'}
                                        </p>
                                    </div>
                                </Form>
                            </div>
                        </div>
                    )}
                    <div className='flex justify-between items-center'>
                        <h1 className='mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white pt-4 pb-4'>
                            Issue #{issue.id}: {issue.title}
                        </h1>
                    </div>
                    <p className='text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400 pb-4 whitespace-pre-wrap'>
                        {issue.description}
                    </p>
                    <div className='flex flex-col b-4'>
                        <fetcher.Form method='post' className='flex'>
                            <input type='hidden' name='id' value={issue.id} />

                            <Button
                                type='submit'
                                className={hasVoted ? 'bg-upvoteButtonRed hover:bg-darkred-500' : ''}
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
                        <Info title='Note' className='mt-4 w-1/2'>
                            To ensure every student can only vote once, each vote gets stored with the user ID in a
                            database, making votes <strong>not fully anonymous</strong> to the student council.
                        </Info>
                    </div>
                    <div className='mt-8'>
                        <h2 className='text-2xl font-bold'>Comments</h2>
                        {issue.comments.length > 0 ? (
                            <ul>
                                {issue.comments.map((comment) => (
                                    <li
                                        key={comment.id}
                                        className={classNames('mt-4', {
                                            'border-y-8 border-green-300 rounded px-2 bg-green-300': comment.official,
                                        })}
                                    >
                                        {comment.official && (
                                            <p className='text-lg text-green-800 font-bold'>Student Council Answer</p>
                                        )}
                                        <p
                                            className={classNames('text-sm text-gray-600 whitespace-pre-wrap', {
                                                'text-slate-800': comment.official,
                                            })}
                                        >
                                            {comment.text}
                                        </p>
                                        <p
                                            className={classNames('text-xs text-gray-400', {
                                                'text-slate-600': comment.official,
                                            })}
                                        >
                                            On{' '}
                                            {new Date(comment.createdAt).toLocaleString([], {
                                                year: 'numeric',
                                                month: 'numeric',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No comments yet.</p>
                        )}
                        <fetcher.Form method='post' className='mt-4' ref={formRef} onSubmit={handleSubmit}>
                            <input type='hidden' name='_action' value='post-comment' />
                            <textarea
                                name='comment_text'
                                required
                                rows={3}
                                className='w-full px-3 py-2 text-sm text-gray-700 border rounded-lg focus:outline-none'
                                placeholder='Add a comment...'
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                minLength={COMMENT_MIN_LENGTH}
                                maxLength={COMMENT_MAX_LENGTH}
                                ref={commentRef}
                            ></textarea>
                            <div className='flex flex-col'>
                                {session.role === UserRole.ADMIN && (
                                    <div className='flex items-center space-x-2 my-4'>
                                        <Checkbox name='official_statement' id='official_statement' />
                                        <label
                                            htmlFor='official_statement'
                                            className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                                        >
                                            Post as official statement
                                        </label>
                                    </div>
                                )}

                                <Button type='submit' className='mt-2' invalid={!isFormValid}>
                                    Comment
                                </Button>
                            </div>
                            <FormErrorMessage className='mt-2'>{fetcher.data?.errors?.message}</FormErrorMessage>
                        </fetcher.Form>
                    </div>
                </div>
            </div>
            {popupMessage && (
                <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
                    <div className='bg-white p-6 rounded shadow-lg'>
                        <p>{popupMessage}</p>
                        <Button onClick={() => setPopupMessage(null)} className='mt-4'>
                            Close
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
