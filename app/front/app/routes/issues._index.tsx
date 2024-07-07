import { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { requireSessionData } from '~/utils/session.server';
import { PlusCircle } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Tabs, TabsContent } from '~/components/ui/tabs';
import NavBar from '~/components/NavBar';

export async function loader({ request }: LoaderFunctionArgs) {
    await requireSessionData(request);

    const API_BASE_URL = process.env.API_BASE_URL;
    const response = await fetch(`${API_BASE_URL}/issues/`);
    if (!response.ok) {
        throw new Error('Failed to fetch issues');
    }
    const issues: Issue[] = await response.json();
    issues.sort((a, b) => b.upvotes - a.upvotes);

    return issues;
}

type Issue = {
    id: number;
    title: string;
    description: string;
    created_at: string;
    upvotes: number;
};

type LoaderData = Issue[];

export async function action({ request }: ActionFunctionArgs) {
    await requireSessionData(request);

    const API_BASE_URL = process.env.API_BASE_URL;

    const form = await request.formData();
    const issueId = form.get('issueId');

    try {
        const response = await fetch(`${API_BASE_URL}/issues/${issueId}/upvote/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            if (response.status === 400) {
                const result = await response.json();
                return json({ message: response.body }, { status: 400 });
            }
            throw new Error('Failed to upvote issue');
        }
        const result = await response.json();
        return json(result);
    } catch (error) {
        return json({ error: 'Failed to upvote issue' });
    }
}

export default function Issues() {
    const issues = useLoaderData<LoaderData>();

    return (
        <div>
            <NavBar></NavBar>
            <div className='flex flex-col sm:gap-4 sm:py-4'>
                <main className='grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8'>
                    <Tabs defaultValue='all'>
                        <div className='flex items-center'>
                            <div className='ml-auto flex items-center gap-2'>
                                <Link to='/issues/new'>
                                    <Button size='sm' className='h-7 gap-1'>
                                        <PlusCircle className='h-3.5 w-3.5' />
                                        <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>
                                            I also have something to say!
                                        </span>
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
                                                <TableHead>Name</TableHead>
                                                <TableHead className='hidden md:table-cell'>Upvotes</TableHead>
                                                <TableHead className='hidden md:table-cell'>Created at</TableHead>
                                                <TableHead>
                                                    <span className='sr-only'>Actions</span>
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {issues.map((issue) => (
                                                <TableRow key={issue.id}>
                                                    <TableCell className='font-medium'>
                                                        <Link to={`/issues/${issue.id}`}>{issue.title}</Link>
                                                    </TableCell>
                                                    <TableCell>{issue.upvotes}</TableCell>

                                                    <TableCell className='hidden md:table-cell'>
                                                        {new Date(issue.created_at).toLocaleDateString('en-US', {
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
                                        Showing <strong>1-10</strong> of <strong>{issues.length}</strong> issues
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
