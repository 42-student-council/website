import { LoaderFunctionArgs, MetaFunction, ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';
import { requireAdmin, requireSessionData } from '~/utils/session.server';
import { db } from '~/utils/db.server';
import { H1 } from '~/components/ui/H1';
import { Button } from '~/components/ui/button';
import { FormErrorMessage } from '~/components/FormErrorMessage';

export const meta: MetaFunction = () => {
    return [{ title: 'Student Council Election' }, { name: 'description', content: 'Vote for your student council members' }];
};

const addApplicantSchema = z.object({
    name: z.string().min(1, 'Name is required'),
});

const voteSchema = z.object({
    applicantIds: z.array(z.number()).nonempty('You must select at least one applicant'),
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const session = await requireSessionData(request);
    const applicants = await db.applicant.findMany({
        include: { _count: { select: { votes: true } } }
    });
    const votes = await db.vote.findMany({ where: { userId: session.login } });
    const hasVoted = votes.length > 0;

    return json({ applicants, votes, hasVoted });
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const session = await requireSessionData(request);
    const formData = await request.formData();
    const action = formData.get('_action');

    switch (action) {
        case 'addApplicant': {
            return validateForm(
                formData,
                addApplicantSchema,
                (errors) => json({ errors }, 400),
                async (data) => {
                    await db.applicant.create({ data });
                    return json({ success: true });
                }
            );
        }
        case 'vote': {
            return validateForm(
                formData,
                voteSchema,
                (errors) => json({ errors }, 400),
                async (data) => {
                    await db.vote.createMany({
                        data: data.applicantIds.map((id) => ({ userId: session.login, applicantId: id })),
                    });
                    return json({ success: true });
                }
            );
        }
        default:
            throw new Error('Invalid action');
    }
};

export default function Election() {
    const { applicants, votes, hasVoted } = useLoaderData<typeof loader>();
    const addApplicantFetcher = useFetcher<typeof action>();
    const voteFetcher = useFetcher<typeof action>();
    const [selectedApplicants, setSelectedApplicants] = useState<number[]>([]);

    const handleVoteChange = useCallback((id: number) => {
        setSelectedApplicants((prev) =>
            prev.includes(id) ? prev.filter((applicantId) => applicantId !== id) : [...prev, id]
        );
    }, []);

    return (
        <div>
            <H1>Student Council Election</H1>
            {hasVoted ? (
                <p>Thank you for voting!</p>
            ) : (
                <div>
                    <h2>Applicants</h2>
                    <ul>
                        {applicants.map((applicant) => (
                            <li key={applicant.id}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={selectedApplicants.includes(applicant.id)}
                                        onChange={() => handleVoteChange(applicant.id)}
                                    />
                                    {applicant.name} ({applicant._count.votes} votes)
                                </label>
                            </li>
                        ))}
                    </ul>
                    <voteFetcher.Form method="post">
                        <input type="hidden" name="_action" value="vote" />
                        <input type="hidden" name="applicantIds" value={JSON.stringify(selectedApplicants)} />
                        <Button type="submit" disabled={selectedApplicants.length === 0}>Vote</Button>
                    </voteFetcher.Form>
                    <FormErrorMessage>{voteFetcher.data?.errors?.applicantIds}</FormErrorMessage>
                </div>
            )}
            <div>
                <h2>Add Applicant</h2>
                <addApplicantFetcher.Form method="post">
                    <input type="hidden" name="_action" value="addApplicant" />
                    <input type="text" name="name" placeholder="Applicant Name" />
                    <Button type="submit">Add</Button>
                </addApplicantFetcher.Form>
                <FormErrorMessage>{addApplicantFetcher.data?.errors?.name}</FormErrorMessage>
            </div>
        </div>
    );
}