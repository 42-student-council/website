# Remix Architecture
This section provides an overview of the Remix frontend architecture and instructions on how to add and manage various components like UI elements, routes, and utilities.

## Table of Contents
- [Project Structure](#project-structure)
- [Adding Components](#adding-components)
- [Adding Routes](#adding-routes)
- [Configuring Utilities](#configuring-utilities)

## Project Structure
Our Remix frontend project structure looks like this:
```
src/
│
├── app/
│ ├── components/
│ │ ├── icon/
│ │ ├── ui/
│ ├── lib/
│ ├── routes/
│ ├── utils/
├── public/
│ ├── fonts/
│ ├── img/
├── Dockerfile
├── components.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
└── ...
```

## Adding Components
Components are reusable pieces of UI. They are located in the `app/components` directory.

### shadcn/ui
We use [shadcn/ui](https://ui.shadcn.com/) for our base components. Therefore if
you want to add a compnent, first check whether it is available by shadcn/ui.
If it is just add the component (`npx shadcn-ui@latest add ...`).

### Custom Components
If the component you need is not available by `shadcn/ui` then you can write it
;). All custom components should be in `app/components`, create a subdirectory
if applicable. Please don't put custom components in `app/components/ui` as we
reserve this directory only for `shadcn/ui`.

## Styling Components
Components are styled using [Tailwind CSS](https://tailwindcss.com/docs)
classes.
For adding classes conditionally we use
[Classnames](https://www.npmjs.com/package/classnames). You can imagine the
usage similar to this:
```tsx
<p className={classNames('font-bold text-blue-500', {
    'underline text-blue-600': isActive
})}>
Hello World
</p>
```

## Adding Routes
Routes in Remix define the different pages of your application. They are located
in the `app/routes/` directory. You can read more about the file naming
convention in the
[Remix Docs](https://remix.run/docs/en/main/file-conventions/routes).

## Configuring Utilities
Utilities are helper functions and configurations used across the app. They are
located in the `app/utils/` directory.

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

> [!NOTE]
> When adding code which should not be shared with the end user, then please
> make the file server-only by ending it with the `.server.ts` extension.
> Read more about it in the
> [Remix Docs](https://remix.run/docs/en/main/discussion/server-vs-client#splitting-up-client-and-server-code).

## Conclusion
This documentation should give you a basic overview of the Remix architecture and how to contribute.

**For more details, see**:
- [Remix docs](https://remix.run/docs)
- [Tailwind CSS docs](https://tailwindcss.com/docs)
- [shadcn/ui docs](https://ui.shadcn.com/docs)


Feel free to contribute to this documentation if you think anything is unclear or if you have suggestions for improvements!
