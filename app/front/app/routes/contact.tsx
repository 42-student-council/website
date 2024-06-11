import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, useFetcher, useLoaderData, useNavigate } from '@remix-run/react';
import classNames from 'classnames';
import { Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { FormErrorMessage } from '~/components/FormErrorMessage';
import NavBar from '~/components/NavBar';
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

const createIssueSchema = z.object({
    contactWay: z.enum(['discord', 'email']),
    contactDetail: z.optional(z.string().email().max(255, 'E-Mail must be at most 255 characters long.')),
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
                                    value: `${data.contactWay === 'discord' ? 'Discord' : `E-Mail: ${data.contactDetail}`}`,
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

            return json({ success: true });
        },
    );
}

export default function Contact() {
    const data = useLoaderData<SessionData>();

    const contactFetcher = useFetcher<{
        errors?: { contactWay?: string; contactDetail?: string; message?: string; discordError?: string };
        success?: boolean;
    }>();

    if (contactFetcher.data?.success === true) {
        localStorage.removeItem('contact-message');
    }

    const [message, setMessage] = useState('');

    useEffect(() => {
        const savedMessage = localStorage.getItem('contact-message');
        if (savedMessage) setMessage(savedMessage);
    }, []);

    useEffect(() => {
        localStorage.setItem('contact-message', message);
    }, [message]);

    const [contactOption, setContactOption] = useState('discord');

    return (
        <div>
            <NavBar />
            <div className='md:flex md:justify-center'>
                <H1 className='m-4 md:w-3/5'>Contact The Student Council</H1>
            </div>
            <Separator />
            <div className='md:flex md:justify-center'>
                <p className='mt-4 mx-4 md:w-3/5'>
                    Do you have an issue you would like to stay private? Contact us directly instead. We will try to
                    help you as soon as possible.
                </p>
            </div>
            <div className='flex justify-center mt-4 mx-8 mb-4'>
                <contactFetcher.Form className='md:w-3/5' method='post'>
                    <div className='mt-4'>
                        <Label htmlFor='message' className='text-lg'>
                            What do you want to tell us?
                        </Label>
                        <Textarea
                            placeholder='Please describe your issue here. Markdown is supported.'
                            name='message'
                            className={classNames('h-48', {
                                'border-red-600': !!contactFetcher.data?.errors?.message,
                            })}
                            required
                            autoComplete='off'
                            minLength={10}
                            maxLength={4096}
                            onChange={(e) => setMessage(e.target.value)}
                            defaultValue={message}
                        />
                        <FormErrorMessage className='mt-1'>{contactFetcher.data?.errors?.message}</FormErrorMessage>
                    </div>

                    <RadioGroup
                        defaultValue={contactOption}
                        name='contactWay'
                        onValueChange={setContactOption}
                        className='mt-4'
                    >
                        <div className='flex items-center space-x-2'>
                            <RadioGroupItem value='discord' />
                            <Label htmlFor='discord'>Discord</Label>
                        </div>
                        <div className='flex items-center space-x-2'>
                            <RadioGroupItem value='email' />
                            <Label htmlFor='email'>E-Mail</Label>
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
                                placeholder='Please enter your E-Mail'
                                defaultValue={`${data.login}@student.42vienna.com`}
                                className={classNames({
                                    'border-red-600': !!contactFetcher.data?.errors?.contactDetail,
                                })}
                            />
                            <FormErrorMessage className='mt-1'>
                                {contactFetcher.data?.errors?.contactDetail}
                            </FormErrorMessage>
                        </div>
                    )}

                    <Alert variant='destructive' className='mt-4 w-auto'>
                        <Info className='h-4 w-4' />
                        <AlertTitle>Important</AlertTitle>
                        <AlertDescription>
                            We will store your data so we can contact you. If you want to raise concerns anonymously,
                            please open an issue.
                            <br />
                            Contacting is <span className='font-bold uppercase'>not anonymous</span>.
                        </AlertDescription>
                    </Alert>
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
                            We have received your message, we will get back to you soon!
                        </p>
                    )}
                </contactFetcher.Form>
            </div>
        </div>
    );
}
