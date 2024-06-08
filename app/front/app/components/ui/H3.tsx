import type { ReactNode } from 'react';
import classNames from 'classnames';

export function H3({ children, className }: { children: ReactNode; className?: string }) {
    return <h2 className={classNames('scroll-m-20 text-2xl font-semibold tracking-tight', className)}>{children}</h2>;
}
