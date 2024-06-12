import { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from '@remix-run/node';
import NavBar from '~/components/NavBar';
import { requireSessionData } from '~/utils/session.server';
import React, { useState, useEffect } from 'react';
import { json } from '@remix-run/node';
import { useLoaderData, Link, useFetcher, Form } from '@remix-run/react';
import { H1 } from '~/components/ui/H1';
import { Button } from '~/components/ui/button';

export async function loader({ request }: LoaderFunctionArgs) {
    await requireSessionData(request);

    const API_BASE_URL = process.env.API_BASE_URL;
    try {
        const response = await fetch(`${API_BASE_URL}/issues/view/all/`);
        if (!response.ok) {
            throw new Error('Failed to fetch issues');
        }
        const issues = await response.json();
        return json({ issues });
    } catch (error) {
        console.error('Error fetching issues:', error);
        return json({ issues: [], error: 'Failed to load issues' });
    }
}

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
            throw new Error('Failed to upvote issue');
        }
        const result = await response.json();
        return json(result);
    } catch (error) {
        console.error('Error upvoting issue:', error);
        return json({ error: 'Failed to upvote issue' });
    }
}

export default function Issues() {
    const { issues, error } = useLoaderData();
    const fetcher = useFetcher();

    return (
        <div>
            <NavBar />
            <div className='md:flex md:justify-center'>
                <div className='md:w-4/5 p-4'>
                    <div className='flex justify-between items-center'>
                        <h1 className='mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white pt-8 pb-4'>
                            Here is what{' '}
                            <mark className='px-2 text-white bg-violet-600 rounded dark:bg-gray-500'>students</mark> think
                        </h1>
                        <Link
                            to='/issues/new'
                            className='inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 pl-10'
                        >
                            I also have something to say!
                        </Link>
                    </div>
                    <p className='text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400 pb-4'>
                        This is a collection of the concerns students have raised until now.
                    </p>
                    {error && <p>{error}</p>}
                    <br />
                    <ul>
                        {issues.map((issue, index) => (
                            <li key={issue.id} className='flex justify-between items-center mb-4'>
                                <Link to={`/issues/${issue.id}`} className='w-full'>
                                    <Button
                                        type='button'
                                        className={`w-full py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none rounded-lg border border-violet-100 focus:z-10 focus:ring-4 focus:ring-violet-100 dark:focus:ring-violet-700 text-left ${
                                            index % 2 === 0
                                                ? 'bg-violet-100 hover:bg-violet-200 dark:bg-violet-400 dark:hover:bg-violet-400'
                                                : 'bg-violet-200 hover:bg-violet-300 dark:bg-violet-400 dark:hover:bg-violet-800'
                                        }`}
                                    >
                                        {issue.id}: {issue.title}
                                    </Button>
                                </Link>
                                <fetcher.Form method='post' action='/issues' className='ml-4 flex'>
                                    <input type='hidden' name='issueId' value={issue.id} />
                                    <button
                                        type='submit'
                                        className='px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex-grow'
                                    >
                                        Upvote ({issue.upvotes || 0})
                                    </button>
                                </fetcher.Form>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

