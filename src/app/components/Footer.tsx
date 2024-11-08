import { Link, useLoaderData } from '@remix-run/react';
import classNames from 'classnames';
import { GitCommitHorizontal, Heart } from 'lucide-react';
import { wrapper } from '~/lib/layout';
import { LoaderData } from '~/routes/_app';
import { GitHub } from './icon/GitHub';

export function Footer() {
    const { commit } = useLoaderData<LoaderData>();

    return (
        <footer
            className='sticky border-t'
            style={{
                height: 'fit-content',
                top: '100vh',
            }}
        >
            <div
                className={classNames(
                    wrapper,
                    'flex flex-col gap-y-3 gap-x-7 justify-center items-center sm:flex-row sm:justify-between text-sm',
                )}
            >
                <div className='sm:text-center'>
                    Made with <Heart className='text-rose-500 fill-current size-5' /> by the{' '}
                    <Link to='/about' className='hover:underline'>
                        Student Council
                    </Link>
                </div>

                <div className='flex gap-4'>
                    <Link
                        to={`https://github.com/42-student-council/website/commits/${commit}`}
                        className='hover:underline flex gap-1.5 items-center text-muted-foreground'
                    >
                        <GitCommitHorizontal className='size-4' />
                        {commit}
                    </Link>

                    <Link
                        to='https://github.com/42-student-council/website/issues'
                        className='hover:underline flex gap-2 items-center'
                    >
                        <GitHub className='size-4' /> Found a bug?
                    </Link>
                </div>
            </div>
        </footer>
    );
}
