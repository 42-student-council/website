import { json, LoaderFunctionArgs, MetaFunction, SerializeFrom } from '@remix-run/node';
import { Form, Link, useFetcher, useLoaderData } from '@remix-run/react';
import classNames from 'classnames';
import { Heart } from 'lucide-react';
import { Fragment, useState } from 'react';
import { z } from 'zod';
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
import { formatDate } from '~/utils/date';
import { db } from '~/utils/db.server';
import { requireAdminSession, requireSessionData, SessionData } from '~/utils/session.server';
import { validateForm } from '~/utils/validation';

const votePollOptionSchema = z.object({
    pollId: z.coerce.number().positive(),
    pollOptionId: z.coerce.number().positive(),
});

export const meta: MetaFunction<typeof loader> = ({ data, params }) => {
    return [
        { title: `Poll | ${data?.poll.title ?? `#${params.id ?? 'Unknown'}`}` },
        {
            name: 'description',
            content: `${(data?.poll.description ?? 'Unknown').substring(0, 100)}${data?.poll.description.length || 0 > 100 ? '...' : ''}`,
        },
    ];
};

type PollOption = {
    createdAt: Date;
    id: number;
    text: string;

    votes: {
        userId: string;
    }[];
};

type Poll = {
    archived: boolean;
    options: PollOption[];
    createdAt: Date;
    description: string;
    id: number;
    title: string;
};

type LoaderData = {
    poll: Poll;
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
            throw new Error('Poll ID is required');
        }

        const poll = await db.poll.findUnique({
            where: { id: Number(id) },
            select: {
                archived: true,
                createdAt: true,
                description: true,
                id: true,
                title: true,
                options: {
                    select: {
                        createdAt: true,
                        id: true,
                        text: true,
                        votes: {
                            select: { userId: true },
                            where: { userId: session.login },
                            take: 1,
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        if (!poll) {
            throw new Error('Poll not found');
        }

        const hasVoted = await db.pollOptionVote.findFirst({
            where: {
                pollOptionId: Number(id),
                userId: session.login,
            },
        });

        return { poll, session, hasVoted: !!hasVoted } satisfies LoaderData;
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

                await db.poll.update({
                    where: { id: Number(id) },
                    data: {
                        archived: true,
                    },
                });

                return json({ archived: true });
            }
            case 'unarchive': {
                await db.poll.update({
                    where: { id: Number(id) },
                    data: {
                        archived: false,
                    },
                });

                return json({ archived: false });
            }
            case 'pollOptionVote': {
                return validateForm(
                    form,
                    votePollOptionSchema,
                    (errors) => json({ errors }, 400),
                    async (data) => {
                        const poll = await db.poll.findFirst({ where: { id: data.pollId } });
                        if (poll?.archived)
                            return json({ errors: { message: 'Options from archived polls cannot be upvoted.' } });

                        const existingVote = await db.pollOptionVote.findFirst({
                            where: {
                                pollOptionId: data.pollOptionId,
                                userId: user,
                            },
                        });

                        if (existingVote) {
                            await db.pollOptionVote.delete({
                                where: {
                                    id: existingVote.id,
                                },
                            });

                            return json({ message: 'Removed your vote from the option.' });
                        }

                        await db.pollOptionVote.create({
                            data: {
                                pollOptionId: data.pollOptionId,
                                userId: user,
                            },
                        });

                        return json({ message: 'Upvoted the option.' });
                    },
                );
            }
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
    const { poll, session } = useLoaderData<LoaderData>();
    const [popupMessage, setPopupMessage] = useState(null);

    if (!poll) {
        return <p>Loading...</p>;
    }

    return (
        <Fragment>
            <H1>Poll #{poll.id}</H1>
            {session.role === 'ADMIN' && (
                <div className='w-full mt-4 bg-rose-200 rounded flex flex-col'>
                    <p className='text-center text-rose-800 font-bold text-lg mt-4'>Admin Menu</p>
                    <div className='flex flex-col justify-between items-center m-4'>
                        <div className='flex items-center'>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button className='bg-rose-500 hover:bg-rose-600'>
                                        {poll.archived ? 'Unarchive' : 'Archive'}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {poll.archived
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
                                                value={poll.archived ? 'unarchive' : 'archive'}
                                            />
                                            <AlertDialogAction asChild>
                                                <Button type='submit'>{poll.archived ? 'Unarchive' : 'Archive'}</Button>
                                            </AlertDialogAction>
                                        </Form>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <p className='text-center text-rose-800 font-bold ml-4'>
                                {poll.archived ? 'This issue is closed.' : 'This issue is open for discussion.'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
            <H2 className='mt-4 hyphens-auto break-words'>{poll.title}</H2>
            <p className='text-lg lg:text-xl font-normal pb-4 whitespace-pre-wrap text-balance hyphens-auto break-words mt-2'>
                {poll.description}
            </p>
            <div className='flex flex-col b-4'>
                <p className='text-s text-muted-foreground pb-2'>{formatDate(new Date(poll.createdAt))}</p>
            </div>
            <div className='mt-8'>
                <h2 className='text-2xl font-bold'>Options</h2>
                {poll.options.length > 0 ? (
                    <ul>
                        {poll.options.map((option) => (
                            <li key={option.id} id={option.id.toString()}>
                                <PollOption option={option} poll={poll} />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No options yet.</p>
                )}
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
        </Fragment>
    );
}

function PollOption({ option, poll }: { option: SerializeFrom<PollOption>; poll: SerializeFrom<Poll> }) {
    const upvoteFetcher = useFetcher<{ message?: string }>();

    const hasVoted = option.votes.length !== 0;

    return (
        <div className='mt-4 bg-card p-2 rounded-md border'>
            <Link to={`#${option.id}`} className='text-xs text-muted-foreground pb-2 hover:underline'>
                {formatDate(new Date(option.createdAt))}
            </Link>
            <p className='text-base whitespace-pre-wrap break-words'>{option.text}</p>
            <upvoteFetcher.Form method='post' className='flex w-full'>
                <input type='hidden' name='_action' value='pollOptionVote' />
                <input type='hidden' name='pollId' value={poll.id} />
                <input type='hidden' name='pollOptionId' value={option.id} />

                <Button type='submit' variant='ghost' className='flex gap-2 p-2' disabled={poll.archived}>
                    <Heart
                        className={classNames('', {
                            'text-rose-500 fill-current': hasVoted,
                            'text-muted-foreground': !hasVoted,
                        })}
                    />
                </Button>
            </upvoteFetcher.Form>
        </div>
    );
}
