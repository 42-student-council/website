import { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, Link, useNavigate } from '@remix-run/react';
import { requireSessionData, SessionData } from '~/utils/session.server';
import { PlusCircle } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Tabs, TabsContent } from '~/components/ui/tabs';
import NavBar from '~/components/NavBar';
import { Warning } from '~/components/alert/Warning';
import { useState, useEffect } from 'react';

export async function loader({ request }: LoaderFunctionArgs) {
    const session = await requireSessionData(request);

    const API_BASE_URL = process.env.API_BASE_URL;
    const response = await fetch(`${API_BASE_URL}/issues/`);
    if (!response.ok) {
        throw new Error('Failed to fetch issues');
    }
    const issues: Issue[] = await response.json();

    issues.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return { issues, session } satisfies LoaderData;
}

type Issue = {
    id: number;
    title: string;
    description: string;
    created_at: string;
    upvotes: number;
};

type LoaderData = { issues: Issue[]; session: SessionData };

export default function Issues() {
    const { issues: initialIssues, session } = useLoaderData<LoaderData>();
    const [issues, setIssues] = useState<Issue[]>(initialIssues);
    const [sortConfig, setSortConfig] = useState(() => {
        const savedSortConfig = localStorage.getItem('sortConfig');
        return savedSortConfig ? JSON.parse(savedSortConfig) : { key: 'created_at', direction: 'asc' };
    });

    const navigate = useNavigate();

    const sortIssues = (key: string, initialize = false) => {
        let direction = 'asc';
        if (!initialize && sortConfig.key === key) {
            direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
        } else {
            direction = sortConfig.direction;
        }

        const newSortConfig = { key, direction };
        setSortConfig(newSortConfig);
        localStorage.setItem('sortConfig', JSON.stringify(newSortConfig));

        const sortedIssues = [...issues].sort((a, b) => {
            if (key === 'upvotes') {
                return direction === 'asc' ? a.upvotes - b.upvotes : b.upvotes - a.upvotes;
            } else {
                return direction === 'asc'
                    ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                    : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
        });

        setIssues(sortedIssues);
    };

    useEffect(() => {
        const savedSortConfig = JSON.parse(localStorage.getItem('sortConfig') || '{}');
        if (savedSortConfig.key) {
            sortIssues(savedSortConfig.key, true);
        }
    }, []);

    const getSortSymbol = (key: string) => {
        if (sortConfig.key !== key) {
            return '';
        }
        return sortConfig.direction === 'asc' ? '▲' : '▼';
    };

    return (
        <div>
            <NavBar login={session.login} role={session.role} />
            <div className='flex flex-col sm:gap-4 sm:py-4'>
                <main className='grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8'>
                    <Tabs defaultValue='all'>
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
                        <TabsContent value='all'>
                            <Card x-chunk='dashboard-06-chunk-0'>
                                <CardHeader>
                                    <CardTitle>Issues</CardTitle>
                                    <CardDescription>
                                        This is what students are currently talking about.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Title</TableHead>
                                                <TableHead className='hidden md:table-cell'>
                                                    <button
                                                        onClick={() => sortIssues('upvotes')}
                                                        className='cursor-pointer flex items-center gap-1'
                                                        title='Sort by upvotes'
                                                    >
                                                        Upvotes <span className='inline-block w-3 text-center'>{getSortSymbol('upvotes')}</span>
                                                    </button>
                                                </TableHead>
                                                <TableHead className='hidden md:table-cell'>
                                                    <button
                                                        onClick={() => sortIssues('created_at')}
                                                        className='cursor-pointer flex items-center gap-1'
                                                        title='Sort by creation date'
                                                    >
                                                        Created at <span className='inline-block w-3 text-center'>{getSortSymbol('created_at')}</span>
                                                    </button>
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {issues.map((issue) => (
                                                <TableRow
                                                    key={issue.id}
                                                    onClick={() => navigate(`/issues/${issue.id}`)}
                                                    className='hover:cursor-pointer hover:bg-slate-100'
                                                >
                                                    <TableCell className='font-medium'>
                                                        <Link to={`/issues/${issue.id}`}>{issue.title}</Link>
                                                    </TableCell>
                                                    <TableCell className='hidden md:table-cell'>
                                                        {issue.upvotes}
                                                    </TableCell>

                                                    <TableCell className='hidden md:table-cell'>
                                                        {new Date(issue.created_at).toLocaleDateString('en-GB', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                                <CardFooter>
                                    <div className='text-xs text-muted-foreground'>
                                        {/* Showing <strong>1-10</strong> of <strong>{issues.length}</strong> issues */}
                                        Showing <span className='font-bold'>{issues.length}</span>{' '}
                                        {issues.length === 1 ? 'issue' : 'issues'}
                                    </div>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>
        </div>
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
