import { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, Link, useFetcher, useNavigate } from '@remix-run/react';
import classNames from 'classnames';
import { ChevronLeft } from 'lucide-react';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Fragment, useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { FormErrorMessage } from '~/components/FormErrorMessage';
import { Info } from '~/components/alert/Info';
import { H1 } from '~/components/ui/H1';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { config } from '~/utils/config.server';
import { db } from '~/utils/db.server';
import { sendDiscordWebhookWithUrl } from '~/utils/discord.server';
import { requireSessionData } from '~/utils/session.server';
import { validateForm } from '~/utils/validation';

const TITLE_MIN_LENGTH = 5;
const TITLE_MAX_LENGTH = 50;
const DESCRIPTION_MIN_LENGTH = 10;
const DESCRIPTION_MAX_LENGTH = 4096;

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
        .min(TITLE_MIN_LENGTH, `Title must be at least ${TITLE_MIN_LENGTH} characters long.`)
        .max(TITLE_MAX_LENGTH, `Title must be at most ${TITLE_MAX_LENGTH} characters long.`),
    description: z
        .string()
        .min(DESCRIPTION_MIN_LENGTH, `Description must be at least ${DESCRIPTION_MIN_LENGTH} characters long.`)
        .max(DESCRIPTION_MAX_LENGTH, `Description must be at most ${DESCRIPTION_MAX_LENGTH} characters long.`),
});

export async function loader({ request }: LoaderFunctionArgs) {
    const session = await requireSessionData(request);

    return { session };
}

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

                    await sendDiscordWebhookWithUrl(config.discord.councilServerIssueWebhookUrl, {
                        thread_name: `${data.title} - #${issue.id}`,
                        content: `[Link](${config.baseUrl}/issues/${issue.id})`,
                        embeds: [
                            {
                                color: 0x22c55e,
                                description: data.description,
                            },
                        ],
                        wait: true,
                    })
                        .then(
                            async (res) =>
                                await db.issue.update({
                                    where: { id: issue.id },
                                    data: { councilDiscordMessageId: BigInt(res.id) },
                                }),
                        )
                        .catch(console.error);

                    await sendDiscordWebhookWithUrl(config.discord.studentServerIssueWebhookUrl, {
                        thread_name: `${data.title} - #${issue.id}`,
                        content: `[A new issue has been opened on the Student Council Website](<${config.baseUrl}/issues/${issue.id}>)`,
                        wait: true,
                    })
                        .then(
                            async (res) =>
                                await db.issue.update({
                                    where: { id: issue.id },
                                    data: { studentDiscordMessageId: BigInt(res.id) },
                                }),
                        )
                        .catch(console.error);

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
    const createIssueFetcher = useFetcher<{
        errors?: { title?: string; description?: string; message?: string };
        id?: number;
    }>();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isFormValid, setIsFormValid] = useState(false);

    const titleRef = useRef(null);
    const descriptionRef = useRef(null);

    useEffect(() => {
        if (createIssueFetcher.data?.id != undefined) {
            localStorage.removeItem('create-issue-title');
            localStorage.removeItem('create-issue-description');
            navigate(`/issues/${createIssueFetcher.data.id}`);
        }
    }, [createIssueFetcher.data, navigate]);

    useEffect(() => {
        const savedTitle = localStorage.getItem('create-issue-title');
        const savedDescription = localStorage.getItem('create-issue-description');
        if (savedTitle) setTitle(savedTitle);
        if (savedDescription) setDescription(savedDescription);
    }, []);

    useEffect(() => {
        if (titleRef.current) {
            titleRef.current.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (descriptionRef.current) {
            descriptionRef.current.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }, [title, description]);

    useEffect(() => {
        localStorage.setItem('create-issue-title', title);
    }, [title]);

    useEffect(() => {
        localStorage.setItem('create-issue-description', description);
    }, [description]);

    useEffect(() => {
        let isTitleValid = true;
        try {
            createIssueSchema.shape.title.parse(title);
        } catch (e) {
            isTitleValid = false;
        }

        let isDescriptionValid = true;
        try {
            createIssueSchema.shape.description.parse(description);
        } catch (e) {
            isDescriptionValid = false;
        }

        setIsFormValid(isTitleValid && isDescriptionValid);
    }, [title, description]);

    const handleSubmit = (e) => {
        if (!isFormValid || createIssueFetcher.formData) {
            e.preventDefault();
        }
    };

    return (
        <Fragment>
            <div className='flex justify-between items-start'>
                <H1>Create a Public Issue</H1>
                <Link to='/issues'>
                    <Button>
                        <ChevronLeft />
                        Go Back
                    </Button>
                </Link>
            </div>
            <p className='mt-4 text-xl'>
                Open an anonymous issue to discuss what's important to you with the community.
                <br />
                If you would like to share your issue with the student council only, please go to the{' '}
                <Link to='/contact' className='underline'>
                    contact form
                </Link>
                .
            </p>
            <createIssueFetcher.Form className='mt-6' method='post' onSubmit={handleSubmit}>
                <Label htmlFor='title' className='text-lg'>
                    Issue Title
                </Label>
                <Input
                    type='text'
                    name='title'
                    required
                    autoComplete='off'
                    minLength={TITLE_MIN_LENGTH}
                    maxLength={TITLE_MAX_LENGTH}
                    className={classNames({ 'border-red-600': !!createIssueFetcher.data?.errors?.title })}
                    onChange={(e) => setTitle(e.target.value)}
                    defaultValue={title}
                    ref={titleRef}
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
                        minLength={DESCRIPTION_MIN_LENGTH}
                        maxLength={DESCRIPTION_MAX_LENGTH}
                        onChange={(e) => setDescription(e.target.value)}
                        defaultValue={description}
                        ref={descriptionRef}
                    />
                    <FormErrorMessage className='mt-2'>{createIssueFetcher.data?.errors?.description}</FormErrorMessage>
                </div>

                <Info title='Note' className='mt-4'>
                    To maintain complete anonymity, the author of an issue does not get stored.
                    <br />
                    Consequently, <strong>you won't be able to edit</strong> an issue after submitting it.
                </Info>

                <Button type='submit' invalid={!isFormValid || !!createIssueFetcher.formData} className='mt-4'>
                    {createIssueFetcher.formData ? 'Loading...' : 'Submit Issue'}
                </Button>
                <FormErrorMessage className='mt-2'>{createIssueFetcher.data?.errors?.message}</FormErrorMessage>
            </createIssueFetcher.Form>
        </Fragment>
    );
}
