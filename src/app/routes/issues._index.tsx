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
import { db } from '~/utils/db.server';

export async function loader({ request }: LoaderFunctionArgs) {
    const session = await requireSessionData(request);

    const issues = await db.issue.findMany({
        select: {
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
    issues.sort((a, b) => {
        const upvotesDifference = b._count.votes - a._count.votes;
        if (upvotesDifference !== 0) {
            return upvotesDifference;
        } else {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
    });

    return { issues, session } satisfies LoaderData;
}

type Issue = {
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

    const navigate = useNavigate();

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
                                                <TableHead className='hidden md:table-cell'>Upvotes</TableHead>
                                                <TableHead className='hidden md:table-cell'>Created at</TableHead>
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
                                                        {issue._count.votes}
                                                    </TableCell>

                                                    <TableCell className='hidden md:table-cell'>
                                                        {new Date(issue.createdAt).toLocaleDateString('en-GB', {
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
