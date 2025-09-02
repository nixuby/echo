import { useForm } from 'react-hook-form';
import AuthLayout from '../components/auth/auth-layout';
import TextBox from '../components/shared/textbox';
import Button from '../components/shared/button';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { SIGN_IN_FORM_DEFAULT, type SignInForm } from '../forms/sign-in-form';

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

        mockSignIn(data).then((response) => {
            setIsLoading(false);

            if (response.ok) {
                navigate('/');
            } else {
                for (const field in response.errors) {
                    setError(field as keyof SignInForm, {
                        message: response.errors[field],
                    });
                }
            }
        });
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
            </form>
        </AuthLayout>
    );
}
