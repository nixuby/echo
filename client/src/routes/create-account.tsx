import { useForm } from 'react-hook-form';
import AuthLayout from '../components/auth/auth-layout';
import TextBox from '../components/shared/textbox';
import Button from '../components/shared/button';
import { Link, useNavigate } from 'react-router';
import { useEffect } from 'react';
import {
    CREATE_ACCOUNT_FORM_DEFAULT,
    type CreateAccountForm,
} from '../forms/create-account-form';
import CheckBox from '../components/shared/checkbox';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthProviderButton from '../components/auth/auth-provider-button';
import { createAccountFormSchema } from '@shared/validation';
import { useCreateAccountMutation } from '../redux/auth/auth-api';
import { useAppDispatch } from '../redux/hooks';
import { setUser } from '../redux/auth/auth-slice';

export default function CreateAccountRoute() {
    const navigate = useNavigate();

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

    const [createAccount, { isLoading }] = useCreateAccountMutation();

    const dispatch = useAppDispatch();

    const passwordValue = watch('password');

    useEffect(() => {
        if (isDirty && isSubmitted) trigger('confirm');
    }, [passwordValue]);

    function submitForm(data: CreateAccountForm) {
        createAccount(data)
            .unwrap()
            .then((res) => {
                if (res.ok) {
                    dispatch(setUser(res.data.user));
                    navigate('/');
                } else {
                    if (res.data.errors) {
                        for (const field in res.data.errors) {
                            setError(field as keyof CreateAccountForm, {
                                message: res.data.errors[field],
                            });
                        }
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
                    <span className='absolute top-0 left-1/2 -mx-2 -translate-y-1/2 bg-gray-950 px-2 text-gray-400'>
                        or
                    </span>
                </div>
                <div className='flex flex-col gap-2'>
                    <Link
                        to='/sign-in'
                        className='border border-gray-600 bg-gray-950 px-4 py-2 text-center text-sm font-semibold transition hover:bg-gray-900'
                    >
                        Sign In
                    </Link>
                    <AuthProviderButton type='signup' provider='google' />
                    <AuthProviderButton type='signup' provider='apple' />
                </div>
            </form>
        </AuthLayout>
    );
}
