import { LoaderFunctionArgs, MetaFunction, ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { requireAdmin } from '~/utils/session.server';
import { db } from '~/utils/db.server';
import { H1 } from '~/components/ui/H1';
import { Button } from '~/components/ui/button';
import { FormErrorMessage } from '~/components/FormErrorMessage';

export const meta: MetaFunction = () => {
    return [{ title: 'Manage Election' }, { name: 'description', content: 'Admin Page to manage election' }];
};

const electionSchema = z.object({
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
});

export const loader: LoaderFunctionArgs = async ({ request }) => {
    await requireAdmin(request);
    const election = await db.election.findFirst();
    return json({ election });
};

export const action: ActionFunctionArgs = async ({ request }) => {
    await requireAdmin(request);
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());

    const result = electionSchema.safeParse(data);
    if (!result.success) {
        return json({ errors: result.error.format() }, 400);
    }

    const { startTime, endTime } = result.data;
    await db.election.upsert({
        where: { id: 1 },
        update: { startTime, endTime },
        create: { startTime, endTime },
    });

    return json({ success: true });
};

export default function ManageElection() {
    const { election } = useLoaderData();
    const fetcher = useFetcher();
    const [startTime, setStartTime] = useState(election?.startTime ?? '');
    const [endTime, setEndTime] = useState(election?.endTime ?? '');

    return (
        <div>
            <H1>Manage Election</H1>
            <fetcher.Form method="post">
                <label>
                    Start Time:
                    <input type="datetime-local" name="startTime" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </label>
                <label>
                    End Time:
                    <input type="datetime-local" name="endTime" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </label>
                <Button type="submit">Save</Button>
            </fetcher.Form>
            <FormErrorMessage>{fetcher.data?.errors?.startTime}</FormErrorMessage>
            <FormErrorMessage>{fetcher.data?.errors?.endTime}</FormErrorMessage>
        </div>
    );
}