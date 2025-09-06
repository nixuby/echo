import { useForm } from 'react-hook-form';
import AuthLayout from '../components/auth/auth-layout';
import TextBox from '../components/shared/textbox';
import Button from '../components/shared/button';
import { Link, useNavigate } from 'react-router';
import { SIGN_IN_FORM_DEFAULT, type SignInForm } from '../forms/sign-in-form';
import AuthProviderButton from '../components/auth/auth-provider-button';
import { useSignInMutation } from '../redux/auth/auth-api';
import { useAppDispatch } from '../redux/hooks';
import { setUser } from '../redux/auth/auth-slice';

export default function SignInRoute() {
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<SignInForm>({ defaultValues: SIGN_IN_FORM_DEFAULT });

    const [signIn, { isLoading }] = useSignInMutation();

    const dispatch = useAppDispatch();

    function submitForm(data: SignInForm) {
        signIn(data)
            .unwrap()
            .then((res) => {
                if (res.ok) dispatch(setUser(res.data.user));
                navigate('/');
            })
            .catch((error) => {
                if (error.status === 400) {
                    const errors = error.data.errors;
                    if (!errors) return;
                    for (const field in errors) {
                        setError(field as keyof SignInForm, {
                            message: errors[field],
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
