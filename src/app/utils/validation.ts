import { z } from 'zod';

type FieldErrors = Record<string, string>;

export function validateForm<T extends z.Schema>(
    formData: FormData,
    zodSchema: T,
    errorFn: (error: FieldErrors) => unknown,
    successFn: (data: z.infer<T>) => unknown,
) {
    const result = zodSchema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
        const errors: FieldErrors = {};
        for (const issue of result.error.issues) {
            const path = issue.path.join('.');
            errors[path] = issue.message;
        }

        return errorFn(errors);
    }

    return successFn(result.data);
}
