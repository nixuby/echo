import AuthLayout from '@/components/auth/auth-layout';
import Button from '@/components/shared/button';
import TextBox from '@/components/shared/textbox';
import { t, tErr } from '@/i18next';
import { useResetPasswordMutation } from '@/redux/auth/auth-api';
import { zodResolver } from '@hookform/resolvers/zod';
import { passwordSchema } from '@shared/validation';
import { useForm } from 'react-hook-form';
import { Link, useParams } from 'react-router';
import z from 'zod';

type ResetPasswordForm = {
    password: string;
    confirm: string;
};

const schema = z
    .object({
        password: passwordSchema,
        confirm: z.string().nonempty('confirm'),
    })
    .refine((data) => data.password === data.confirm, {
        message: 'password.mismatch',
        path: ['confirm'],
    });

export default function ResetPasswordPage() {
    const token = useParams().token;

    const {
        register,
        formState: { errors },
        handleSubmit: onSubmit,
    } = useForm<ResetPasswordForm>({
        defaultValues: { password: '', confirm: '' },
        resolver: zodResolver(schema),
    });

    const [resetPassword, { isLoading, data }] = useResetPasswordMutation();

    function handleSubmit(form: ResetPasswordForm) {
        if (!token) return;
        resetPassword({ ...form, token });
    }

    return (
        <AuthLayout title={t('reset-password.label')}>
            <form
                className='flex flex-col gap-4'
                onSubmit={onSubmit(handleSubmit)}
            >
                <TextBox
                    type='password'
                    label={t('password')}
                    error={tErr(errors?.password?.message)}
                    {...register('password')}
                />
                <TextBox
                    type='password'
                    label={t('confirm-password')}
                    error={tErr(errors?.confirm?.message)}
                    {...register('confirm')}
                />
                {errors.root && (
                    <div className='border border-red-400/40 bg-red-400/20 px-4 py-2 text-sm text-red-400'>
                        {tErr(errors.root.message)}
                    </div>
                )}
                {data === null ? (
                    <div className='flex flex-col gap-2'>
                        <div className='border border-green-400/40 bg-green-400/20 px-4 py-2 text-sm text-green-400'>
                            {t('reset-password.success')}
                        </div>
                        <Link
                            to='/sign-in'
                            className='border border-indigo-600 bg-indigo-800 px-4 py-2 text-center hover:bg-indigo-700'
                        >
                            {t('sign-in')}
                        </Link>
                    </div>
                ) : (
                    <Button submit disabled={isLoading}>
                        {t('confirm')}
                    </Button>
                )}
            </form>
        </AuthLayout>
    );
}
