import AuthLayout from '@/components/auth/auth-layout';
import Button from '@/components/shared/button';
import TextBox from '@/components/shared/textbox';
import { t, tErr } from '@/i18next';
import { useRequestPasswordResetMutation } from '@/redux/auth/auth-api';
import { zodResolver } from '@hookform/resolvers/zod';
import { emailSchema } from '@shared/validation';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import z from 'zod';

export type RequestResetPasswordForm = {
    email: string;
};

const schema = z.object({
    email: emailSchema,
});

export default function RequestResetPasswordPage() {
    const {
        register,
        formState: { errors },
        handleSubmit: onSubmit,
        setError,
    } = useForm<RequestResetPasswordForm>({
        defaultValues: { email: '' },
        resolver: zodResolver(schema),
    });
    const [requestPasswordReset, { isLoading, data, isSuccess, isError }] =
        useRequestPasswordResetMutation();

    function handleSubmit(form: RequestResetPasswordForm) {
        requestPasswordReset(form).then((res) => {
            if (res.error) {
                setError('root', {
                    message:
                        (res.error as any).data?.errors?.root ||
                        t('errors.unknown'),
                });
            }
        });
    }

    return (
        <AuthLayout title={t('reset-password.label')}>
            <form
                className='flex flex-col gap-4'
                onSubmit={onSubmit(handleSubmit)}
            >
                <TextBox
                    label={t('reset-password.email')}
                    {...register('email')}
                    disabled={isSuccess || isError}
                    error={tErr(errors?.email?.message)}
                />
                {errors.root && (
                    <div className='border border-red-400/40 bg-red-400/20 px-4 py-2 text-sm text-red-400'>
                        {tErr(errors.root.message)}
                    </div>
                )}
                {data ? (
                    <div className='border border-green-400/40 bg-green-400/20 px-4 py-2 text-sm text-green-400'>
                        {t('reset-password.email-success')} (
                        <Link
                            to={`/reset-password/${data.token}`}
                            className='text-xs underline'
                        >
                            {t('reset-password.reset-link')}
                        </Link>
                        )
                    </div>
                ) : (
                    <Button submit disabled={isLoading || isSuccess || isError}>
                        {t('confirm')}
                    </Button>
                )}
            </form>
        </AuthLayout>
    );
}
