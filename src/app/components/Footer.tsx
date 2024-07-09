import { Link } from '@remix-run/react';
import { Heart } from 'lucide-react';
import { GitHub } from './icon/GitHub';

export function Footer() {
    return (
        <footer
            className='bg-white rounded-lg shadow m-4 dark:bg-gray-800 sticky'
            style={{
                height: 'fit-content',
                top: '100vh',
            }}
        >
            <div className='w-full mx-auto max-w-screen-xl p-4 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-x-7 gap-y-3'>
                <div className='text-sm text-gray-500 sm:text-center dark:text-gray-400'>
                    Made with <Heart className='text-rose-500 fill-current' /> by the{' '}
                    <Link to='/about' target='_blank' className='hover:underline'>
                        Student Council
                    </Link>
                </div>
                <div>
                    <Link
                        to='https://github.com/42-student-council/website'
                        target='_blank'
                        className='hover:underline'
                    >
                        Found a bug? <GitHub className='size-5' />
                    </Link>
                </div>
            </div>
        </footer>
    );
}
