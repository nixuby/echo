import z from 'zod';

export const nameSchema = z.string().max(32, 'Name must be at most 32 characters long').optional();

export const usernameSchema = z
    .string()
    .min(3, 'username.too-short')
    .max(32, 'username.too-long')
    .regex(/^[a-zA-Z][a-zA-Z0-9_]+$/, 'username.invalid');

export const passwordSchema = z.string().min(6, 'password.too-short').max(128, 'password.too-long');

export const emailSchema = z.email('email.invalid').max(256, 'email.too-long');

export const createAccountFormSchema = z
    .object({
        username: usernameSchema,
        password: passwordSchema,
        confirm: z.string().nonempty('confirm'),
        tos: z.boolean(),
    })
    .refine((data) => data.password === data.confirm, {
        message: 'password.mismatch',
        path: ['confirm'],
    })
    .refine((data) => data.tos, {
        message: 'tos',
        path: ['tos'],
    });

export const changeEmailFormSchema = z.object({
    email: emailSchema,
});
