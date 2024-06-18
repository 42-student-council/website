import { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import NavBar from '~/components/NavBar';
import { H1 } from '~/components/ui/H1';
import { H3 } from '~/components/ui/H3';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { requireSessionData } from '~/utils/session.server';

export const meta: MetaFunction = () => {
    return [{ title: 'About the Student Council' }, { name: 'description', content: 'Who is the student council?' }];
};

function shuffle(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));

        [array[i], array[j]] = [array[j], array[i]];
    }
}

// TODO: Get dynamically from backend
export async function loader({ request }: LoaderFunctionArgs) {
    await requireSessionData(request);

    const res = await fetch(`${process.env.API_BASE_URL}/council-members`);

    if (!res.ok) {
        throw new Error('Failed to fetch council members');
    }

    const data: LoaderData = await res.json();

    shuffle(data);

    return data;
}

type LoaderData = {
    first_name: string;
    last_name: string;
    login: string;
    email: string;
    profile_picture: string;
}[];

export default function About() {
    const data = useLoaderData<LoaderData>();

    return (
        <div>
            <NavBar />
            <div className='mb-8 md:mb-16 md:mt-16 flex flex-col items-center'>
                <H1 className='mt-4 mb-2 text-center'>Student Council</H1>
                <p className='mx-4 text-lg'>(In random order.)</p>
            </div>
            <div className='flex flex-col md:flex-row md:flex-wrap md:justify-center md:mx-24'>
                {data.map((member) => (
                    <div key={member.email} className='md:w-1/4 md:mx-20 flex flex-col items-center mb-8'>
                        <Avatar className='rounded-xl size-60'>
                            <AvatarImage src={member.profile_picture} />
                            <AvatarFallback>{member.first_name.slice(0, 2)}</AvatarFallback>
                        </Avatar>

                        <H3 className='mt-4'>
                            {member.first_name} {member.last_name}
                        </H3>

                        {/* <div className='mt-4'>
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
                        </div> */}
                    </div>
                ))}
            </div>
        </div>
    );
}
