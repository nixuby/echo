import { useForm } from 'react-hook-form';
import AuthLayout from '../components/auth/auth-layout';
import TextBox from '../components/shared/textbox';
import Button from '../components/shared/button';
import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import { SIGN_IN_FORM_DEFAULT, type SignInForm } from '../forms/sign-in-form';
import AuthProviderButton from '../components/auth/auth-provider-button';

async function mockSignIn(
    body: SignInForm,
): Promise<{ ok: true } | { ok: false; errors: Record<string, string> }> {
    return new Promise((resolve) => {
        setTimeout(() => {
            const { username, password } = body;
            if (username === 'admin' && password === '123456') {
                resolve({
                    ok: true,
                });
            }

            resolve({
                ok: false,
                errors: {
                    root: 'Invalid username or password',
                },
            });
        }, 500);
    });
}

export default function SignInRoute() {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<SignInForm>({ defaultValues: SIGN_IN_FORM_DEFAULT });

    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    function submitForm(data: SignInForm) {
        setIsLoading(true);

        fetch('http://localhost:5179/api/auth/sign-in', {
            body: JSON.stringify(data),
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((res) => res.json())
            .then((res) => {
                setIsLoading(false);
                console.log(res);
            });

        // mockSignIn(data).then((response) => {
        //     setIsLoading(false);

        //     if (response.ok) {
        //         navigate('/');
        //     } else {
        //         for (const field in response.errors) {
        //             setError(field as keyof SignInForm, {
        //                 message: response.errors[field],
        //             });
        //         }
        //     }
        // });
    }

    return (
        <AuthLayout title='Sign In'>
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
                {errors.root && (
                    <div className='border border-red-400/40 bg-red-400/20 px-4 py-2 text-sm text-red-400'>
                        {errors.root.message}
                    </div>
                )}
                <Button submit disabled={isLoading}>
                    Sign In
                </Button>
                <Link
                    to='/reset-password'
                    className='self-start text-gray-400 transition-colors hover:text-gray-300 hover:underline'
                >
                    Forgot Password
                </Link>
                <div className='relative h-px w-full bg-gray-800 text-sm'>
                    <span className='absolute top-0 left-1/2 -mx-2 -translate-y-1/2 bg-gray-950 px-2 text-gray-400'>
                        or
                    </span>
                </div>
                <div className='flex flex-col gap-2'>
                    <Link
                        to='/create-account'
                        className='border border-gray-600 bg-gray-950 px-4 py-2 text-center text-sm font-semibold transition hover:bg-gray-900'
                    >
                        Create Account
                    </Link>
                    <AuthProviderButton type='signin' provider='google' />
                    <AuthProviderButton type='signin' provider='apple' />
                </div>
            </form>
        </AuthLayout>
    );
}
