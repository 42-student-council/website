import { Prisma } from '@prisma/client';
import { LoaderFunctionArgs, MetaFunction, Session } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import NavBar from '~/components/NavBar';
import { H1 } from '~/components/ui/H1';
import { H2 } from '~/components/ui/H2';
import { H3 } from '~/components/ui/H3';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { db } from '~/utils/db.server';
import { requireSessionData, SessionData } from '~/utils/session.server';

export const meta: MetaFunction = () => {
    return [{ title: 'About' }, { name: 'description', content: 'Who is the student council?' }];
};

function shuffle(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));

        [array[i], array[j]] = [array[j], array[i]];
    }
}

// TODO: Get dynamically from backend
export async function loader({ request }: LoaderFunctionArgs) {
    const session = await requireSessionData(request);

    const members = await db.councilMember.findMany();

    shuffle(members);

    return { councilMembers: members, session } satisfies LoaderData;
}

type LoaderData = {
    councilMembers: Prisma.CouncilMemberGetPayload<{}>[];
    session: SessionData;
};

export default function About() {
    const data = useLoaderData<LoaderData>();

    return (
        <div>
            <NavBar login={data.session.login} role={data.session.role} />
            <div className='mb-8 mt-8 md:mt-16 flex flex-col items-center'>
                <div className='flex flex-col md:flex-row md:items-center justify-center'>
                    <div className='mx-4'>
                        <div className='mb-4'>
                            <H1 className='mb-8 text-center'>What is the Student Council?</H1>
                            <p className='text-xl text-center'>
                                We are students who have been elected by you and your peers.
                                <br />
                                We represent the student body in the school's decision making process.
                                <br />
                                This platform allows you to anonymously share thoughts, ideas, and concerns with the
                                community.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className='flex flex-col md:flex-row md:flex-wrap md:justify-center md:mx-24'>
                {data.councilMembers.map((member) => (
                    <div key={member.email} className='md:w-1/4 md:mx-20 flex flex-col items-center mb-8'>
                        <Avatar className='rounded-xl size-60'>
                            <AvatarImage src={member.profilePictureUrl} className='object-cover' />
                            <AvatarFallback>{member.firstName.slice(0, 2)}</AvatarFallback>
                        </Avatar>

                        <H3 className='mt-4'>
                            {member.firstName} {member.lastName}
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
