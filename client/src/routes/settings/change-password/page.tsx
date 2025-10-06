import Layout from '@/components/layout/layout';
import TitleBar from '@/components/layout/titlebar';
import ProtectedRoute from '@/components/protected-route';
import Button from '@/components/shared/button';
import TextBox from '@/components/shared/textbox';
import { t, tErr } from '@/i18next';
import { useChangePasswordMutation } from '@/redux/settings/settings-api';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordFormSchema } from '@shared/validation';
import { useForm } from 'react-hook-form';

type ChangePasswordForm = {
    current: string;
    new: string;
    confirm: string;
};

export default function ChangePasswordPage() {
    const [changePassword] = useChangePasswordMutation();
    const {
        register,
        formState: { errors },
        handleSubmit: onSubmit,
    } = useForm<ChangePasswordForm>({
        defaultValues: {
            current: '',
            new: '',
            confirm: '',
        },
        resolver: zodResolver(changePasswordFormSchema),
    });

    function handleSubmit(data: ChangePasswordForm) {
        changePassword(data);
    }

    return (
        <ProtectedRoute>
            <Layout title={t('settings.label')} className='flex flex-col'>
                <TitleBar>{t('settings.change-password.label')}</TitleBar>
                <form
                    className='flex w-[min(100%,350px)] flex-col gap-2 px-4 py-2'
                    onSubmit={onSubmit(handleSubmit)}
                >
                    <TextBox
                        label={t('settings.change-password.current')}
                        error={tErr(errors.current?.message)}
                        {...register('current')}
                    />
                    <TextBox
                        label={t('settings.change-password.new')}
                        error={tErr(errors.new?.message)}
                        {...register('new')}
                    />
                    <TextBox
                        label={t('settings.change-password.confirm')}
                        error={tErr(errors.confirm?.message)}
                        {...register('confirm')}
                    />
                    {errors.root && (
                        <div className='border border-red-400/40 bg-red-400/20 px-4 py-2 text-sm text-red-400'>
                            {tErr(errors.root.message)}
                        </div>
                    )}
                    {/* {success ? (
                            <div className='border border-green-400/40 bg-green-400/20 px-4 py-2 text-sm text-green-400'>
                                {t('settings.change-password.success')}
                            </div>
                        ) : (
                            <Button
                                submit
                                disabled={isLoading || name === user?.name}
                            >
                                {t('confirm')}
                            </Button>
                        )} */}
                    <Button
                        submit
                        // disabled={isLoading || name === user?.name}
                    >
                        {t('confirm')}
                    </Button>
                </form>
            </Layout>
        </ProtectedRoute>
    );
}
