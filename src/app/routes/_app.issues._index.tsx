import { LoaderFunctionArgs, MetaFunction, SerializeFrom } from '@remix-run/node';
import { Link, useLoaderData, useSearchParams } from '@remix-run/react';
import { Calendar, Heart, MessageCircle, PlusCircle } from 'lucide-react';
import { Fragment, HTMLAttributes, useEffect, useMemo, useState } from 'react';
import { Warning } from '~/components/alert/Warning';
import { H1 } from '~/components/ui/H1';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { Label } from '~/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle-group';
import { formatDate } from '~/utils/date';
import { db } from '~/utils/db.server';

export const meta: MetaFunction = () => {
    return [{ title: 'Issues' }, { name: 'description', content: 'List of all public issues from the students.' }];
};

export async function loader({ request }: LoaderFunctionArgs) {
    const issues = await db.issue.findMany({
        select: {
            archived: true,
            id: true,
            title: true,
            description: true,
            createdAt: true,
            comments: {
                orderBy: [{ createdAt: 'desc' }],
                take: 1,
                select: {
                    createdAt: true,
                },
            },
            _count: {
                select: {
                    votes: true,
                    comments: true,
                },
            },
        },
    });

    issues.forEach(
        (issue) => (issue.lastActivity = issue.comments.length ? issue.comments[0].createdAt : issue.createdAt),
    );

    issues.sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());

    return { issues } satisfies LoaderData;
}

type Issue = {
    archived: boolean;
    createdAt: Date;
    lastActivity: Date;
    description: string;
    id: number;
    title: string;
    _count: {
        votes: number;
        comments: number;
    };
};

type LoaderData = { issues: Issue[] };

type filters = 'open' | 'archived';
type sortings = 'activity' | 'votes' | 'comments';

export default function Issues() {
    const defaultFilter = 'open';
    const defaultSorting = 'activity';

    const { issues } = useLoaderData<LoaderData>();

    const [searchParams, setSearchParams] = useSearchParams();

    const initialIssueFilter = () => {
        const searchSorting = searchParams.get('filter');
        if (searchSorting === 'archived') return searchSorting;
        return defaultFilter;
    };

    const [filter, setFilter] = useState<filters>(initialIssueFilter);

    useEffect(() => {
        if (filter === initialIssueFilter()) {
        } else if (filter === 'archived') {
            setSearchParams({ filter: 'archived' });
        } else {
            setSearchParams({});
        }
    }, [filter, setSearchParams]);

    const [sorting, setSorting] = useState<sortings>(defaultSorting);

    function getFilteredIssues() {
        return issues.filter(
            (issue) => (filter === 'archived' && issue.archived) || (filter === 'open' && !issue.archived),
        );
    }

    function getSortedIssues() {
        const getters = {
            activity: (issue: Issue) => new Date(issue.lastActivity).getTime(),
            votes: (issue: Issue) => issue._count.votes,
            comments: (issue: Issue) => issue._count.comments,
        };

        const getter = getters[sorting];

        return filteredIssues.sort((a, b) => getter(b) - getter(a));
    }

    const filteredIssues = useMemo(getFilteredIssues, [filter]);
    const sortedIssues = useMemo(getSortedIssues, [filter, sorting]);

    return (
        <>
            <H1 className='mb-4'>Issues</H1>
            <div className='flex items-end justify-between flex-wrap gap-4'>
                <div className='flex flex-wrap gap-4'>
                    <div className='flex flex-col gap-2'>
                        <Label>Filter</Label>
                        <ToggleGroup
                            type='single'
                            variant='outline'
                            onValueChange={(newValue) => setFilter(newValue || filter)}
                            value={filter}
                        >
                            <ToggleGroupItem value='open'>Open</ToggleGroupItem>
                            <ToggleGroupItem value='archived'>Archived</ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <Label>Sort by</Label>
                        <ToggleGroup
                            type='single'
                            variant='outline'
                            onValueChange={(newValue) => setSorting(newValue || sorting)}
                            value={sorting}
                        >
                            <ToggleGroupItem value='activity'>Last Activity</ToggleGroupItem>
                            <ToggleGroupItem value='votes'>Votes</ToggleGroupItem>
                            <ToggleGroupItem value='comments'>Comments</ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                </div>
                <Link to='/issues/new'>
                    <Button size='md' className='gap-2'>
                        <PlusCircle className='w-5 h-5' />
                        <span className='whitespace-nowrap'>New Issue</span>
                    </Button>
                </Link>
            </div>
            <p className='py-4 text-muted-foreground'>
                Showing <span className='font-bold'>{sortedIssues.length}</span>{' '}
                {sortedIssues.length === 1 ? 'issue' : 'issues'}{' '}
                {filter === 'open'
                    ? 'students are currently talking about.'
                    : 'that have been resolved or have been open for 2 weeks and showed no activity for 1 week.'}
            </p>
            <IssuesList issues={sortedIssues} />
        </>
    );
}

function IssuesList({ issues }: HTMLAttributes<HTMLTableElement> & { issues: SerializeFrom<Issue[]> }) {
    return (
        <ul className='grid grid-cols-1 gap-2'>
            {issues.map((issue) => (
                <li key={issue.id}>
                    <a href={`/issues/${issue.id}`}>
                        <Card className='grow flex flex-col'>
                            <CardHeader className='p-4 pb-0'>
                                <CardTitle className='text-xl'>
                                    <span className='text-muted-foreground'>#{issue.id}</span> {issue.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='py-2 px-4 flex flex-col gap-2 grow'>
                                <p className='truncate'>{issue.description.slice(0, 120)}</p>
                            </CardContent>
                            <CardFooter className='p-4 pt-0 flex gap-4 wrap justify-between text-sm'>
                                <p className='text-muted-foreground flex items-center'>
                                    <Calendar className='mr-1 size-4' />
                                    <time dateTime={new Date(issue.createdAt).toISOString()}>
                                        {formatDate(new Date(issue.createdAt))}
                                    </time>
                                </p>
                                <div className='flex gap-4'>
                                    <p className='text-muted-foreground flex items-center'>
                                        <Heart className='mr-1 size-4' />
                                        <p>{issue._count.votes}</p>
                                    </p>
                                    <p className='text-muted-foreground flex items-center'>
                                        <MessageCircle className='mr-1 size-4' />
                                        <p>{issue._count.comments}</p>
                                    </p>
                                </div>
                            </CardFooter>
                        </Card>
                    </a>
                </li>
            ))}
        </ul>
    );
}

export function ErrorBoundary() {
    return (
        <Fragment>
            <div className='mx-4 py-4 my-auto'>
                <Warning title='Error'>
                    Something went wrong whilst fetching the issues. Please try again later.
                    <p className='mt-4'>
                        If this issue persists, please open an issue on{' '}
                        <Link to='https://github.com/42-student-council/website' target='_blank' className='underline'>
                            GitHub
                        </Link>
                        .
                    </p>
                </Warning>
            </div>
        </Fragment>
    );
}
