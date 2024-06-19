import classNames from 'classnames';
import { HTMLAttributes } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Info as InfoIcon } from 'lucide-react';

export function Info({
    className,
    children,
    title = 'Info',
    ...props
}: HTMLAttributes<HTMLParagraphElement> & { title?: string }) {
    return (
        <Alert variant='info' className={className} {...props}>
            <InfoIcon className='h-4 w-4' />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>{children}</AlertDescription>
        </Alert>
    );
}
