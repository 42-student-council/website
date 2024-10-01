import { json, LoaderFunctionArgs, MetaFunction, SerializeFrom } from '@remix-run/node';
import { Form, Link, useFetcher, useLoaderData } from '@remix-run/react';
import classNames from 'classnames';
import { ChevronLeft, Heart } from 'lucide-react';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { FormErrorMessage } from '~/components/FormErrorMessage';
import NavBar from '~/components/NavBar';
import { Info } from '~/components/alert/Info';
import { H1 } from '~/components/ui/H1';
import { H2 } from '~/components/ui/H2';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '~/components/ui/alert-dialog';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import { config } from '~/utils/config.server';
import { formatDate } from '~/utils/date';
import { db } from '~/utils/db.server';
import { sendDiscordWebhookWithUrl } from '~/utils/discord.server';
import { requireAdminSession, requireSessionData, SessionData } from '~/utils/session.server';
import { validateForm } from '~/utils/validation';

const COMMENT_MIN_LENGTH = 3;
const COMMENT_MAX_LENGTH = 5000;

const createCommentSchema = z.object({
    comment_text: z
        .string()
        .min(COMMENT_MIN_LENGTH, 'Comment is too short')
        .max(COMMENT_MAX_LENGTH, 'Comment is too long'),
    official_statement: z.optional(z.enum(['on'])),
});

