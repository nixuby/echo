import z from 'zod';

export const nameSchema = z.string().max(32, 'Name must be at most 32 characters long').optional();

export const usernameSchema = z
    .string()
    .min(3, 'Username must be at least 3 characters long')
    .max(32, 'Username must be at most 32 characters long');

export const passwordSchema = z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(128, 'Password must be at most 128 characters long');

export const emailSchema = z.email('Invalid email address').max(256, 'Email must be at most 256 characters long');

export const createAccountFormSchema = z
    .object({
        username: usernameSchema,
        password: passwordSchema,
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

export const changeEmailFormSchema = z.object({
    email: emailSchema,
});
