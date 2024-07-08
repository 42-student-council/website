import { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, useFetcher, useNavigate, Link } from '@remix-run/react';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { FormErrorMessage } from '~/components/FormErrorMessage';
import NavBar from '~/components/NavBar';
import { Info } from '~/components/alert/Info';
import { Warning } from '~/components/alert/Warning';
import { H1 } from '~/components/ui/H1';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Separator } from '~/components/ui/separator';
import { Textarea } from '~/components/ui/textarea';
import { requireSessionData } from '~/utils/session.server';
import { validateForm } from '~/utils/validation';

export const meta: MetaFunction = () => {
    return [
        { title: 'Student Council | New Issue' },
        {
            name: 'description',
            content:
                'Have a problem and want to tell the community about it in an anonym way? Then this is the place to go!',
        },
    ];
};

const createIssueSchema = z.object({
    title: z
        .string()
        .trim()
        .min(5, 'Title must be at least 5 characters long.')
        .max(50, 'Title must be at most 50 characters long.'),
    description: z
        .string()
        .min(10, 'Description must be at least 10 characters long.')
        .max(5000, 'Description must be at most 5000 characters long.'),
});

export async function loader({ request }: LoaderFunctionArgs) {
    await requireSessionData(request);

    return null;
}

export async function action({ request }: ActionFunctionArgs) {
    await requireSessionData(request);

    const form = await request.formData();

    return validateForm(
        form,
        createIssueSchema,
        (errors) => json({ errors }, 400),
        async (data) => {
            const res = await fetch(`${process.env.API_BASE_URL}/issues/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...data, created_at: new Date().toISOString() }),
            });
            if (!res.ok)
                return json(
                    {
                        errors: {
                            message: 'An internal server error occurred while creating the issue. Please try again.',
                        },
                    },
                    500,
                );

            const createdIssue: { id: number } = await res.json();
            return json({ id: createdIssue.id });
        },
    );
}

export default function IssuesNew() {
    const createIssueFetcher = useFetcher<{
        errors?: { title?: string; description?: string; message?: string };
        id?: number;
    }>();
    const navigate = useNavigate();

    useEffect(() => {
        if (createIssueFetcher.data?.id != undefined) {
            localStorage.removeItem('create-issue-title');
            localStorage.removeItem('create-issue-description');
            navigate(`/issues/${createIssueFetcher.data.id}`);
        }
    }, [createIssueFetcher.data, navigate]);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        const savedTitle = localStorage.getItem('create-issue-title');
        const savedDescription = localStorage.getItem('create-issue-description');
        if (savedTitle) setTitle(savedTitle);
        if (savedDescription) setDescription(savedDescription);
    }, []);

    useEffect(() => {
        localStorage.setItem('create-issue-title', title);
    }, [title]);

    useEffect(() => {
        localStorage.setItem('create-issue-description', description);
    }, [description]);

    return (
        <div>
            <NavBar />
            <div className='md:flex md:justify-center'>
                <H1 className='m-4 md:w-3/5'>Create a Public Issue</H1>
            </div>
            <Separator />
            <div className='md:flex md:justify-center'>
                <p className='mt-4 mx-4 md:w-3/5'>
                    Open an anonymous issue to discuss what's important to you with the community.
                    <br />
                    If you would like to share your issue with the student council members only, please go to the{' '}
                    <Link to='/contact' className='underline'>
                        contact form
                    </Link>
                    .
                </p>
            </div>
            <div className='flex justify-center mt-4 mx-8'>
                <createIssueFetcher.Form className='md:w-3/5' method='post'>
                    <Label htmlFor='title' className='text-lg'>
                        Issue Title
                    </Label>
                    <Input
                        type='text'
                        name='title'
                        required
                        autoComplete='off'
                        minLength={5}
                        maxLength={50}
                        className={classNames({ 'border-red-600': !!createIssueFetcher.data?.errors?.title })}
                        onChange={(e) => setTitle(e.target.value)}
                        defaultValue={title}
                    />
                    <FormErrorMessage className='mt-1'>{createIssueFetcher.data?.errors?.title}</FormErrorMessage>

                    <div className='mt-4'>
                        <Label htmlFor='description' className='text-lg'>
                            Issue Description
                        </Label>
                        <Textarea
                            placeholder="Please describe your issue or suggestion here...
(Currently we don't support markdown for public issues, but we will in the future.)"
                            name='description'
                            className={classNames('h-48', {
                                'border-red-600': !!createIssueFetcher.data?.errors?.description,
                            })}
                            required
                            autoComplete='off'
                            minLength={10}
                            maxLength={5000}
                            onChange={(e) => setDescription(e.target.value)}
                            defaultValue={description}
                        />
                        <FormErrorMessage className='mt-1'>
                            {createIssueFetcher.data?.errors?.description}
                        </FormErrorMessage>
                    </div>

                    <Info className='mt-4 w-auto'>
                        <span className='font-bold'>Note:</span> Currently you are not able to edit issues after
                        submitting them.
                        <div className='mb-2' />
                    </Info>

                    <Warning title='Important' className='mt-4 w-auto'>
                        Issues are anonymous to the public, this means students won't know who submitted which issue.
                        <br />
                        However, the student council members can check the author to prevent spam.
                    </Warning>

                    <Button type='submit' disabled={!!createIssueFetcher.formData} className='mt-4'>
                        {createIssueFetcher.formData ? 'Loading...' : 'Submit Issue'}
                    </Button>
                    <FormErrorMessage className='mt-1'>{createIssueFetcher.data?.errors?.message}</FormErrorMessage>
                </createIssueFetcher.Form>
            </div>
        </div>
    );
}
