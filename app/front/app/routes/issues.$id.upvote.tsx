import { LoaderFunctionArgs } from '@remix-run/node';
import NavBar from '~/components/NavBar';
import { requireSessionData } from '~/utils/session.server';
import React from 'react';
import { json } from '@remix-run/node';
import { useLoaderData, Link, useFetcher, Form } from '@remix-run/react';
import { Button } from '~/components/ui/button';

export const action = async ({ request, params }: LoaderFunctionArgs) => {
    await requireSessionData(request);

    const { id } = params;
    const API_BASE_URL = process.env.API_BASE_URL;

    const response = await fetch(`${API_BASE_URL}/issues/${id}/upvote/`, {
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
};