const voteCommentSchema = z.object({
    issueId: z.coerce.number().positive(),
    commentId: z.coerce.number().positive(),
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

type Comment = {
    createdAt: Date;
    id: number;
    official: boolean;
    text: string;

    votes: {
        userId: string;
    }[];
    _count: { votes: number };
};

type Issue = {
    archived: boolean;
    comments: Comment[];
    createdAt: Date;
    description: string;
    id: number;
    title: string;
    _count: { votes: number };
};

type LoaderData = {
    issue: Issue;
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
                        votes: {
                            select: { userId: true },
                            where: { userId: session.login },
                            take: 1,
                        },
                        _count: {
                            select: { votes: true },
                        },
                    },
                    orderBy: { createdAt: 'asc' },
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
        const { id } = params;

        const user = session.login;
        const form = await request.formData();

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

                return json({ archived: true });
            }
            case 'post-comment': {
                return validateForm(
                    form,
                    createCommentSchema,
                    (errors) => json({ errors }, 400),
                    async (data) => {
                        const isOfficial = data.official_statement === 'on';
                        if (isOfficial) requireAdminSession(session);

                        const issue = await db.issue.findFirst({ where: { id: Number(id) } });
                        if (issue?.archived)
                            return json({ errors: { message: 'Archived issues cannot be commented.' } });

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

                                const embedColor = isOfficial ? 0x9303d4 : 0x22c55e;
                                const embedTitle = isOfficial ? 'New Student Council Comment' : 'New Comment';

                                await sendDiscordWebhookWithUrl(config.discord.councilServerIssueWebhookUrl, {
                                    thread_id: issue?.councilDiscordMessageId?.toString() ?? undefined,
                                    embeds: [
                                        {
                                            color: embedColor,
                                            title: embedTitle,
                                            description: data.comment_text,
                                        },
                                    ],
                                    wait: true,
                                }).catch(console.error);

                                await sendDiscordWebhookWithUrl(config.discord.studentServerIssueWebhookUrl, {
                                    thread_id: issue?.studentDiscordMessageId?.toString() ?? undefined,
                                    embeds: [
                                        {
                                            color: embedColor,
                                            title: embedTitle,
                                            description: `[A new comment has been posted to this issue](<${config.baseUrl}/issues/${issue?.id}#${comment.id}>)`,
                                        },
                                    ],
                                    wait: true,
                                }).catch(console.error);

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
                await db.issue.update({
                    where: { id: Number(id) },
                    data: {
                        archived: false,
                    },
                });

                return json({ archived: false });
            }
            case 'commentVote': {
                return validateForm(
                    form,
                    voteCommentSchema,
                    (errors) => json({ errors }, 400),
                    async (data) => {
                        const issue = await db.issue.findFirst({ where: { id: data.issueId } });
                        if (issue?.archived)
                            return json({ errors: { message: 'Comments from archived issues cannot be upvoted.' } });

                        const existingVote = await db.commentVote.findFirst({
                            where: {
                                commentId: data.commentId,
                                userId: user,
                            },
                        });

                        if (existingVote) {
                            await db.commentVote.delete({
                                where: {
                                    id: existingVote.id,
                                },
                            });

                            return json({ message: 'Removed your vote from the comment.' });
                        }

                        await db.commentVote.create({
                            data: {
                                commentId: data.commentId,
                                userId: user,
                            },
                        });

                        return json({ message: 'Upvoted the comment.' });
                    },
                );
            }
        }

        const upvoteId = form.get('id');
        if (upvoteId) {
            const issue = await db.issue.findFirst({ where: { id: Number(id) } });
            if (issue?.archived) return json({ errors: { message: 'Archived issues cannot be upvoted.' } });

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
                <div className='md:w-3/5 p-4'>
                    <div className='flex flex-row justify-between'>
                        <H1>Issue #{issue.id}</H1>
                        <Link to='/issues' className=''>
                            <Button>
                                <ChevronLeft />
                                Go Back
                            </Button>
                        </Link>
                    </div>
                    {session.role === 'ADMIN' && (
                        <div className='w-full mt-4 bg-rose-200 rounded flex flex-col'>
                            <p className='text-center text-rose-800 font-bold text-lg mt-4'>Admin Menu</p>
                            <div className='flex flex-col justify-between items-center m-4'>
                                <div className='flex items-center'>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button className='bg-rose-500 hover:bg-rose-600'>
                                                {issue.archived ? 'Unarchive' : 'Archive'}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    {issue.archived
                                                        ? 'You are about to unarchive this issue. This will make the issue open to discussion again.'
                                                        : 'You are about to archive this issue. Students cannot comment and vote on archived issues.'}
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <Form method='POST'>
                                                    <input
                                                        type='hidden'
                                                        name='_action'
                                                        value={issue.archived ? 'unarchive' : 'archive'}
                                                    />
                                                    <AlertDialogAction asChild>
                                                        <Button type='submit'>
                                                            {issue.archived ? 'Unarchive' : 'Archive'}
                                                        </Button>
                                                    </AlertDialogAction>
                                                </Form>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                    <p className='text-center text-rose-800 font-bold ml-4'>
                                        {issue.archived
                                            ? 'This issue is closed.'
                                            : 'This issue is open for discussion.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className='mt-4'>
                        <H2 className='hyphens-auto break-words'>{issue.title}</H2>
                    </div>
                    <p className='text-lg lg:text-xl font-normal pb-4 whitespace-pre-wrap text-balance hyphens-auto break-words mt-2'>
                        {issue.description}
                    </p>
                    <div className='flex flex-col b-4'>
                        <p className={classNames('text-s text-gray-600 pb-2')}>
                            {formatDate(new Date(issue.createdAt))}
                        </p>
                        <div className='flex flex-row items-center'>
                            <fetcher.Form method='post' className='flex w-full'>
                                <input type='hidden' name='id' value={issue.id} />

                                <Button
                                    type='submit'
                                    disabled={issue.archived}
                                    className={classNames('hover:bg-darkred-500 w-full md:w-96', {
                                        'bg-rose-500': hasVoted,
                                        'bg-slate-200': !hasVoted,
                                    })}
                                    title={hasVoted ? 'You have upvoted this issue' : 'Upvote this issue'}
                                >
                                    <Heart
                                        className={classNames('mr-2', {
                                            'text-white fill-current': hasVoted,
                                            'text-black': !hasVoted,
                                        })}
                                    />
                                    <p
                                        className={classNames('font-bold', {
                                            'text-white': hasVoted,
                                            'text-black': !hasVoted,
                                        })}
                                    >
                                        {issue._count.votes}{' '}
                                        {issue._count.votes == 1
                                            ? 'Student upvoted this issue'
                                            : 'Students upvoted this issue'}
                                    </p>{' '}
                                </Button>
                            </fetcher.Form>
                        </div>
                        <Info title='Note' className='mt-4 md:w-3/5'>
                            To ensure every student can only vote once, each vote gets stored with the user ID in a
                            database, making votes <strong>not fully anonymous</strong> to the student council.
                        </Info>
                    </div>
                    <div className='mt-8'>
                        <h2 className='text-2xl font-bold'>Comments</h2>
                        {issue.comments.length > 0 ? (
                            <ul>
                                {issue.comments.map((comment) => (
                                    <li key={comment.id} id={comment.id.toString()}>
                                        <IssueComment comment={comment} issue={issue} />
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No comments yet.</p>
                        )}
                        {!issue.archived && (
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
                                    {session.role === 'ADMIN' && (
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
                        )}
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

function IssueComment({ comment, issue }: { comment: SerializeFrom<Comment>; issue: SerializeFrom<Issue> }) {
    const upvoteFetcher = useFetcher<{ message?: string }>();

    const hasVoted = comment.votes.length !== 0;

    return (
        <div
            className={classNames('mt-4 bg-slate-100 p-2 rounded-md', {
                'border-2 border-gray-300 rounded': comment.official,
            })}
        >
            {comment.official && <p className='text-lg text-gray-400 font-bold'>Student Council Answer</p>}
            <Link
                to={`#${comment.id}`}
                className={classNames('text-xs text-gray-600 pb-2 hover:underline', {
                    'text-slate-600': comment.official,
                })}
            >
                {formatDate(new Date(comment.createdAt))}
            </Link>
            <p
                className={classNames('text-base text-gray-600 whitespace-pre-wrap break-words', {
                    'text-slate-800': comment.official,
                })}
            >
                {comment.text}
            </p>
            <upvoteFetcher.Form method='post' className='flex w-full'>
                <input type='hidden' name='_action' value='commentVote' />
                <input type='hidden' name='issueId' value={issue.id} />
                <input type='hidden' name='commentId' value={comment.id} />

                <Button type='submit' variant='ghost' className='p-0' disabled={issue.archived}>
                    <Heart
                        className={classNames('mr-2', {
                            'text-rose-500 fill-current': hasVoted,
                            'text-black': !hasVoted,
                        })}
                    />
                    <p className={'font-bold text-black'}>{comment._count.votes}</p>
                </Button>
            </upvoteFetcher.Form>
        </div>
    );
}
