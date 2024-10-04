import { LoaderFunctionArgs, MetaFunction, SerializeFrom } from '@remix-run/node';
import { Link, useLoaderData, useNavigate, useSearchParams } from '@remix-run/react';
import {
    ColumnDef,
    ColumnSort,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import classNames from 'classnames';
import {
    ArrowDown10,
    ArrowDownAZ,
    ArrowUp10,
    ArrowUpAZ,
    CalendarArrowDown,
    CalendarArrowUp,
    PlusCircle,
} from 'lucide-react';
import { HTMLAttributes, useEffect, useState } from 'react';
import { Warning } from '~/components/alert/Warning';
import { H1 } from '~/components/ui/H1';
import { Button } from '~/components/ui/button';
import { ScrollArea, ScrollBar } from '~/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { formatDate } from '~/utils/date';
import { db } from '~/utils/db.server';
import { requireSessionData, SessionData } from '~/utils/session.server';

export const meta: MetaFunction = () => {
    return [{ title: 'Issues' }, { name: 'description', content: 'List of all public issues from the students.' }];
};

export async function loader({ request }: LoaderFunctionArgs) {
    const session = await requireSessionData(request);

    const issues = await db.issue.findMany({
        select: {
            archived: true,
            id: true,
            title: true,
            description: true,
            createdAt: true,
            _count: {
                select: {
                    votes: true,
                    comments: true,
                },
            },
        },
    });
    issues.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return { issues, session } satisfies LoaderData;
}

type Issue = {
    archived: boolean;
    createdAt: Date;
    description: string;
    id: number;
    title: string;
    _count: {
        votes: number;
        comments: number;
    };
};

type LoaderData = { issues: Issue[]; session: SessionData };

export default function Issues() {
    const { issues, session } = useLoaderData<LoaderData>();
    const archivedIssues = issues.filter((issue) => issue.archived);
    const visibleIssues = issues.filter((issue) => !issue.archived);

    const [searchParams, setSearchParams] = useSearchParams();

    const initialIssueFilter = () => {
        return searchParams.get('filter') ?? 'open';
    };

    const [filter, setFilter] = useState(initialIssueFilter);

    useEffect(() => {
        if (filter === 'archived') {
            setSearchParams({ filter: 'archived' });
        } else {
            setSearchParams({});
        }
    }, [filter, setSearchParams]);

    return (
        <Tabs defaultValue={filter} onValueChange={(value) => setFilter(value)}>
            <H1 className='mb-4'>Issues</H1>
            <div className='flex justify-between items-center mb-2'>
                <TabsList>
                    <TabsTrigger value='open'>Open</TabsTrigger>
                    <TabsTrigger value='archived'>Archived</TabsTrigger>
                </TabsList>
                <div className='flex gap-2 items-center ml-auto'>
                    <Link to='/issues/new'>
                        <Button size='md' className='gap-2'>
                            <PlusCircle className='w-5 h-5' />
                            <span className='hidden whitespace-nowrap sm:inline'>I also have something to say!</span>
                            <span className='whitespace-nowrap sm:hidden'>New Issue</span>
                        </Button>
                    </Link>
                </div>
            </div>
            <TabsContent value='open' className='flex flex-col justify-center'>
                <p className='pb-2 text-muted-foreground'>This is what students are currently talking about.</p>
                <IssuesTable issues={visibleIssues} />
                <div className='pt-2 pl-2 text-xs text-muted-foreground'>
                    Showing <span className='font-bold'>{visibleIssues.length}</span>{' '}
                    {visibleIssues.length === 1 ? 'issue' : 'issues'}
                </div>
            </TabsContent>
            <TabsContent value='archived' className='flex flex-col justify-center'>
                <p className='pb-2 text-muted-foreground'>
                    Issues that have been resolved or have been open for 2 weeks and showed no activity for 1 week.
                </p>
                <IssuesTable issues={archivedIssues} />
                <div className='pt-2 pl-2 text-xs text-muted-foreground'>
                    Showing <span className='font-bold'>{archivedIssues.length}</span> archived{' '}
                    {archivedIssues.length === 1 ? 'issue' : 'issues'}
                </div>
            </TabsContent>
        </Tabs>
    );
}

function IssuesTable({ issues }: HTMLAttributes<HTMLTableElement> & { issues: SerializeFrom<Issue[]> }) {
    const columns: ColumnDef<SerializeFrom<Issue>>[] = [
        {
            accessorKey: 'title',
            sortingFn: (rowA, rowB) => {
                const titleA: string = rowA.getValue('title');
                const titleB: string = rowB.getValue('title');

                if (!titleA.localeCompare(titleB)) {
                    const dateA = new Date(rowA.getValue('date')).getTime();
                    const dateB = new Date(rowB.getValue('date')).getTime();
                    return dateB - dateA;
                }
                return titleA.localeCompare(titleB);
            },
            header: ({ column }) => {
                return (
                    <Button
                        variant='ghost'
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className={classNames('flex flex-row', {
                            'mr-6': column.getIsSorted() === false,
                        })}
                    >
                        Title
                        {column.getIsSorted() !== false &&
                            (column.getIsSorted() === 'asc' ? (
                                <ArrowDownAZ className='ml-2 h-4 w-4' />
                            ) : (
                                <ArrowUpAZ className='ml-2 h-4 w-4' />
                            ))}
                    </Button>
                );
            },
            cell: ({ row }) => {
                const id = row.original.id;
                const title = row.getValue<string>('title');
                return (
                    <span>
                        <Link to={`/issues/${id}`} className='hover:underline'>
                            {title}
                        </Link>
                    </span>
                );
            },
        },
        {
            id: 'votes',
            accessorKey: '_count.votes',
            sortingFn: (rowA, rowB) => {
                const votesA: number = rowA.getValue('votes');
                const votesB: number = rowB.getValue('votes');

                if (votesA === votesB) {
                    const dateA = new Date(rowA.getValue('date')).getTime();
                    const dateB = new Date(rowB.getValue('date')).getTime();
                    return dateA - dateB;
                }
                return votesA - votesB;
            },
            header: ({ column }) => {
                return (
                    <Button
                        variant='ghost'
                        onClick={() => {
                            if (column.getIsSorted() === false) {
                                column.toggleSorting(true);
                            } else column.toggleSorting(column.getIsSorted() === 'asc');
                        }}
                        className={classNames('flex flex-row', {
                            'mr-6': column.getIsSorted() === false,
                        })}
                    >
                        Votes
                        {column.getIsSorted() !== false &&
                            (column.getIsSorted() === 'asc' ? (
                                <ArrowUp10 className='ml-2 h-4 w-4' />
                            ) : (
                                <ArrowDown10 className='ml-2 h-4 w-4' />
                            ))}
                    </Button>
                );
            },
            cell: ({ row }) => {
                const votes = row.getValue('votes') as number;
                return <div className='pl-7'>{votes}</div>;
            },
        },
        {
            id: 'comments',
            accessorKey: '_count.comments',
            sortingFn: (rowA, rowB) => {
                const commentsA: number = rowA.getValue('comments');
                const commentsB: number = rowB.getValue('comments');

                if (commentsA === commentsB) {
                    const dateA = new Date(rowA.getValue('date')).getTime();
                    const dateB = new Date(rowB.getValue('date')).getTime();
                    return dateA - dateB;
                }
                return commentsA - commentsB;
            },
            header: ({ column }) => {
                return (
                    <Button
                        variant='ghost'
                        onClick={() => {
                            if (column.getIsSorted() === false) {
                                column.toggleSorting(true);
                            } else column.toggleSorting(column.getIsSorted() === 'asc');
                        }}
                        className={classNames('flex flex-row', {
                            'mr-6': column.getIsSorted() === false,
                        })}
                    >
                        Comments
                        {column.getIsSorted() !== false &&
                            (column.getIsSorted() === 'asc' ? (
                                <ArrowUp10 className='ml-2 h-4 w-4' />
                            ) : (
                                <ArrowDown10 className='ml-2 h-4 w-4' />
                            ))}
                    </Button>
                );
            },
            cell: ({ row }) => {
                const comments = row.getValue('comments') as number;
                return <div className='pl-12'>{comments}</div>;
            },
        },
        {
            id: 'date',
            accessorKey: 'createdAt',
            header: ({ column }) => {
                return (
                    <Button
                        variant='ghost'
                        onClick={() => {
                            if (column.getIsSorted() === false) {
                                column.toggleSorting(true);
                            } else column.toggleSorting(column.getIsSorted() === 'asc');
                        }}
                        className={classNames('flex flex-row', {
                            'mr-6': column.getIsSorted() === false,
                        })}
                    >
                        Created at
                        {column.getIsSorted() !== false &&
                            (column.getIsSorted() === 'asc' ? (
                                <CalendarArrowUp className='ml-2 h-4 w-4' />
                            ) : (
                                <CalendarArrowDown className='ml-2 h-4 w-4' />
                            ))}
                    </Button>
                );
            },
            cell: ({ row }) => {
                return <span>{formatDate(new Date(row.getValue('date')))}</span>;
            },
        },
    ];

    const [sorting, setSorting] = useState<ColumnSort[]>([]);

    useEffect(() => {
        if (window === undefined) return;

        const savedSorting = localStorage.getItem('tableSorting');
        if (savedSorting) setSorting(JSON.parse(savedSorting));
    }, []);

    useEffect(() => {
        if (window === undefined) return;

        if (sorting.length > 0) localStorage.setItem('tableSorting', JSON.stringify(sorting));
    }, [sorting]);

    const table = useReactTable({
        data: issues,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
        },
    });

    const navigate = useNavigate();

    return (
        <ScrollArea className='w-full whitespace-nowrap rounded-md border'>
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => {
                            return (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                    onClick={() => navigate(`/issues/${row.original.id}`)}
                                    className='hover:cursor-pointer'
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            );
                        })
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className='h-24 text-center'>
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <ScrollBar orientation='horizontal' />
        </ScrollArea>
    );
}

export function ErrorBoundary() {
    return (
        <div className='mt-4 mx-4'>
            <Warning title='Error'>
                Something went wrong whilst fetching the issues. Please try again later.
                <p className='mt-4'>
                    If this issue persists, please open an issue on our{' '}
                    <Link to='https://github.com/42-student-council/website' target='_blank' className='underline'>
                        GitHub Repo
                    </Link>
                    .
                </p>
            </Warning>
        </div>
    );
}
