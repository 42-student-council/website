import { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, useFetcher, useNavigate, Link, useLoaderData } from '@remix-run/react';
import classNames from 'classnames';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { FormErrorMessage } from '~/components/FormErrorMessage';
import NavBar from '~/components/NavBar';
import { Info } from '~/components/alert/Info';
import { H1 } from '~/components/ui/H1';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Separator } from '~/components/ui/separator';
import { Textarea } from '~/components/ui/textarea';
import { db } from '~/utils/db.server';
import { requireSessionData, SessionData } from '~/utils/session.server';
import { validateForm } from '~/utils/validation';
import { ChevronLeft } from 'lucide-react';

const rateLimiter = new RateLimiterMemory({
    points: 2,
    duration: 60,
});

export const meta: MetaFunction = () => {
    return [
        { title: 'New Issue' },
        {
            name: 'description',
            content: "Open an anonymous issue to discuss what's important to you with the community.",
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
    const session = await requireSessionData(request);

    return { session };
}

type LoaderData = {
    session: SessionData;
};

export async function action({ request }: ActionFunctionArgs) {
    const session = await requireSessionData(request);

    const form = await request.formData();

    return validateForm(
        form,
        createIssueSchema,
        (errors) => json({ errors }, 400),
        async (data) => {
            return rateLimiter
                .consume(session.login, 1)
                .then(async () => {
                    const issue = await db.issue.create({
                        data: {
                            description: data.description,
                            title: data.title,
                            createdAt: new Date().toISOString(),
                        },
                    });

                    return json({ id: issue.id });
                })
                .catch(() => {
                    return json(
                        { errors: { message: 'You tried to create too many issues. Please try again later.' } },
                        { status: 429 },
                    );
                });
        },
    );
}

export default function IssuesNew() {
    const data = useLoaderData<LoaderData>();
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
            <NavBar login={data.session.login} role={data.session.role} />
            <div className='flex justify-center'>
                <div className='flex justify-between mx-4 md:mx-0 md:w-3/5'>
                    <H1 className='my-4 md:w-3/5'>Create a Public Issue</H1>
                    <Link to='/issues'>
                        <Button className='mt-4'>
                            <ChevronLeft />
                            Go Back
                        </Button>
                    </Link>
                </div>
            </div>
                <Separator />
            <div className='md:flex md:justify-center mx-4 md:mx-0'>
                <p className='mt-4 mb-2 md:w-3/5 text-xl'>
                    Open an anonymous issue to discuss what's important to you with the community.
                    <br />
                    If you would like to share your issue with the student council only, please go to the{' '}
                    <Link to='/contact' className='underline'>
                        contact form
                    </Link>
                    .
                </p>
            </div>
            <div className='flex justify-center mt-4 mx-4 md:mx-0'>
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
                    <FormErrorMessage className='mt-2'>{createIssueFetcher.data?.errors?.title}</FormErrorMessage>

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
                        <FormErrorMessage className='mt-2'>
                            {createIssueFetcher.data?.errors?.description}
                        </FormErrorMessage>
                    </div>

                    <Info title='Note' className='mt-4 md:w-3/5'>
                        To maintain complete anonymity, the author of an issue does not get stored.
                        <br />
                        Consequently, <strong>you won't be able to edit</strong> an issue after submitting it.
                    </Info>

                    <Button type='submit' disabled={!!createIssueFetcher.formData} className='mt-4'>
                        {createIssueFetcher.formData ? 'Loading...' : 'Submit Issue'}
                    </Button>
                    <FormErrorMessage className='mt-2'>{createIssueFetcher.data?.errors?.message}</FormErrorMessage>
                </createIssueFetcher.Form>
            </div>
        </div>
    );
}
