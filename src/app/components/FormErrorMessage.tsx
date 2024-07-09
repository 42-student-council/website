import classNames from 'classnames';
import { HTMLAttributes } from 'react';

type ErrorMessageProps = HTMLAttributes<HTMLParagraphElement>;

export function FormErrorMessage({ className, ...props }: ErrorMessageProps) {
    if (!props.children) return null;

    return <p {...props} className={classNames('text-red-600 text-xs', className)} />;
}
