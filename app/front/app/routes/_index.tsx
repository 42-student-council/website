import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import NavBar from '~/components/NavBar';
import { H2 } from '~/components/ui/H2';
import { H3 } from '~/components/ui/H3';
import { Button } from '~/components/ui/button';
import { Link } from '@remix-run/react';
import { requireSessionData } from '~/utils/session.server';

export const meta: MetaFunction = () => {
    return [
        { title: 'Student Council' },
        { name: 'description', content: 'Welcome to the website of the 42 Vienna Student Council.' },
    ];
};

export async function loader({ request }: LoaderFunctionArgs) {
    await requireSessionData(request);
    return null;
}

export default function Index() {
    return (
        <div>
            <NavBar />
            <div className='flex flex-col items-center mt-80 mb-80'>
                <div className='flex flex-col items-center mb-4 text-7xl md:text-8xl font-bold'>
                    <p>STUDENT</p>
                    <p>COUNCIL</p>
                </div>
                <p className='text-2xl text-center text-slate-600 mb-4'>
                    Official Website of the 42 Vienna Student Council
                </p>
                <Link to='/issues/new'>
                    <Button className='bg-purple-600 hover:bg-purple-800'>Have a problem?</Button>
                </Link>
            </div>
            <div className='flex flex-col md:flex-row md:items-center'>
                <img
                    src='/img/landing-page.png'
                    alt='Landing Page'
                    className='mx-4 mb-4 rounded md:size-6/12 shadow-md md:shadow-2xl'
                />
                <div className='mx-4'>
                    <div className='mb-4'>
                        <H2 className='mb-2'>What is the Student Council?</H2>
                        <p>
                            We are students who have been elected by you and your peers. We represent the student body
                            in the school's decision making process. This platform allows you to anonymously share
                            thoughts, ideas, and concerns with the community. While your submissions remain anonymous to
                            the public, the student council members will know who submitted what, to ensure accurate and
                            effective representation.
                        </p>
                    </div>
                    <div>
                        <H3>Why?</H3>
                        <ul className='ml-4'>
                            <li>
                                Because we want <span className='font-bold'>everyone to be heard</span>.
                            </li>
                            <li>
                                Because we want <span className='font-bold'>transparent communication</span>.
                            </li>
                            <li>
                                Because we want <span className='font-bold'>to make a difference</span>.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
