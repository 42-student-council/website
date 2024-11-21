import { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, useFetcher, useLoaderData } from '@remix-run/react';
import classNames from 'classnames';
import { Fragment, useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { FormErrorMessage } from '~/components/FormErrorMessage';
import { H1 } from '~/components/ui/H1';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group';
import { Textarea } from '~/components/ui/textarea';
import { config } from '~/utils/config.server';
import { sendDiscordWebhookWithUrl } from '~/utils/discord.server';
import { SessionData, requireSessionData } from '~/utils/session.server';
import { validateForm } from '~/utils/validation';

export const meta: MetaFunction = () => {
    return [{ title: 'Contact' }, { name: 'description', content: 'Admin Page' }];
};

const MESSAGE_MIN_LENGTH = 10;
const MESSAGE_MAX_LENGTH = 4096;
const EMAIL_MAX_LENGTH = 255;

const createIssueSchema = z.object({
    anonymous: z.enum(['yes', 'no']),
    contactWay: z.optional(z.enum(['discord', 'email', 'nothing'])),
    contactEmail: z.optional(
        z.string().email().max(EMAIL_MAX_LENGTH, `Email must be at most ${EMAIL_MAX_LENGTH} characters long.`),
    ),
    message: z
        .string()
        .min(MESSAGE_MIN_LENGTH, `Message must be at least ${MESSAGE_MIN_LENGTH} characters long.`)
        .max(MESSAGE_MAX_LENGTH, `Message must be at most ${MESSAGE_MAX_LENGTH} characters long.`),
});

export async function loader({ request }: LoaderFunctionArgs) {
    return await requireSessionData(request);
}

export async function action({ request }: ActionFunctionArgs) {
    const session = await requireSessionData(request);

    const form = await request.formData();

    return validateForm(
        form,
        createIssueSchema,
        (errors) => json({ errors }, 400),
        async (data) => {
            const embed = {
                color: 0xffe135,
                description: data.message,
                fields: [] as { name: string; value: string }[],
                title: 'New Contact Request',
                author: undefined as { name: string; url?: string; icon_url?: string } | undefined,
            };

            if (data.anonymous === 'no') {
                embed.author = {
                    name: session.login,
                    url: `https://profile.intra.42.fr/users/${session.login}`,
                    icon_url: session.profilePicture ?? undefined,
                };

                embed.fields.push({
                    name: 'Contact Way',
                    value:
                        data.contactWay === 'discord'
                            ? 'Discord'
                            : data.contactWay === 'email'
                              ? `Email: ${data.contactEmail}`
                              : 'No need to contact the student.',
                });
            } else {
                embed.author = {
                    name: 'Anonymous',
                };
            }

            try {
                await sendDiscordWebhookWithUrl(config.discord.contactWebhookUrl, {
                    embeds: [embed],
                    username: 'Webportal',
                    wait: true,
                });
            } catch (error) {
                console.error(error);

                return json(
                    {
                        errors: {
                            discordError:
                                'An internal server error occurred while sending the message. Please try again.',
                        },
                    },
                    500,
                );
            }

            return json({ success: true, contactWay: data.contactWay, anonymous: data.anonymous });
        },
    );
}

export default function Contact() {
    const data = useLoaderData<SessionData>();

    const contactFetcher = useFetcher<{
        errors?: {
            anonymous?: string;
            contactWay?: string;
            contactEmail?: string;
            message?: string;
            discordError?: string;
        };
        success?: boolean;
        contactWay?: string;
        anonymous?: string;
    }>();

    const [message, setMessage] = useState('');
    const [contactOption, setContactOption] = useState<string>('');
    const [anonymousOption, setAnonymousOption] = useState<string>('');
    const [contactEmail, setContactEmail] = useState<string>(`${data.login}@student.42vienna.com`);
    const [isFormValid, setIsFormValid] = useState(false);
    const [anonymousError, setAnonymousError] = useState<string | null>(null);
    const [contactError, setContactError] = useState<string | null>(null);

    const messageRef = useRef(null);
    const contactEmailRef = useRef(null);

    useEffect(() => {
        if (contactFetcher.data?.success) {
            setMessage('');
            setContactOption('');
            setAnonymousOption('');
            localStorage.removeItem('contact-message');
            localStorage.removeItem('anonymous-option');
            localStorage.removeItem('contact-option');
        }
    }, [contactFetcher.data?.success]);

    useEffect(() => {
        const savedMessage = localStorage.getItem('contact-message');
        if (savedMessage) setMessage(savedMessage);

        const savedAnonymousOption = localStorage.getItem('anonymous-option');
        if (savedAnonymousOption) setAnonymousOption(savedAnonymousOption);

        const savedContactOption = localStorage.getItem('contact-option');
        if (savedContactOption) setContactOption(savedContactOption);

        const savedContactEmail = localStorage.getItem('contact-email');
        if (savedContactEmail) setContactEmail(savedContactEmail);
    }, []);

    useEffect(() => {
        if (messageRef.current) {
            messageRef.current.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (contactEmailRef.current) {
            contactEmailRef.current.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }, [message, contactEmail]);

    useEffect(() => {
        localStorage.setItem('contact-message', message);
    }, [message]);

    useEffect(() => {
        if (anonymousOption) {
            localStorage.setItem('anonymous-option', anonymousOption);
        }
        if (anonymousOption) {
            setAnonymousError(null);
        }
    }, [anonymousOption]);

    useEffect(() => {
        if (contactOption) {
            localStorage.setItem('contact-option', contactOption);
        }
        if (contactOption) {
            setContactError(null);
        }
    }, [contactOption]);

    useEffect(() => {
        if (!contactEmail || contactEmail === `${data.login}@student.42vienna.com`) {
            localStorage.removeItem('contact-email');
        } else {
            localStorage.setItem('contact-email', contactEmail);
        }
    }, [contactEmail]);

    useEffect(() => {
        let isMessageValid = true;
        try {
            createIssueSchema.shape.message.parse(message);
        } catch (e) {
            isMessageValid = false;
        }

        const isContactValid = anonymousOption === 'yes' || (anonymousOption === 'no' && contactOption);

        let isEmailValid = true;
        if (contactOption === 'email') {
            try {
                createIssueSchema.shape.contactEmail.parse(contactEmail);
            } catch (e) {
                isEmailValid = false;
            }
        }

        setIsFormValid(isMessageValid && isContactValid && isEmailValid);
    }, [message, anonymousOption, contactOption, contactEmail]);

    const handleSubmit = (e) => {
        let hasError = false;

        if (!anonymousOption) {
            setAnonymousError('Please select an option.');
            hasError = true;
        } else {
            setAnonymousError(null);
        }

        if (anonymousOption === 'no' && !contactOption) {
            setContactError('Please select an option.');
            hasError = true;
        } else {
            setContactError(null);
        }

        if (hasError || !isFormValid || contactFetcher.formData) {
            e.preventDefault();
        }
    };

    return (
        <Fragment>
            <H1>Contact the Student Council</H1>
            <p className='mt-4 text-xl'>
                Do you have an issue or suggestion you would like to tell us in private? Use this contact form.
            </p>
            <contactFetcher.Form className='mt-4 w-full' method='post' onSubmit={handleSubmit}>
                <div className='mt-2'>
                    <Label htmlFor='message' className='text-lg'>
                        What would you like to tell us?
                    </Label>
                    <Textarea
                        id='message'
                        placeholder='Please describe your issue or suggestion here... (Markdown is supported.)'
                        name='message'
                        className={classNames('h-48 mt-2', {
                            'border-red-600': !!contactFetcher.data?.errors?.message,
                        })}
                        required
                        autoComplete='off'
                        minLength={MESSAGE_MIN_LENGTH}
                        maxLength={MESSAGE_MAX_LENGTH}
                        onChange={(e) => setMessage(e.target.value)}
                        value={message}
                        ref={messageRef}
                    />
                    <FormErrorMessage className='mt-2'>{contactFetcher.data?.errors?.message}</FormErrorMessage>
                </div>

                <div className='mt-4'>
                    <Label htmlFor='anonymous' className='text-lg'>
                        Do you wish to stay anonymous?
                    </Label>

                    <RadioGroup
                        value={anonymousOption}
                        name='anonymous'
                        onValueChange={setAnonymousOption}
                        className='mt-2'
                    >
                        <div className='inline-flex'>
                            <Label className='inline-flex items-center space-x-2 cursor-pointer'>
                                <RadioGroupItem value='yes' id='yes' />
                                <span>Yes</span>
                            </Label>
                        </div>
                        <div className='inline-flex'>
                            <Label className='inline-flex items-center space-x-2 cursor-pointer'>
                                <RadioGroupItem value='no' id='no' />
                                <span>No</span>
                            </Label>
                        </div>
                    </RadioGroup>
                    {anonymousError && <FormErrorMessage className='mt-2'>{anonymousError}</FormErrorMessage>}

                    <fieldset
                        disabled={anonymousOption === 'yes'}
                        className={`${anonymousOption === 'yes' ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                        <div className='mt-4'>
                            <Label htmlFor='contactWay' className='text-lg'>
                                How should we reach out to you?
                            </Label>

                            <RadioGroup
                                value={contactOption}
                                name='contactWay'
                                onValueChange={setContactOption}
                                className='mt-2'
                            >
                                <div className='inline-flex'>
                                    <Label className='inline-flex items-center space-x-2 cursor-pointer'>
                                        <RadioGroupItem value='discord' id='discord' />
                                        <span>Discord</span>
                                    </Label>
                                </div>
                                <div className='inline-flex'>
                                    <Label className='inline-flex items-center space-x-2 cursor-pointer'>
                                        <RadioGroupItem value='email' id='email' />
                                        <span>Email</span>
                                    </Label>
                                </div>
                                <div className='inline-flex'>
                                    <Label className='inline-flex items-center space-x-2 cursor-pointer'>
                                        <RadioGroupItem value='nothing' id='nothing' />
                                        <span>No follow-up needed</span>
                                    </Label>
                                </div>
                            </RadioGroup>
                            {contactError && <FormErrorMessage className='mt-2'>{contactError}</FormErrorMessage>}

                            {contactOption === 'email' && (
                                <div className='mt-3'>
                                    <Label htmlFor='contactEmail'>We need your info in order to get back to you:</Label>
                                    <Input
                                        id='contactEmail'
                                        type='email'
                                        name='contactEmail'
                                        required
                                        autoComplete='on'
                                        maxLength={EMAIL_MAX_LENGTH}
                                        placeholder='Please enter your email'
                                        value={contactEmail}
                                        onChange={(e) => setContactEmail(e.target.value)}
                                        className={classNames('mt-1', {
                                            'border-red-600': !!contactFetcher.data?.errors?.contactEmail,
                                        })}
                                        ref={contactEmailRef}
                                    />
                                    <FormErrorMessage className='mt-2'>
                                        {contactFetcher.data?.errors?.contactEmail}
                                    </FormErrorMessage>
                                </div>
                            )}
                        </div>
                    </fieldset>
                </div>

                <Button
                    type='submit'
                    invalid={!isFormValid || !!contactFetcher.formData || !!contactFetcher.data?.success}
                    className='mt-4'
                >
                    {contactFetcher.formData ? 'Loading...' : 'Send Message'}
                </Button>
                <FormErrorMessage className='mt-2'>{contactFetcher.data?.errors?.discordError}</FormErrorMessage>
                {contactFetcher.data?.success && (
                    <p className='text-green-600 text-xs mt-2'>
                        {contactFetcher.data?.anonymous === 'no' && contactFetcher.data?.contactWay !== 'nothing'
                            ? 'We have received your message, we will get back to you soon!'
                            : 'We have received your message.'}
                    </p>
                )}
            </contactFetcher.Form>
        </Fragment>
    );
}
