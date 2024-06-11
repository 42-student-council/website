# Remix Architecture
This section provides an overview of the Remix frontend architecture and instructions on how to add and manage various components like UI elements, routes, and utilities.

## Table of Contents
- [Project Structure](#project-structure)
- [Adding Components](#adding-components)
- [Adding Routes](#adding-routes)
- [Configuring Utilities](#configuring-utilities)

## Project Structure
Our Remix frontend project structure looks like this:
```css
front/
│
├── app/
│ ├── components/
│ │ ├── icon/
│ │ │ └── 42.tsx
│ │ ├── ui/
│ │ │ ├── H1.tsx
│ │ │ ├── ...
│ │ └── NavBar.tsx
│ ├── lib/
│ │ └── utils.ts
│ ├── routes/
│ │ ├── _index.tsx
│ │ ├── ...
│ ├── utils/
│ │ ├── config.server.ts
│ │ ├── ...
│ ├── entry.client.tsx
│ ├── entry.server.tsx
│ ├── root.tsx
│ └── tailwind.css
├── public/
│ ├── fonts/
│ │ ├── ...
│ ├── img/
│ │ └── ...
│ └── favicon.ico
├── Dockerfile
├── biome.json
├── components.json
├── package-lock.json
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
└── ...
```

## Adding Components
Components are reusable pieces of UI. They are located in the `app/components` directory.

### Example: Adding a new UI Component
1. **Create the Component**: Create a new file in `app/components/ui/` (e.g., `card.tsx`).
```tsx
import * as React from 'react';

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)} {...props} />
));
Card.displayName = 'Card';
```
2. **Use the Component**: Import and use the component in any other part of your application.
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/Card';

const ExamplePage: React.FC = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Example Card</CardTitle>
            </CardHeader>
            <CardContent>
                <p>This is an example card component.</p>
            </CardContent>
        </Card>
    );
};

export default ExamplePage;
```

## Styling Components
Components are styled using Tailwind CSS classes and utility functions. The `cn` utility function is used to merge class names.

### Example: Styling a Component
In the `card` component above, we use several Tailwind CSS classes like `rounded-lg`, `border`, `bg-card` and `text-card-foreground` to style the component.

### Utility Function: `cn` 
The `cn` utility function helps in conditionally merging class names.
```tsx
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
```

## Adding Routes
Routes in Remix define the different pages of your application. They are located in the `app/routes/` directory.

### Example: Adding a New Route
1. **Create the Route**: Create a new file in `app/routes/` (e.g, `about.tsx`).
```tsx
import React from 'react';

export default function About() {
    return (
        <div>
            <h1>About Us</h1>
            <p>This is the about page.</p>
        </div>
    );
};
```
2. **Access the Route**: Navigate to `/about` in the app to see the new route.

## Configuring Utilities
Utilities are helper functions and configurations used across the app. They are located in the `app/utils/` directory.

### Example: Adding a Utility Function
1. **Create the Utility**: Create a new file in `app/utils/` (e.g., `math.ts`).
```tsx
export const add = (a: number, b: number): number => {
    return a + b;
};
```
2. **Use the Utility**: Import and use the utility function in any other part of the app.
```tsx
import { add } from '~/utils/math';

export default NewFunction {
    const sum = add(2, 3);
    return (
        <div>
            <p>The sum is: {sum}</p>
        </div>
    );
};
```

## Conclusion
This documentation should give you a basic overview of the Remix architecture and how to contribute.

**For more details, see**:
- [Remix docs](https://remix.run/docs)
- [Tailwind CSS docs](https://tailwindcss.com/docs)
- [shadcn/ui docs](https://ui.shadcn.com/docs)


Feel free to contribute to this documentation if you think anything is unclear or if you have suggestions for improvements!
