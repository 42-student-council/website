import { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, useFetcher, useLoaderData } from '@remix-run/react';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { FormErrorMessage } from '~/components/FormErrorMessage';
import NavBar from '~/components/NavBar';
import { H1 } from '~/components/ui/H1';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group';
import { Separator } from '~/components/ui/separator';
import { Textarea } from '~/components/ui/textarea';
import { sendDiscordWebhook } from '~/utils/discord.server';
import { SessionData, requireSessionData } from '~/utils/session.server';
import { validateForm } from '~/utils/validation';

export const meta: MetaFunction = () => {
    return [{ title: 'Contact' }, { name: 'description', content: 'Admin Page' }];
};

const createIssueSchema = z.object({
    anonymous: z.enum(['yes', 'no']),
    contactWay: z.optional(z.enum(['discord', 'email', 'nothing'])),
    contactEmail: z.optional(z.string().email().max(255, 'Email must be at most 255 characters long.')),
    message: z
        .string()
        .min(10, 'Message must be at least 10 characters long.')
        .max(4096, 'Message must be at most 4096 characters long.'),
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
                author: undefined as any,
            };

            if (data.anonymous === 'no') {
                embed.author = {
                    name: session.login,
                    url: `https://profile.intra.42.fr/users/${session.login}`,
                };

                embed.fields.push({
                    name: 'Contact Way',
                    value: `${data.contactWay === 'discord' ? 'Discord' : data.contactWay === 'email' ? `Email: ${data.contactEmail}` : 'No need to contact the student.'}`,
                });
            } else {
                embed.author = {
                    name: 'Anonymous',
                };
            }

            try {
                await sendDiscordWebhook({
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

    useEffect(() => {
        if (contactFetcher.data?.success) {
            setMessage('');
            setContactOption('');
            setAnonymousOption('');
            setContactEmail(`${data.login}@student.42vienna.com`);
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
        localStorage.setItem('contact-message', message);
    }, [message]);

    useEffect(() => {
        if (anonymousOption) {
            localStorage.setItem('anonymous-option', anonymousOption);
        }
    }, [anonymousOption]);

    useEffect(() => {
        if (contactOption) {
            localStorage.setItem('contact-option', contactOption);
        }
    }, [contactOption]);

    useEffect(() => {
        if (!contactEmail || contactEmail === `${data.login}@student.42vienna.com`) {
            localStorage.removeItem('contact-email');
        } else {
            localStorage.setItem('contact-email', contactEmail);
        }
    }, [contactEmail]);

    const isFormValid = anonymousOption === 'yes' || (anonymousOption === 'no' && contactOption !== null);

    return (
        <div>
            <NavBar login={data.login} role={data.role} />
            <div className='md:flex md:justify-center mx-4 md:mx-0'>
                <H1 className='my-4 md:w-3/5'>Contact the Student Council</H1>
            </div>
            <Separator />
            <div className='md:flex md:justify-center mx-4 md:mx-0'>
                <p className='mt-4 md:w-3/5 text-xl'>
                    Do you have an issue or suggestion you would like to tell us in private? Use this contact form.
                </p>
            </div>
            <div className='flex justify-center mt-4 mb-4 mx-4 md:mx-0'>
                <contactFetcher.Form className='md:w-3/5' method='post'>
                    <div className='mt-2'>
                        <Label htmlFor='message' className='text-lg'>
                            What would you like to tell us?
                        </Label>
                        <Textarea
                            placeholder='Please describe your issue or suggestion here... (Markdown is supported.)'
                            name='message'
                            className={classNames('h-48', {
                                'border-red-600': !!contactFetcher.data?.errors?.message,
                            })}
                            required
                            autoComplete='off'
                            minLength={10}
                            maxLength={4096}
                            onChange={(e) => setMessage(e.target.value)}
                            value={message}
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
                            className='pt-1'
                            required
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
                                    className='pt-1'
                                    required={anonymousOption === 'no'}
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

                                {contactOption === 'email' && (
                                    <div className='mt-2'>
                                        <Label htmlFor='contactEmail'>
                                            We need your info in order to get back to you:
                                        </Label>
                                        <Input
                                            type='email'
                                            name='contactEmail'
                                            required
                                            autoComplete='on'
                                            maxLength={255}
                                            placeholder='Please enter your email'
                                            value={contactEmail}
                                            onChange={(e) => setContactEmail(e.target.value)}
                                            className={classNames({
                                                'border-red-600': !!contactFetcher.data?.errors?.contactEmail,
                                            })}
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
                        disabled={!isFormValid || !!contactFetcher.formData || !!contactFetcher.data?.success}
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
            </div>
        </div>
    );
}
