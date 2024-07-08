// function should be able to accept an icon, which is an html element and a title

import { Link } from '@remix-run/react';
import classNames from 'classnames';
import { GraduationCap, LucideProps } from 'lucide-react';
import React from 'react';
import { Card, CardContent } from '~/components/ui/card';

function NavigationCard({
    icon: Icon,
    title,
    className,
    to,
    ...props
}: { icon: React.ComponentType<LucideProps>; title: string; to: string } & React.HTMLAttributes<HTMLDivElement>) {
    return (
        <Link to={to}>
            <Card
                className={classNames(className, 'mb-4 mx-4 size-40 md:size-52 flex items-center justify-center')}
                {...props}
            >
                <CardContent className='flex flex-col items-center text-center'>
                    <Icon className='size-16 my-4' />
                    <p>{title}</p>
                </CardContent>
            </Card>
        </Link>
    );
}

export default function AdminIndex() {
    const pages = [{ title: 'Council Members', to: '/admin/council-members', icon: GraduationCap }];

    return (
        <div className='flex flex-row flex-wrap justify-center min-h-screen'>
            {pages.map((page) => (
                <NavigationCard key={page.title} {...page} />
            ))}
        </div>
    );
}
