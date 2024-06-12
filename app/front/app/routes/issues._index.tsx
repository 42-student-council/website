import { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from '@remix-run/node';
import NavBar from '~/components/NavBar';
import { requireSessionData } from '~/utils/session.server';
import React, { useState, useEffect } from 'react';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

export async function loader({ request }: LoaderFunctionArgs) {
    await requireSessionData(request);

    const API_BASE_URL = process.env.API_BASE_URL;
    try {
        const response = await fetch(`${API_BASE_URL}/issues/view/all/`);
        if (!response.ok) {
            throw new Error('Failed to fetch issues');
        }
        const issues = await response.json();
        return json({ issues }); // Use the json helper to return issues
    } catch (error) {
        console.error('Error fetching issues:', error);
        return json({ issues: [], error: 'Failed to load issues' });
    }
}

export async function action({ request }: ActionFunctionArgs) {
    await requireSessionData(request);

    const API_BASE_URL = process.env.API_BASE_URL;
    console.log(API_BASE_URL);

    const form = await request.formData();
    // Assuming you're doing something with the form data here
}

export default function Issues() {
    const { issues, error } = useLoaderData(); // Destructure issues and error from loader data

    return (
        <div>
            <NavBar />
            <h2>ISSUES</h2>
            {error && <p>{error}</p>}
            <ul>
                {issues.map((issue) => (
                    <li key={issue.id}>{issue.title}</li>
                ))}
            </ul>
        </div>
    );
}
