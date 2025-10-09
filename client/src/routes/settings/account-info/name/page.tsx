import Layout from '@/components/layout/layout';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import TextBox from '@/components/shared/textbox';
import Button from '@/components/shared/button';
import { useForm } from 'react-hook-form';
import { useChangeNameMutation } from '@/redux/settings/settings-api';
import { useState } from 'react';
import { setUser } from '@/redux/auth/auth-slice';
import TitleBar from '@/components/layout/titlebar';
import { t, tErr } from '@/i18next';
import protectedRoute from '@/components/protected-route';

type ChangeNameForm = {
    name: string;
};

export default function NamePage() {
    return protectedRoute(() => {
        const dispatch = useAppDispatch();
        const user = useAppSelector((s) => s.auth.user);
        const [changeName, { isLoading }] = useChangeNameMutation();
        const [success, setSuccess] = useState<boolean>(false);

        const {
            register,
            handleSubmit: onSubmit,
            formState: { errors },
            setError,
            watch,
        } = useForm<ChangeNameForm>({
            defaultValues: {
                name: user?.name ?? '',
            },
        });

        const name = watch('name');

        function handleSubmit(data: ChangeNameForm) {
            changeName(data)
                .unwrap()
                .then(({ user }) => {
                    setSuccess(true);
                    dispatch(setUser(user));
                })
                .catch((res) => {
                    if (!res?.data?.errors) return;
                    const errors = res.data.errors as Record<string, string>;
                    for (const field in errors) {
                        setError(field as keyof ChangeNameForm, {
                            message: errors[field],
                        });
                    }
                });
        }

        return (
            <Layout title={t('settings.label')}>
                <div className='flex flex-col'>
                    <TitleBar>{t('settings.change-name.label')}</TitleBar>
                    <form
                        className='flex w-[min(100%,350px)] flex-col gap-2 px-4 py-2'
                        onSubmit={onSubmit(handleSubmit)}
                    >
                        <p className='text-sm text-gray-400'>
                            {t('settings.change-name.description.0')}
                        </p>
                        <p className='text-sm text-gray-400'>
                            {t('settings.change-name.description.1')}
                        </p>
                        <p className='text-sm text-gray-400'>
                            {t('settings.change-name.description.2')}
                        </p>
                        <TextBox
                            label={t('settings.change-name.label')}
                            {...register('name')}
                            error={tErr(errors.name?.message)}
                            disabled={success}
                        />
                        {errors.root && (
                            <div className='border border-red-400/40 bg-red-400/20 px-4 py-2 text-sm text-red-400'>
                                {tErr(errors.root.message)}
                            </div>
                        )}
                        {success ? (
                            <div className='border border-green-400/40 bg-green-400/20 px-4 py-2 text-sm text-green-400'>
                                {t('settings.change-name.success')}
                            </div>
                        ) : (
                            <Button
                                submit
                                disabled={isLoading || name === user?.name}
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
