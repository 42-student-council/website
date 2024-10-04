import { Link } from '@remix-run/react';
import { Heart } from 'lucide-react';
import { GitHub } from './icon/GitHub';

export function Footer() {
    return (
        <footer
            className='sticky border-t'
            style={{
                height: 'fit-content',
                top: '100vh',
            }}
        >
            <div className='flex flex-col gap-y-3 gap-x-7 justify-center items-center px-6 py-2 mx-auto max-w-screen-xl sm:flex-row sm:justify-between'>
                <div className='p-2 text-sm sm:text-center'>
                    Made with <Heart className='text-rose-500 fill-current' /> by the{' '}
                    <Link to='/about' target='_blank' className='hover:underline'>
                        Student Council
                    </Link>
                </div>
                <div>
                    <Link
                        to='https://github.com/42-student-council/website/issues'
                        target='_blank'
                        className='hover:underline flex gap-2 items-center p-2'
                    >
                        Found a bug? <GitHub className='size-5' />
                    </Link>
                </div>
            </div>
        </footer>
    );
}
