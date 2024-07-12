import { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, useFetcher, useLoaderData, useNavigate } from '@remix-run/react';
import classNames from 'classnames';
import { Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { FormErrorMessage } from '~/components/FormErrorMessage';
import NavBar from '~/components/NavBar';
import { Warning } from '~/components/alert/Warning';
import { H1 } from '~/components/ui/H1';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
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
    contactWay: z.enum(['discord', 'email', 'nothing']),
    contactDetail: z.optional(z.string().email().max(255, 'Email must be at most 255 characters long.')),
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
            try {
                await sendDiscordWebhook({
                    embeds: [
                        {
                            author: {
                                name: session.login,
                                url: `https://profile.intra.42.fr/users/${session.login}`,
                                icon_url: session.imageUrl,
                            },
                            color: 0xffe135,
                            description: data.message,
                            fields: [
                                {
                                    name: 'Contact Way',
                                    value: `${data.contactWay === 'discord' ? 'Discord' : data.contactWay === 'email' ? `Email: ${data.contactDetail}` : 'No need to contact the student.'}`,
                                },
                            ],
                            title: 'New Contact Request',
                        },
                    ],
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

            return json({ success: true, contactWay: data.contactWay });
        },
    );
}

export default function Contact() {
    const data = useLoaderData<SessionData>();

    const contactFetcher = useFetcher<{
        errors?: { contactWay?: string; contactDetail?: string; message?: string; discordError?: string };
        success?: boolean;
        contactWay?: string;
    }>();

    const [message, setMessage] = useState('');
    const [contactOption, setContactOption] = useState('discord');
    const [contactDetail, setContactDetail] = useState(`${data.login}@student.42vienna.com`);

    useEffect(() => {
        if (contactFetcher.data?.success) {
            setMessage('');
            setContactOption('discord');
            setContactDetail(`${data.login}@student.42vienna.com`);
            localStorage.removeItem('contact-message');
        }
    }, [contactFetcher.data?.success]);

    useEffect(() => {
        const savedMessage = localStorage.getItem('contact-message');
        if (savedMessage) setMessage(savedMessage);
    }, []);

    useEffect(() => {
        localStorage.setItem('contact-message', message);
    }, [message]);

    return (
        <div>
            <NavBar login={data.login} role={data.role} />
            <div className='md:flex md:justify-center'>
                <H1 className='m-4 md:w-3/5'>Contact the Student Council</H1>
            </div>
            <Separator />
            <div className='md:flex md:justify-center'>
                <p className='mt-4 mx-4 md:w-3/5'>
                    Do you have an issue or suggestion you would like to stay private? Use this contact form.
                </p>
            </div>
            <div className='flex justify-center mt-4 mx-8 mb-4'>
                <contactFetcher.Form className='md:w-3/5' method='post'>
                    <div className='mt-4'>
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
                        <FormErrorMessage className='mt-1'>{contactFetcher.data?.errors?.message}</FormErrorMessage>
                    </div>

                    <div className='mt-4'>
                        <Label htmlFor='message' className='text-lg'>
                            How should we reach out to you?
                        </Label>

                        <RadioGroup
                            defaultValue={contactOption}
                            name='contactWay'
                            onValueChange={setContactOption}
                            className='pt-1'
                        >
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='discord' id='discord' />
                                <Label htmlFor='discord'>Discord</Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='email' id='email' />
                                <Label htmlFor='email'>Email</Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='nothing' id='nothing' />
                                <Label htmlFor='nothing'>No follow-up needed</Label>
                            </div>
                        </RadioGroup>

                        {contactOption === 'email' && (
                            <div className='mt-2'>
                                <Label htmlFor='how-to-contact'>We need your info in order to get back to you:</Label>
                                <Input
                                    type='email'
                                    name='contactDetail'
                                    required
                                    autoComplete='on'
                                    maxLength={255}
                                    placeholder='Please enter your email'
                                    value={contactDetail}
                                    onChange={(e) => setContactDetail(e.target.value)}
                                    className={classNames({
                                        'border-red-600': !!contactFetcher.data?.errors?.contactDetail,
                                    })}
                                />
                                <FormErrorMessage className='mt-1'>
                                    {contactFetcher.data?.errors?.contactDetail}
                                </FormErrorMessage>
                            </div>
                        )}
                    </div>

                    <Warning title='Important' className='mt-4 w-auto'>
                        Contacting is <span className='font-bold uppercase'>not anonymous</span>. We will store your
                        data so we can get back to you.
                    </Warning>

                    <Button
                        type='submit'
                        variant='secondary'
                        disabled={!!contactFetcher.formData || !!contactFetcher.data?.success}
                        className='mt-4'
                    >
                        {contactFetcher.formData ? 'Loading...' : 'Send Message'}
                    </Button>
                    <FormErrorMessage className='mt-2'>{contactFetcher.data?.errors?.discordError}</FormErrorMessage>
                    {contactFetcher.data?.success && (
                        <p className='text-green-600 text-xs mt-1'>
                            {contactFetcher.data?.contactWay !== 'nothing'
                                ? 'We have received your message, we will get back to you soon!'
                                : 'We have received your message.'}
                        </p>
                    )}
                </contactFetcher.Form>
            </div>
        </div>
    );
}
