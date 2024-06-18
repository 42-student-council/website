import type { ReactNode } from 'react';
import classNames from 'classnames';

export function Blockquote({ children, className }: { children: ReactNode; className?: string }) {
    return <blockquote className={classNames('mt-6 border-l-2 pl-6 italic', className)}>{children}</blockquote>;
}
