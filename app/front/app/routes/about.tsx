import { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import NavBar from '~/components/NavBar';
import { H1 } from '~/components/ui/H1';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { requireSessionData } from '~/utils/session.server';

export const meta: MetaFunction = () => {
    return [{ title: 'About the Student Council' }, { name: 'description', content: 'Who is the student council?' }];
};

// TODO: Get dynamically from backend
export async function loader({ request }: LoaderFunctionArgs) {
    await requireSessionData(request);

    const res: LoaderData = [];

    for (let i = 0; i < 5; i++) {
        res.push({
            firstName: 'Arthur',
            lastName: 'Charreton',
            role: 'President',
            login: 'abied-ch',
            email: 'abied-ch@student.42vienna.com',
            profilePicture: 'https://cdn.intra.42.fr/users/63a26445a8ea9dce5ccd500d357af796/abied-ch.jpg',
        });
    }

    return res;
}

type LoaderData = {
    firstName: string;
    lastName: string;
    role: string;
    login: string;
    email: string;
    profilePicture: string;
}[];

export default function About() {
    const data = useLoaderData<LoaderData>();

    return (
        <div>
            <NavBar />
            <div className='mb-8 md:mb-16 md:mt-16'>
                <H1 className='mt-4 mb-2 text-center'>Student Council</H1>
            </div>
            <div className='flex flex-col md:flex-row md:flex-wrap md:justify-center md:mx-24'>
                {data.map((member) => (
                    <div key={member.email} className='md:w-1/4 md:mx-20 flex flex-col items-center mb-8'>
                        <Avatar className='rounded-xl size-60'>
                            <AvatarImage src={member.profilePicture} />
                            <AvatarFallback>{member.firstName.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <p className='text-xl mt-4 text-center'>{member.role}</p>

                        <H1 className='mt-4'>
                            {member.firstName} {member.lastName}
                        </H1>

                        <div className='mt-4'>
                            <p className='text-lg'>
                                E-Mail:
                                <Button variant='link' className='pb-0 text-base'>
                                    <a href={`mailto:${member.email}`}>{member.email}</a>
                                </Button>
                            </p>
                            <p className='text-lg'>
                                Intra:
                                <Button variant='link' className='pt-0 text-base'>
                                    <Link to={`https://profile.intra.42.fr/users/${member.login}`} target='_blank'>
                                        {member.login}
                                    </Link>
                                </Button>
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
