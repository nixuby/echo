import { useForm } from 'react-hook-form';
import AuthLayout from '../components/auth/auth-layout';
import TextBox from '../components/shared/textbox';
import Button from '../components/shared/button';
import { Link, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import {
    CREATE_ACCOUNT_FORM_DEFAULT,
    createAccountFormSchema,
    type CreateAccountForm,
} from '../forms/create-account-form';
import CheckBox from '../components/shared/checkbox';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';

async function mockCreateAccount(
    body: CreateAccountForm,
): Promise<{ ok: true } | { ok: false; errors: Record<string, string> }> {
    return new Promise((resolve) => {
        setTimeout(() => {
            const valRes = createAccountFormSchema.safeParse(body);

            if (valRes.success) {
                resolve({ ok: true });
            } else {
                const result = {
                    ok: false,
                    errors: {} as Record<string, string>,
                };

                const errorTree = z.treeifyError(valRes.error)
                    .properties as Record<
                    string,
                    { errors: string[] } | undefined
                >;
                for (const err in errorTree) {
                    if (errorTree[err] === undefined) continue;
                    result.errors[err] = errorTree[err].errors[0];
                }

                resolve(result);
            }
        }, 500);
    });
}

export default function SignInRoute() {
    const {
        register,
        handleSubmit,
        formState: { errors, isDirty, isSubmitted },
        setError,
        watch,
        trigger,
    } = useForm<CreateAccountForm>({
        defaultValues: CREATE_ACCOUNT_FORM_DEFAULT,
        resolver: zodResolver(createAccountFormSchema),
    });

    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const passwordValue = watch('password');

    useEffect(() => {
        if (isDirty && isSubmitted) trigger('confirm');
    }, [passwordValue]);

    function submitForm(data: CreateAccountForm) {
        setIsLoading(true);

        mockCreateAccount(data).then((response) => {
            setIsLoading(false);

            if (response.ok) {
                navigate('/');
            } else {
                for (const field in response.errors) {
                    setError(field as keyof CreateAccountForm, {
                        message: response.errors[field],
                    });
                }
            }
        });
    }

    return (
        <AuthLayout title='Create Account'>
            <form
                action=''
                onSubmit={handleSubmit(submitForm)}
                className='flex flex-col gap-4'
            >
                <TextBox
                    label='Username'
                    error={errors.username?.message}
                    {...register('username')}
                />
                <TextBox
                    label='Password'
                    type='password'
                    error={errors.password?.message}
                    {...register('password')}
                />
                <TextBox
                    label='Confirm'
                    type='password'
                    error={errors.confirm?.message}
                    {...register('confirm')}
                />
                <CheckBox error={errors.tos?.message} {...register('tos')}>
                    I agree to the{' '}
                    <Link
                        to='/tos'
                        className='text-gray-400 transition hover:text-gray-300 hover:underline'
                    >
                        Terms of Service
                    </Link>
                </CheckBox>
                {errors.root && (
                    <div className='border border-red-400/40 bg-red-400/20 px-4 py-2 text-sm text-red-400'>
                        {errors.root.message}
                    </div>
                )}
                <Button submit disabled={isLoading}>
                    Create Account
                </Button>
                <div className='relative h-px w-full bg-gray-800 text-sm'>
                    <span className='absolute left-1/2 top-0 -mx-2 -translate-y-1/2 bg-gray-950 px-2 text-gray-400'>
                        or
                    </span>
                </div>
                <div className='w-full text-center'>
                    <Link
                        to='/sign-in'
                        className='text-gray-400 transition-colors hover:text-gray-300 hover:underline'
                    >
                        Sign In
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}
