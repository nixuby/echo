import z from 'zod';

export const createAccountFormSchema = z
    .object({
        username: z
            .string()
            .min(3, 'Username must be at least 3 characters long')
            .max(32, 'Username must be at most 32 characters long'),
        password: z
            .string()
            .min(6, 'Password must be at least 6 characters long')
            .max(128, 'Password must be at most 128 characters long'),
        confirm: z.string().nonempty('Please confirm your password'),
        tos: z.boolean(),
    })
    .refine((data) => data.password === data.confirm, {
        message: 'Passwords must match',
        path: ['confirm'],
    })
    .refine((data) => data.tos, {
        message: 'You must accept the Terms of Service',
        path: ['tos'],
    });
