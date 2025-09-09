import Layout from '@/components/layout/layout';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import ProtectedRoute from '@/components/protected-route';
import TextBox from '@/components/shared/textbox';
import Button from '@/components/shared/button';
import { useForm } from 'react-hook-form';
import { useChangeEmailMutation } from '@/redux/settings/settings-api';
import { useState } from 'react';
import { setUser } from '@/redux/auth/auth-slice';
import { zodResolver } from '@hookform/resolvers/zod';
import { changeEmailFormSchema } from '@shared/validation';
import TitleBar from '@/components/layout/titlebar';

type ChangeEmailForm = {
    email: string;
};

export default function EmailPage() {
    const dispatch = useAppDispatch();
    const user = useAppSelector((s) => s.auth.user)!;
    const [changeEmail, { isLoading }] = useChangeEmailMutation();
    const [success, setSuccess] = useState<boolean>(false);

    const {
        register,
        handleSubmit: onSubmit,
        formState: { errors },
        setError,
        watch,
    } = useForm<ChangeEmailForm>({
        defaultValues: {
            email: user?.email ?? '',
        },
        resolver: zodResolver(changeEmailFormSchema),
    });

    const email = watch('email');

    function handleSubmit(data: ChangeEmailForm) {
        changeEmail(data)
            .unwrap()
            .then(({ user }) => {
                setSuccess(true);
                dispatch(setUser(user));
            })
            .catch((res) => {
                if (!res?.data?.errors) return;
                const errors = res.data.errors as Record<string, string>;
                for (const field in errors) {
                    setError(field as keyof ChangeEmailForm, {
                        message: errors[field],
                    });
                }
            });
    }

    return (
        <ProtectedRoute>
            <Layout title='Settings / Account Information'>
                <div className='flex flex-col'>
                    <TitleBar>Change Email</TitleBar>
                    <form
                        className='flex w-[min(100%,350px)] flex-col gap-2 px-4 py-2'
                        onSubmit={onSubmit(handleSubmit)}
                    >
                        <p className='text-sm text-gray-400'>
                            You will receive a confirmation email at your new
                            email address.
                        </p>

                        {user?.email && (
                            <p className='text-sm text-gray-400'>
                                Your current email is{' '}
                                {!user?.isEmailVerified && (
                                    <span className='font-bold'>not</span>
                                )}{' '}
                                verified.
                            </p>
                        )}

                        <TextBox
                            label='Email'
                            {...register('email')}
                            error={errors.email?.message}
                            disabled={success}
                        />
                        {errors.root && (
                            <div className='border border-red-400/40 bg-red-400/20 px-4 py-2 text-sm text-red-400'>
                                {errors.root.message}
                            </div>
                        )}
                        {success ? (
                            <div className='border border-green-400/40 bg-green-400/20 px-4 py-2 text-sm text-green-400'>
                                Email changed successfully!
                            </div>
                        ) : (
                            <Button
                                submit
                                disabled={isLoading || email === user?.email}
                            >
                                Save
                            </Button>
                        )}
                    </form>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
