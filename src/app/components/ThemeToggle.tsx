import { Moon, Sun } from 'lucide-react';
import { Theme, useTheme } from 'remix-themes';

import type React from 'react';
import { Button } from './ui/button';

export function ThemeToggle({ className }: React.HTMLAttributes<HTMLDivElement>) {
    const [currentTheme, setTheme] = useTheme();

    return (
        <Button
            variant='ghost'
            size='icon'
            onClick={() => setTheme(currentTheme === Theme.LIGHT || currentTheme === null ? Theme.DARK : Theme.LIGHT)}
            className={className}
        >
            <Sun className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
            <Moon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
            <span className='sr-only'>Toggle theme</span>
        </Button>
    );
}
