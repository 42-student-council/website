import type { MetaFunction } from '@remix-run/node';
import { Link } from '@remix-run/react';
import { Button } from '~/components/ui/button';

export const meta: MetaFunction = () => {
    return [
        { title: 'Student Council' },
        { name: 'description', content: 'Welcome to the website of the 42 Vienna Student Council.' },
    ];
};

export default function Index() {
    return (
        <div className='flex flex-col items-center justify-center grow'>
            <h1 className='mb-4 text-7xl md:text-8xl font-bold text-center'>
                STUDENT
                <br />
                COUNCIL
            </h1>
            <p className='text-2xl text-center mb-4'>Official Website of the 42 Vienna Student Council</p>
            <Link to='/polls/1'>
                <Button size='lg'>What's up?</Button>
            </Link>
        </div>
    );
}
