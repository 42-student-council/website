import { LoaderFunctionArgs, MetaFunction, SerializeFrom } from '@remix-run/node';
import { useLoaderData, Link, useNavigate, useSearchParams } from '@remix-run/react';
import { requireSessionData, SessionData } from '~/utils/session.server';
import {
    ArrowUpAZ,
    PlusCircle,
    CalendarArrowDown,
    CalendarArrowUp,
    ArrowDown10,
    ArrowUp10,
    ArrowDownAZ,
} from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import NavBar from '~/components/NavBar';
import { Warning } from '~/components/alert/Warning';
import { useState, HTMLAttributes, useEffect } from 'react';
import { db } from '~/utils/db.server';
import classNames from 'classnames';
import {
    ColumnDef,
    ColumnSort,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table';
import { ScrollArea, ScrollBar } from '~/components/ui/scroll-area';

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
        <div>
            <NavBar login={session.login} role={session.role} />
            <div className='flex flex-col items-center mt-4 mx-2 md:mx-4 '>
                <Tabs defaultValue={filter} className='w-11/12' onValueChange={(value) => setFilter(value)}>
                    <div className='flex justify-between items-center mb-2'>
                        <TabsList defaultValue={'archived'}>
                            <TabsTrigger value='open'>Open</TabsTrigger>
                            <TabsTrigger value='archived'>Archived</TabsTrigger>
                        </TabsList>
                        <div className='ml-auto flex items-center gap-2'>
                            <Link to='/issues/new'>
                                <Button size='md' className='gap-2'>
                                    <PlusCircle className='h-5 w-5' />
                                    <span className='hidden sm:inline whitespace-nowrap'>
                                        I also have something to say!
                                    </span>
                                    <span className='sm:hidden whitespace-nowrap'>New Issue</span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <TabsContent value='open' className='flex justify-center'>
                        <Card x-chunk='dashboard-06-chunk-0' className='w-full'>
                            <CardHeader>
                                <CardTitle>Issues</CardTitle>
                                <CardDescription>This is what students are currently talking about.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <IssuesTable issues={visibleIssues} />
                            </CardContent>
                            <CardFooter>
                                <div className='text-xs text-muted-foreground'>
                                    Showing <span className='font-bold'>{visibleIssues.length}</span>{' '}
                                    {issues.length === 1 ? 'issue' : 'issues'}
                                </div>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                    <TabsContent value='archived' className='flex justify-center'>
                        <Card x-chunk='dashboard-06-chunk-0' className='w-full'>
                            <CardHeader>
                                <CardTitle>Archived Issues</CardTitle>
                                <CardDescription>
                                    <div>
                                        Issues that have been resolved or have been open for 2 weeks and showed no
                                        activity for 3 days.
                                    </div>
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <IssuesTable issues={archivedIssues} />
                            </CardContent>
                            <CardFooter>
                                <div className='text-xs text-muted-foreground'>
                                    Showing <span className='font-bold'>{archivedIssues.length}</span>{' '}
                                    {issues.length === 1 ? 'issue' : 'issues'}
                                </div>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
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
                                column.toggleSorting('desc');
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
            id: 'date',
            accessorKey: 'createdAt',
            header: ({ column }) => {
                return (
                    <Button
                        variant='ghost'
                        onClick={() => {
                            if (column.getIsSorted() === false) {
                                column.toggleSorting('desc');
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
                const formatted = new Date(row.getValue('date')).toLocaleDateString([], {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                });

                return <span>{formatted}</span>;
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
        <ScrollArea className='whitespace-nowrap rounded-md border w-full'>
            <div>
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
                                        className='hover:cursor-pointer hover:bg-slate-100'
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
            </div>
            <ScrollBar orientation='horizontal' />
        </ScrollArea>
    );
}

export function ErrorBoundary() {
    return (
        <div>
            <NavBar login='zekao?' role='USER' />
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
        </div>
    );
}
