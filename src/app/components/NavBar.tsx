import { HTMLAttributes, useState } from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { MenuIcon, Home, Info, TriangleAlert, MessageCircle, DoorOpen, Settings, CirclePlus, Moon, Sun } from 'lucide-react';
import { Form, Link, NavLink, useLocation } from '@remix-run/react';
import classNames from 'classnames';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ScrollArea } from './ui/scroll-area';

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

function User({ login, role, toggleDarkMode, isDarkMode }: { login: string; role: 'ADMIN' | 'USER'; toggleDarkMode: () => void; isDarkMode: boolean } & HTMLAttributes<HTMLDivElement>) {
    const location = useLocation();

    return (
        <div className='flex items-center font-bold text-slate-500'>
            <button onClick={toggleDarkMode} className='mr-4 p-2'>
                {isDarkMode ? <Sun className='w-6 h-6' /> : <Moon className='w-6 h-6' />}
            </button>
            <DropdownMenu>
                <DropdownMenuTrigger className='flex-row font-bold text-slate-600 hover:text-slate-800 transition-colors duration-300'>
                    <span className='mr-2'>{login}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {role === 'ADMIN' && (
                        <>
                            <Link to='/admin'>
                                <DropdownMenuItem className='font-bold hover:underline hover:cursor-pointer'>
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

function MainNav({ login, role, toggleDarkMode, isDarkMode }: { login: string; role: 'ADMIN' | 'USER'; toggleDarkMode: () => void; isDarkMode: boolean }) {
    return (
        <div className='hidden md:flex flex-row justify-between w-full items-center'>
            <div className='mr-4 gap-2 flex'>
                {navItems.map((item, index) => (
                    <NavLink
                        key={item.href}
                        to={item.href}
                        className={({ isActive, isPending }) => {
                            return classNames('text-primary underline-offset-4 hover:underline', 'px-2 py-2', {
                                ' underline font-bold': isActive,
                            });
                        }}
                        end
                    >
                        {item.label}
                    </NavLink>
                ))}
            </div>
            <User login={login} role={role} toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
        </div>
    );
}

function MobileNav({ login, role, toggleDarkMode, isDarkMode }: { login: string; role: 'ADMIN' | 'USER'; toggleDarkMode: () => void; isDarkMode: boolean }) {
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
                    <User login={login} role={role} toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
                </div>

                <SheetContent side='left'>
                    <ScrollArea className='w-full h-full'>
                        <div className='flex flex-col items-start'>
                            <div className='mb-6 font-bold uppercase text-gray-600'>Student Council</div>
                            <div className='flex flex-col justify-between	'>
                                <div>
                                    {navItems.map((item, index) => (
                                        <NavLink
                                            key={index}
                                            to={item.href}
                                            className={({ isActive, isPending }) => {
                                                return classNames('mb-4 flex flex-row items-center', {
                                                    'font-bold': isActive,
                                                });
                                            }}
                                            onClick={() => {
                                                setOpen(false);
                                            }}
                                            end
                                        >
                                            <item.icon className='size-5 mr-4' /> <p>{item.label}</p>
                                        </NavLink>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </SheetContent>
            </Sheet>
        </div>
    );
}

export default function NavBar({ login, role, toggleDarkMode, isDarkMode }: { login: string; role: 'ADMIN' | 'USER'; toggleDarkMode: () => void; isDarkMode: boolean }) {
    return (
        <header className='w-full border-b'>
            <div className='flex h-14 items-center px-4'>
                <MainNav login={login} role={role} toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
                <MobileNav login={login} role={role} toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
            </div>
        </header>
    );
}

// import { NavLink } from "@remix-run/react";
// import classNames from "classnames";
// import { Handshake, HardHat, Info } from "lucide-react";

// export function Header() {

// 	return (
// 		<header className="mt-2 border-b pb-2 px-2">
// 			<nav className="flex flex-row justify-between items-center mx-2 md:mx-10">
// 				<ul className="flex flex-row font-bold text-slate-600 space-x-3 md:space-x-5 ">
// 					<li>
// 						<NavLink
// 							to="/about"
// 							className={({ isActive, isPending }) =>
// 								classNames({
// 									"text-slate-600 hover:text-blue-600 transition-colors duration-300":
// 										!isActive && !isPending,
// 									"text-blue-600": isActive,
// 									"text-blue-600 animate-pulse": isPending,
// 								})
// 							}
// 						>
// 							<Info className="size-5 mr-1" /> About
// 						</NavLink>
// 					</li>
// 					<li>
// 						<NavLink
// 							to="/issues"
// 							className={({ isActive, isPending }) =>
// 								classNames({
// 									"text-slate-600 hover:text-green-500 transition-colors duration-300":
// 										!isActive && !isPending,
// 									"text-green-500": isActive,
// 									"text-green-500 animate-pulse": isPending,
// 								})
// 							}
// 						>
// 							<HardHat className="size-5 mr-1" />
// 							Issues
// 						</NavLink>
// 					</li>
// 				</ul>
// 			</nav>
// 		</header>
// 	);
// }

// export default Header;
