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
            <div className='w-full px-6 py-2 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-x-7 gap-y-3'>
                <div className='text-sm sm:text-center p-2'>
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
