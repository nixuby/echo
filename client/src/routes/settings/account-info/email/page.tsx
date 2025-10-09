import Layout from '@/components/layout/layout';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import TextBox from '@/components/shared/textbox';
import Button from '@/components/shared/button';
import { useForm } from 'react-hook-form';
import { useChangeEmailMutation } from '@/redux/settings/settings-api';
import { useState } from 'react';
import { setUser } from '@/redux/auth/auth-slice';
import { zodResolver } from '@hookform/resolvers/zod';
import { changeEmailFormSchema } from '@shared/validation';
import TitleBar from '@/components/layout/titlebar';
import { Link } from 'react-router';
import { t } from '@/i18next';
import protectedRoute from '@/components/protected-route';

type ChangeEmailForm = {
    email: string;
};

export default function EmailPage() {
    return protectedRoute(() => {
        const dispatch = useAppDispatch();
        const user = useAppSelector((s) => s.auth.user)!;
        const [changeEmail, { isLoading }] = useChangeEmailMutation();
        const [success, setSuccess] = useState<[boolean, string]>([false, '']);

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
                .then(({ user, token }) => {
                    setSuccess([true, token]);
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
            <Layout title={t('settings.label')}>
                <div className='flex flex-col'>
                    <TitleBar>{t('settings.change-email.label')}</TitleBar>
                    <form
                        className='flex w-[min(100%,350px)] flex-col gap-2 px-4 py-2'
                        onSubmit={onSubmit(handleSubmit)}
                    >
                        <p className='text-sm text-gray-400'>
                            {t('settings.change-email.description')}
                        </p>

                        {user?.email && (
                            <p className='text-sm text-gray-400'>
                                {user?.isEmailVerified
                                    ? t('settings.current-email-verified')
                                    : t('settings.current-email-unverified')}
                            </p>
                        )}

                        <TextBox
                            label={t('settings.change-email.label')}
                            {...register('email')}
                            error={errors.email?.message}
                            disabled={success[0]}
                        />
                        {errors.root && (
                            <div className='border border-red-400/40 bg-red-400/20 px-4 py-2 text-sm text-red-400'>
                                {errors.root.message}
                            </div>
                        )}
                        {success[0] ? (
                            <div className='border border-green-400/40 bg-green-400/20 px-4 py-2 text-sm text-green-400'>
                                {t('settings.change-email.success')}{' '}
                                <Link
                                    to={`/verify-email/${success[1]}`}
                                    className='text-xs underline'
                                >
                                    {t('settings.change-email.verify')}
                                </Link>
                            </div>
                        ) : (
                            <Button
                                submit
                                disabled={isLoading || email === user?.email}
                            >
                                {t('confirm')}
                            </Button>
                        )}
                    </form>
                </div>
            </Layout>
        );
    });
}
