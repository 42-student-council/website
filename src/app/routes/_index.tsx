import type { MetaFunction } from '@remix-run/node';
import { Button } from '~/components/ui/button';
import { Link } from '@remix-run/react';

export const meta: MetaFunction = () => {
    return [
        { title: 'Student Council' },
        { name: 'description', content: 'Welcome to the website of the 42 Vienna Student Council.' },
    ];
};

export default function Index() {
    return (
        <div className='flex flex-col min-h-screen'>
            <div className='flex flex-col items-center justify-center flex-1'>
                <div className='flex flex-col items-center mb-4 text-7xl md:text-8xl font-bold text-center'>
                    <p>STUDENT</p>
                    <p>COUNCIL</p>
                </div>
                <p className='text-2xl text-center text-slate-600 mb-4'>
                    Official Website of the 42 Vienna Student Council
                </p>
                <Link to='/issues/new'>
                    <Button>Have a problem?</Button>
                </Link>
            </div>
        </div>
    );
}
