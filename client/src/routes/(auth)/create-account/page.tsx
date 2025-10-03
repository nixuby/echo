import { useForm } from 'react-hook-form';
import AuthLayout from '@/components/auth/auth-layout';
import TextBox from '@/components/shared/textbox';
import Button from '@/components/shared/button';
import { Link, Navigate, useNavigate } from 'react-router';
import { useEffect } from 'react';
import {
    CREATE_ACCOUNT_FORM_DEFAULT,
    type CreateAccountForm,
} from '@/forms/create-account-form';
import CheckBox from '@/components/shared/checkbox';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthProviderButton from '@/components/auth/auth-provider-button';
import { createAccountFormSchema } from '@shared/validation';
import { useCreateAccountMutation } from '@/redux/auth/auth-api';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setUser } from '@/redux/auth/auth-slice';
import { changeLanguage, t, tErr } from '@/i18next';

export default function CreateAccountPage() {
    const navigate = useNavigate();
    const user = useAppSelector((s) => s.auth.user);
    const dispatch = useAppDispatch();
    const [createAccount, { isLoading }] = useCreateAccountMutation();

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

    const passwordValue = watch('password');

    useEffect(() => {
        if (isDirty && isSubmitted) trigger('confirm');
    }, [passwordValue]);

    if (user) return <Navigate replace to='/' />;

    function submitForm(data: CreateAccountForm) {
        createAccount(data)
            .unwrap()
            .then((res) => {
                dispatch(setUser(res.user));
                changeLanguage(res.user.language);
                navigate('/');
            })
            .catch((res) => {
                const error = res?.data?.errors;
                for (const field in error) {
                    setError(field as keyof CreateAccountForm, {
                        message: error[field],
                    });
                }
            });
    }

    return (
        <AuthLayout title={t('create-account')}>
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
                <TextBox
                    label={t('confirm-password')}
                    type='password'
                    error={tErr(errors.confirm?.message)}
                    {...register('confirm')}
                />
                <CheckBox
                    error={tErr(errors.tos?.message)}
                    {...register('tos')}
                >
                    {t('tos-agree')}{' '}
                    <Link
                        to='/tos'
                        className='text-gray-400 transition hover:text-gray-300 hover:underline'
                    >
                        {t('tos')}
                    </Link>
                </CheckBox>
                {errors.root && (
                    <div className='border border-red-400/40 bg-red-400/20 px-4 py-2 text-sm text-red-400'>
                        {tErr(errors.root.message)}
                    </div>
                )}
                <Button submit disabled={isLoading}>
                    {t('create-account')}
                </Button>
                <div className='relative h-px w-full bg-gray-800 text-sm'>
                    <span className='absolute top-0 left-1/2 -mx-2 -translate-y-1/2 bg-gray-950 px-2 text-gray-400'>
                        {t('or')}
                    </span>
                </div>
                <div className='flex flex-col gap-2'>
                    <Link
                        to='/sign-in'
                        className='border border-gray-600 bg-gray-950 px-4 py-2 text-center text-sm font-semibold transition hover:bg-gray-900'
                    >
                        {t('sign-in')}
                    </Link>
                    <AuthProviderButton provider='google' />
                </div>
            </form>
        </AuthLayout>
    );
}
