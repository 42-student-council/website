import type { ReactNode } from 'react';
import classNames from 'classnames';

export function H4({ children, className }: { children: ReactNode; className?: string }) {
    return <h4 className={classNames('scroll-m-20 text-xl font-semibold tracking-tight', className)}>{children}</h4>;
}
