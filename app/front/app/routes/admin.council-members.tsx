import { ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import classNames from 'classnames';
import { Info, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { FormErrorMessage } from '~/components/FormErrorMessage';
import { H3 } from '~/components/ui/H3';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { getAccessToken } from '~/utils/oauth.server';
import { requireAdmin } from '~/utils/session.server';
import { validateForm } from '~/utils/validation';

export async function action({ request }: ActionFunctionArgs) {
    await requireAdmin(request);

    const formData = await request.formData();
    const action = formData.get('_action');

    switch (action) {
        case 'add': {
            return validateForm(
                formData,
                addCouncilMemberSchema,
                (errors) => json({ errors }, 400),
                async (data) => {
                    const token = await getAccessToken();

                    // TODO: check for existing
                    // TODO: check for vulnerability
                    const res = await fetch(`https://api.intra.42.fr/v2/users/${encodeURIComponent(data.newLogin)}/`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (!res.ok) {
                        return json({ errors: { newLogin: 'User not found' } }, 400);
                    }

                    const user = await res.json();

                    const addMember = await fetch(`${process.env.API_BASE_URL}/council-members/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            login: user.login,
                            first_name: user.first_name,
                            last_name: user.last_name,
                            email: user.email,
                            profile_picture: user.image.link,
                        }),
                    });

                    if (!addMember.ok) {
                        return json({ errors: { newLogin: 'Failed to add council member' } }, 400);
                    }

                    return user;
                },
            );
        }
        case 'delete': {
            return validateForm(
                formData,
                deleteCouncilMemberSchema,
                (errors) => json({ errors }, 400),
                async (data) => {
                    const res = await fetch(`${process.env.API_BASE_URL}/council-members/${data.login}`, {
                        method: 'DELETE',
                    });

                    if (!res.ok) {
                        return json({ errors: { login: 'Failed to delete council member' } }, 400);
                    }

                    return json({ success: true });
                },
            );
        }
        default:
            console.log(formData);
            throw new Error('Invalid action');
    }
}

const addCouncilMemberSchema = z.object({
    newLogin: z
        .string()
        .min(3, 'Login must be at least 3 characters long.')
        .max(20, 'Login must be at most 20 characters long.'),
});

const deleteCouncilMemberSchema = z.object({
    login: z.string(),
});

export async function loader() {
    const res = await fetch(`${process.env.API_BASE_URL}/council-members`);

    if (!res.ok) {
        throw new Error('Failed to fetch council members');
    }

    const data: LoaderData = await res.json();

    return data.sort((a, b) => a.first_name.localeCompare(b.first_name));
}

type LoaderData = {
    login: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_picture: string;
}[];

function CouncilMember({
    login,
    firstName,
    lastName,
    ...props
}: { login: string; firstName: string; lastName: string } & React.HTMLAttributes<HTMLDivElement>) {
    const deleteFetcher = useFetcher<{ errors?: { login?: string } }>();

    return (
        <div {...props}>
            <div className='flex flex-row justify-between'>
                <div>
                    {firstName} {lastName} - {login}
                </div>
                <deleteFetcher.Form method='post'>
                    <input type='hidden' name='_action' value='delete' />
                    <input type='hidden' name='login' value={login} />
                    <button type='submit'>
                        <Trash2 className='text-red-500' />
                    </button>
                </deleteFetcher.Form>
            </div>

            <FormErrorMessage className='mt-1'>{deleteFetcher.data?.errors?.login}</FormErrorMessage>
        </div>
    );
}

export default function AdminCouncilMembers() {
    const addCouncilMemberFetcher = useFetcher<{ errors?: { newLogin?: string } }>();

    const data = useLoaderData<LoaderData>();

    return (
        <div className='flex flex-col items-center min-h-screen'>
            <div className='md:size-6/12'>
                <div className='flex flex-col m-4'>
                    <H3 className='mb-4'>Add Council Member</H3>
                    <addCouncilMemberFetcher.Form method='post'>
                        <div className='flex flex-row'>
                            <Input placeholder='Login' name='newLogin' autoComplete='off' required />
                            <Button type='submit' name='_action' value='add' className='ml-4'>
                                Add
                            </Button>
                        </div>
                        <FormErrorMessage className='mt-1'>
                            {addCouncilMemberFetcher.data?.errors?.newLogin}
                        </FormErrorMessage>
                        <p></p>
                    </addCouncilMemberFetcher.Form>
                    <Alert variant='destructive' className='mt-4 w-auto'>
                        <Info className='h-4 w-4' />
                        <AlertTitle>Warning!</AlertTitle>
                        <AlertDescription>
                            Student Council members will automatically have{' '}
                            <span className='font-bold uppercase'>Administrator</span> access to this website.
                            <br />
                            Please make sure to only add real student council members, and don't add someone for
                            trolling.
                        </AlertDescription>
                    </Alert>
                </div>
                <div className='flex flex-col m-4'>
                    <H3 className='mb-2'>Current Council Members</H3>
                    {data.map((member, i) => (
                        <CouncilMember
                            key={member.login}
                            login={member.login}
                            firstName={member.first_name}
                            lastName={member.last_name}
                            className={classNames('p-2 rounded', {
                                'bg-gray-100': i % 2 === 0,
                            })}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
