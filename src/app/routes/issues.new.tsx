import { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, useFetcher, useNavigate, Link, useLoaderData } from '@remix-run/react';
import classNames from 'classnames';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { useEffect, useState, useRef } from 'react';
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
import { sendDiscordWebhookWithUrl } from '~/utils/discord.server';
import { config } from '~/utils/config.server';

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
    const data = useLoaderData<LoaderData>();
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

    const [titleLength, setTitleLength] = useState(0);
    const [descriptionLength, setDescriptionLength] = useState(0);
    const [showTitleWarning, setShowTitleWarning] = useState(false);
    const [showDescriptionWarning, setShowDescriptionWarning] = useState(false);

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
        if (savedTitle) {
            setTitle(savedTitle);
            setTitleLength(savedTitle.length);
        }
        if (savedDescription) {
            setDescription(savedDescription);
            setDescriptionLength(savedDescription.length);
        }
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

        if (descriptionRef.current) {
            adjustTextareaHeight(descriptionRef.current);
        }
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

    const adjustTextareaHeight = (textarea) => {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
        textarea.style.minHeight = '192px'; // Default height (48 * 4)
    };

    const handleTitleChange = (e) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        setTitleLength(newTitle.length);

        if (newTitle.length <= TITLE_MAX_LENGTH) {
            setShowTitleWarning(false);
        }
    };

    const handleTitleKeyPress = (e) => {
        const isPrintableKey = e.key.length === 1;

        if (title.length >= TITLE_MAX_LENGTH && isPrintableKey) {
            setShowTitleWarning(true);
        }
    };

    const handleDescriptionChange = (e) => {
        const newDescription = e.target.value;
        setDescription(newDescription);
        setDescriptionLength(newDescription.length);

        if (newDescription.length <= DESCRIPTION_MAX_LENGTH) {
            setShowDescriptionWarning(false);
        }
    };

    const handleDescriptionKeyPress = (e) => {
        const isPrintableKey = e.key.length === 1;

        if (description.length >= DESCRIPTION_MAX_LENGTH && isPrintableKey) {
            setShowDescriptionWarning(true);
        }
    };

    const handleSubmit = (e) => {
        if (!isFormValid || createIssueFetcher.formData) {
            e.preventDefault();
        }
    };

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
            <div className='md:flex md:justify-center mx-4 md:mx-0'>
                <p className='mb-2 md:w-3/5 text-xl'>
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
                <createIssueFetcher.Form className='md:w-3/5' method='post' onSubmit={handleSubmit}>
                    <div className='flex justify-between items-center mb-1'>
                        <Label htmlFor='title' className='text-lg'>
                            Issue Title
                        </Label>
                        <span
                            className={`text-sm ${titleLength === TITLE_MAX_LENGTH ? 'text-red-600' : 'text-gray-500'}`}
                        >
                            {titleLength}/{TITLE_MAX_LENGTH}
                        </span>
                    </div>
                    <Input
                        type='text'
                        name='title'
                        required
                        autoComplete='off'
                        minLength={TITLE_MIN_LENGTH}
                        maxLength={TITLE_MAX_LENGTH}
                        className={classNames({
                            'border-red-600': !!createIssueFetcher.data?.errors?.title || showTitleWarning,
                        })}
                        onChange={handleTitleChange}
                        onKeyDown={handleTitleKeyPress}
                        value={title}
                        ref={titleRef}
                    />
                    {showTitleWarning && <p className='text-red-600 text-sm mt-1'>Maximum title length reached.</p>}
                    <FormErrorMessage className='mt-2'>{createIssueFetcher.data?.errors?.title}</FormErrorMessage>

                    <div className='mt-4'>
                        <div className='flex justify-between items-center mb-1'>
                            <Label htmlFor='description' className='text-lg'>
                                Issue Description
                            </Label>
                            <span
                                className={`text-sm ${descriptionLength === DESCRIPTION_MAX_LENGTH ? 'text-red-600' : 'text-gray-500'}`}
                            >
                                {descriptionLength}/{DESCRIPTION_MAX_LENGTH}
                            </span>
                        </div>
                        <Textarea
                            placeholder="Please describe your issue or suggestion here...
(Currently we don't support markdown for public issues, but we will in the future.)"
                            name='description'
                            className={classNames('h-48', {
                                'border-red-600':
                                    !!createIssueFetcher.data?.errors?.description || showDescriptionWarning,
                            })}
                            required
                            autoComplete='off'
                            minLength={DESCRIPTION_MIN_LENGTH}
                            maxLength={DESCRIPTION_MAX_LENGTH}
                            onChange={(e) => {
                                handleDescriptionChange(e);
                                adjustTextareaHeight(e.target);
                            }}
                            onKeyDown={handleDescriptionKeyPress}
                            value={description}
                            ref={descriptionRef}
                        />
                        {showDescriptionWarning && (
                            <p className='text-red-600 text-sm mt-1'>Maximum description length reached.</p>
                        )}
                        <FormErrorMessage className='mt-2'>
                            {createIssueFetcher.data?.errors?.description}
                        </FormErrorMessage>
                    </div>

                    <Info title='Note' className='mt-4 md:w-3/5'>
                        To maintain complete anonymity, the author of an issue does not get stored.
                        <br />
                        Consequently, <strong>you won't be able to edit</strong> an issue after submitting it.
                    </Info>

                    <Button type='submit' invalid={!isFormValid || !!createIssueFetcher.formData} className='mt-4'>
                        {createIssueFetcher.formData ? 'Loading...' : 'Submit Issue'}
                    </Button>
                    <FormErrorMessage className='mt-2'>{createIssueFetcher.data?.errors?.message}</FormErrorMessage>
                </createIssueFetcher.Form>
            </div>
        </div>
    );
}
