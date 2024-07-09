import classNames from 'classnames';
import { HTMLAttributes } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { TriangleAlert } from 'lucide-react';

export function Warning({
    className,
    children,
    title = 'Warning',
    ...props
}: HTMLAttributes<HTMLParagraphElement> & { title?: string }) {
    return (
        <Alert variant='destructive' className={classNames(className)} {...props}>
            <TriangleAlert className='h-4 w-4' />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>{children}</AlertDescription>
        </Alert>
    );
}
