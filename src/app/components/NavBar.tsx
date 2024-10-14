import { Form, Link, NavLink, useLocation } from '@remix-run/react';
import classNames from 'classnames';
import { CirclePlus, DoorOpen, Home, Info, MenuIcon, MessageCircle, Settings, TriangleAlert } from 'lucide-react';
import { HTMLAttributes, useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ScrollArea } from './ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

const navItems = [
    {
        label: 'Home',
        href: '/',
        icon: Home,
    },
    {
        label: 'Issues',
        href: '/issues',
        icon: TriangleAlert,
    },
    {
        label: 'New Issue',
        href: '/issues/new',
        icon: CirclePlus,
    },
    {
        label: 'Contact',
        href: '/contact',
        icon: MessageCircle,
    },
    {
        label: 'About',
        href: '/about',
        icon: Info,
    },
];

function User({ login, role }: { login: string; role: 'ADMIN' | 'USER' } & HTMLAttributes<HTMLDivElement>) {
    const location = useLocation();

    return (
        <div className='font-bold'>
            <DropdownMenu>
                <DropdownMenuTrigger className='p-2 hover:bg-accent rounded-md'>{login}</DropdownMenuTrigger>
                <DropdownMenuContent>
                    {role === 'ADMIN' && (
                        <>
                            <Link to='/admin'>
                                <DropdownMenuItem className='font-bold hover:cursor-pointer'>
                                    <Settings className='size-5 mr-2' /> Admin
                                </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                        </>
                    )}

                    <DropdownMenuItem className='text-red-500 font-bold focus:bg-red-100 focus:text-red-600'>
                        <Form method='post' action='/sign-out'>
                            <input type='hidden' name='_action' value='sign-out' />
                            <input type='hidden' name='redirectTo' value={location.pathname} />
                            <button type='submit'>
                                <DoorOpen className='size-5 mr-2' /> Sign Out
                            </button>
                        </Form>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

function MainNav({ login, role }: { login: string; role: 'ADMIN' | 'USER' }) {
    return (
        <div className='hidden flex-row gap-2 justify-between items-center px-6 mx-auto w-full max-w-screen-xl md:flex'>
            <div className='gap-2 flex'>
                {navItems.map((item) => (
                    <NavLink
                        key={item.href}
                        to={item.href}
                        className={({ isActive }) => {
                            return classNames('underline-offset-4 hover:underline', 'p-2', {
                                'underline font-bold': isActive,
                            });
                        }}
                        end
                    >
                        {item.label}
                    </NavLink>
                ))}
            </div>
            <div className='flex gap-2 items-center'>
                <ThemeToggle />
                <User login={login} role={role} />
            </div>
        </div>
    );
}

function MobileNav({ login, role }: { login: string; role: 'ADMIN' | 'USER' }) {
    const [open, setOpen] = useState(false);

    return (
        <div className='md:hidden w-full'>
            <Sheet open={open} onOpenChange={setOpen}>
                <div className='flex flex-row items-center justify-between w-full'>
                    <SheetTrigger asChild>
                        <Button variant='ghost' size='icon' className='md:hidden'>
                            <MenuIcon />
                        </Button>
                    </SheetTrigger>
                    <div className='flex gap-2 items-center'>
                        <ThemeToggle />
                        <User login={login} role={role} />
                    </div>
                </div>

                <SheetContent side='left'>
                    <ScrollArea className='w-full h-full'>
                        <div className='flex flex-col items-start'>
                            <div className='mb-6 font-bold uppercase'>Student Council</div>
                            <div className='flex flex-col justify-between'>
                                {navItems.map((item, index) => (
                                    <NavLink
                                        key={index}
                                        to={item.href}
                                        className={({ isActive }) => {
                                            return classNames('mb-4 flex flex-row items-center', {
                                                'font-bold': isActive,
                                            });
                                        }}
                                        onClick={() => {
                                            setOpen(false);
                                        }}
                                        end
                                    >
                                        <item.icon className='size-5 mr-4' />
                                        <p>{item.label}</p>
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    </ScrollArea>
                </SheetContent>
            </Sheet>
        </div>
    );
}

export default function NavBar({ login, role }: { login: string; role: 'ADMIN' | 'USER' }) {
    return (
        <header className='w-full border-b'>
            <div className='flex items-center px-2 h-14 md:px-0'>
                <MainNav login={login} role={role} />
                <MobileNav login={login} role={role} />
            </div>
        </header>
    );
}
