import { LoaderFunctionArgs, MetaFunction, SerializeFrom } from '@remix-run/node';
import { useLoaderData, Link, useNavigate } from '@remix-run/react';
import { requireSessionData, SessionData } from '~/utils/session.server';
import {
    ArrowUpAZ,
    PlusCircle,
    CalendarArrowDown,
    CalendarArrowUp,
    ArrowDown01,
    ArrowUp01,
    ArrowDownAZ,
} from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import NavBar from '~/components/NavBar';
import { Warning } from '~/components/alert/Warning';
import { useState, HTMLAttributes } from 'react';
import { db } from '~/utils/db.server';
import { UserRole } from '@prisma/client';
import classNames from 'classnames';
import {
    ColumnDef,
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

    return (
        <div>
            <NavBar login={session.login} role={session.role} />
            <div className='flex flex-col items-center mt-4 mx-2 md:mx-4 '>
                <Tabs defaultValue='all' className='w-11/12'>
                    <TabsList>
                        <TabsTrigger value='all'>Online</TabsTrigger>
                        <TabsTrigger value='archived'>Archived</TabsTrigger>
                    </TabsList>
                    <div className='flex items-center'>
                        <div className='ml-auto flex items-center gap-2'>
                            <Link to='/issues/new'>
                                <Button size='sm' className='h-7 gap-1'>
                                    <PlusCircle className='h-3.5 w-3.5' />
                                    <span className='whitespace-nowrap'>I also have something to say!</span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <TabsContent value='all' className='flex justify-center'>
                        <Card x-chunk='dashboard-06-chunk-0' className='w-full'>
                            <CardHeader>
                                <CardTitle>Issues</CardTitle>
                                <CardDescription>This is what students are currently talking about.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <IssuesTable issues={issues.filter((issue) => !issue.archived)} />
                            </CardContent>
                            <CardFooter>
                                <div className='text-xs text-muted-foreground'>
                                    Showing <span className='font-bold'>{issues.length}</span>{' '}
                                    {issues.length === 1 ? 'issue' : 'issues'}
                                </div>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                    <TabsContent value='archived' className='flex justify-center'>
                        <Card x-chunk='dashboard-06-chunk-0' className='w-full'>
                            <CardHeader>
                                <CardTitle>Issues</CardTitle>
                                <CardDescription>This is what students are currently talking about.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <IssuesTable issues={issues.filter((issue) => issue.archived)} />
                            </CardContent>
                            <CardFooter>
                                <div className='text-xs text-muted-foreground'>
                                    Showing <span className='font-bold'>{issues.length}</span>{' '}
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

                return titleA.localeCompare(titleB);
            },
            header: ({ column }) => {
                return (
                    <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
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
        },
        {
            id: 'votes',
            accessorKey: '_count.votes',
            header: ({ column }) => {
                return (
                    <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Votes
                        {column.getIsSorted() !== false &&
                            (column.getIsSorted() === 'asc' ? (
                                <ArrowUp01 className='ml-2 h-4 w-4' />
                            ) : (
                                <ArrowDown01 className='ml-2 h-4 w-4' />
                            ))}
                    </Button>
                );
            },
        },
        {
            accessorKey: 'createdAt',
            header: ({ column }) => {
                return (
                    <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
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
                const formatted = new Date(row.getValue('createdAt')).toLocaleDateString([], {
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

    const [sorting, setSorting] = useState<SortingState>([{ id: 'votes', desc: true }]);

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
