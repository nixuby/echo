import { useForm } from 'react-hook-form';
import AuthLayout from '@/components/auth/auth-layout';
import TextBox from '@/components/shared/textbox';
import Button from '@/components/shared/button';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router';
import { SIGN_IN_FORM_DEFAULT, type SignInForm } from '@/forms/sign-in-form';
import AuthProviderButton from '@/components/auth/auth-provider-button';
import { useSignInMutation } from '@/redux/auth/auth-api';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setUser } from '@/redux/auth/auth-slice';
import { changeLanguage, t, tErr } from '@/i18next';

export default function SignInPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const dispatch = useAppDispatch();
    const user = useAppSelector((s) => s.auth.user);
    const [signIn, { isLoading }] = useSignInMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<SignInForm>({ defaultValues: SIGN_IN_FORM_DEFAULT });

    if (user)
        return <Navigate replace to={searchParams.get('redirectTo') ?? '/'} />;

    function submitForm(data: SignInForm) {
        signIn(data)
            .unwrap()
            .then((res) => {
                dispatch(setUser(res.user));
                changeLanguage(res.user.language);
                const redirectTo = searchParams.get('redirectTo') ?? '/';
                navigate(redirectTo);
            })
            .catch((res) => {
                const errors = res.data.errors;

                if (!errors) return;
                for (const field in errors) {
                    setError(field as keyof SignInForm, {
                        message: errors[field],
                    });
                }
            });
    }

    return (
        <AuthLayout title={t('sign-in')}>
            <form
                action=''
                onSubmit={handleSubmit(submitForm)}
                className='flex flex-col gap-4'
            >
                <TextBox
                    label={t('username')}
                    error={tErr(errors.username?.message)}
                    {...register('username')}
                />
                <TextBox
                    label={t('password')}
                    type='password'
                    error={tErr(errors.password?.message)}
                    {...register('password')}
                />
                {errors.root && (
                    <div className='border border-red-400/40 bg-red-400/20 px-4 py-2 text-sm text-red-400'>
                        {tErr(errors.root.message)}
                    </div>
                )}
                <Button submit disabled={isLoading}>
                    {t('sign-in')}
                </Button>
                <Link
                    to='/reset-password'
                    className='self-start text-gray-400 transition-colors hover:text-gray-300 hover:underline'
                >
                    {t('forgot-password')}
                </Link>
                <div className='relative h-px w-full bg-gray-800 text-sm'>
                    <span className='absolute top-0 left-1/2 -mx-2 -translate-y-1/2 bg-gray-950 px-2 text-gray-400'>
                        {t('or')}
                    </span>
                </div>
                <div className='flex flex-col gap-2'>
                    <Link
                        to='/create-account'
                        className='border border-gray-600 bg-gray-950 px-4 py-2 text-center text-sm font-semibold transition hover:bg-gray-900'
                    >
                        {t('create-account')}
                    </Link>
                    <AuthProviderButton provider='google' />
                </div>
            </form>
        </AuthLayout>
    );
}
